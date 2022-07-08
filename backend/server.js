require('dotenv').config();
const http = require("http");
const express = require('express');
const socketio = require('socket.io');
const path = require("path");
const fs = require("fs");
const { getFiles, readFile } = require("./dirGet");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const { userLogin, getUserData, saveProfile, checkUserSharing } = require("./database");
const PORT = process.env.SERVER_PORT || 5700;
const jwt = require('jsonwebtoken');
const { hashed, addFolder, renameFolder, deleteFolder, moveFolder, shareFolder } = require('./functions');
const app = express();
const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(req.query);
        console.log(req.body);
        console.log(req.data);
        if (!req.body["user"]) {
            cb("Missing Arguments", null);
            return;
        }
        jwt.verify(req.query.cred, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
            if (err) {
                cb("Missing Arguments", `./storage/${hashed(user.usersName)}/home`);
                return;
            }
            const userif = await getUserData(user.usersHash);
            if (userif === "error") {
                cb("Missing Arguments", `./storage/${hashed(user.usersName)}/home`);
                return;
            }
            cb(null, `./storage/${hashed(user.usersName)}/home`);
        });
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({
    storage: fileStorageEngine
});

app.use((req, res, next) => {
    // res.setHeader('Access-Control-Allow-Origin', "https://auth.gruzservices.com"); uncomment this in prod
    res.setHeader('Access-Control-Allow-Origin', "*"); // comment this in prod
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.use(express.json(), express.static('../public'), express.urlencoded({ extended: true }), cookieParser());

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowEIO3: true
    }
  });


app.post("/upload", upload.single("file"), async (req, res) => {
    console.log(req.file)
    console.log(req.body.user);
    res.send("Success.")
});

app.post('/auth', async (req, res) => {
console.log(req.body);
    const newData = req.body;
    const result = await userLogin({hash: newData.data, name: newData.name, email: newData.email, username: newData.username});
    if (result.error !== 200) {
        console.log(result.errorMessage);
        return res.json({ msg:"Something went wrong." });
    }
    delete result.data.userInfo.id;
    const accessToken = jwt.sign(result.data.userInfo, process.env.ACCESS_TOKEN_SECRET);
    io.to(req.body.key).emit('auth', {userData: result.data.userInfo, token: accessToken});
});

app.get("/userData", async (req, res) => {
    if (!req.query["cred"]) {
        return res.json({ msg: "Missing arguments.", status: 400 });
    }
    jwt.verify(req.query.cred, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.json({ msg: 'Invalid input', status: 400 });
        }
        const userif = await getUserData(user.usersHash);
        if (userif == "error") {
            return res.json({ msg: 'Invalid input', status: 400 });
        }
        const user2 = user;
        delete user2.usersHash;
        delete user2.iat;
        res.json({ msg: "Good", userData: user2, status: 200 });
    });
});

app.get("/fetchFiles", async (req, res) => {
    if (!req.query["cred"]) {
        return res.json({ msg: "Missing arguments." });
    }
    jwt.verify(req.query.cred, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const userif = await getUserData(user.usersHash);
        if (userif == "error") {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const files = await getFiles(`./storage/${hashed(user.usersName)}/home`);
        res.json({ msg: "Good", files: files.files , fileSize: String(Math.floor(files.fileSize/10000)/100)+"Mb"});
    });
});

app.get("/fetchSharedFiles", async (req, res) => {
    if (!req.query["cred"]) {
        return res.json({ msg: "Missing arguments." });
    }
    jwt.verify(req.query.cred, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const userif = await getUserData(user.usersHash);
        if (userif == "error") {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const files = await getFiles(`./storage/${hashed(user.usersName)}/shared`);
            res.json({ msg: "Good", files: files.files , fileSize: files.fileSize });;
    });
});

app.get("/getFileData", async (req, res) => {
    if (!req.query["location"] || !req.query["cred"]) {
        return res.json({ msg: "Missing arguments"});
    }
    jwt.verify(req.query.cred, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const userif = await getUserData(user.usersHash);
        if (userif == "error") {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        
        const fileData = await readFile(path.join(__dirname, `./storage/${hashed(user.usersName)}/home`, req.query.location));
        let jsonResult;
        if (fileData === "video") {
            jsonResult = { video: true }
        } else {
            jsonResult = {fileData}
        }
        return res.json(jsonResult);
    });
});

app.get("/getVideoStream", async (req, res) => {
    if (!req.query["location"] || !req.query["cred"]) {
        res.json({ msg: "Missing arguments"});
        return;
    }
    if (!req.headers["range"]) {
        res.status(400).send("Requires Range header");
    }
    
    jwt.verify(req.query.cred, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const userif = await getUserData(user.usersHash);
        if (userif == "error") {
            return res.status(400).json({ msg: 'Invalid input' });
        }

        const range = req.headers.range;
        const videoPath = path.join(__dirname, `./storage/${hashed(user.usersName)}/home`, req.query.location);
        const videoSize = fs.statSync(videoPath).size;
        const CHUNK_SIZE = 10 ** 6;
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        };
        res.writeHead(206, headers);
        const videoStream = fs.createReadStream(videoPath, { start, end });
        videoStream.pipe(res);
    });
});

app.post("/addFolder", async (req, res) => {
    if (!req.query["location"] || !req.query["cred"] || !req.query["name"]) {
        res.json({ msg: "Missing arguments"});
        return;
    }
    jwt.verify(req.query.cred, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const userif = await getUserData(user.usersHash);
        if (userif == "error") {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const addedFolder = await addFolder(req.query.location, req.query.name, user.usersName);
        if (addedFolder === 200) {
            const files = await getFiles(`./storage/${hashed(user.usersName)}/home`);
            res.json({ msg: "Good", files: files.files , fileSize: files.fileSize });
            return;
        }
        res.json({ msg: addedFolder });
    });
});

app.post("/renameFolder", async (req, res) => {
    if (!req.query["location"] || !req.query["cred"] || !req.query["name"]) {
        res.json({ msg: "Missing arguments"});
        return;
    }
    jwt.verify(req.query.cred, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const userif = await getUserData(user.usersHash);
        if (userif == "error") {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const renamedFolder = await renameFolder(req.query.location, req.query.name, user.usersName);
        if (renamedFolder === 200) {
            const files = await getFiles(`./storage/${hashed(user.usersName)}/home`);
            res.json({ msg: "Good", files: files.files, fileSize: files.fileSize });
            return;
        }
        res.json({ msg: renamedFolder });
    });
});

app.post("/deleteFolder", async (req, res) => {
    if (!req.query["location"] || !req.query["cred"]) {
        res.json({ msg: "Missing arguments"});
        return;
    }
    jwt.verify(req.query.cred, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const userif = await getUserData(user.usersHash);
        if (userif == "error") {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const deletedFolder = await deleteFolder(req.query.location, user.usersName);
        if (deletedFolder === 200) {
            const files = await getFiles(`./storage/${hashed(user.usersName)}/home`);
            res.json({ msg: "Good", files: files.files, fileSize: files.fileSize });
            return;
        }
        res.json({ msg: deletedFolder });
    });
});

app.post("/moveFolder", async (req, res) => {
    if (!req.query["location"] || !req.query["cred"] || !req.query["dest"]) {
        res.json({ msg: "Missing arguments"});
        return;
    }
    jwt.verify(req.query.cred, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const userif = await getUserData(user.usersHash);
        if (userif == "error") {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const movedFolder = await moveFolder(req.query.location, user.usersName, req.query.dest);
        if (movedFolder === 200) {
            const files = await getFiles(`./storage/${hashed(user.usersName)}/home`);
            res.json({ msg: "Good", files: files.files, fileSize: files.fileSize });
            return;
        }
        res.json({ msg: movedFolder });
    });
});

app.post("/shareFolder", async (req, res) => {
    if (!req.query["location"] || !req.query["cred"] || !req.query["user"]) {
        res.json({ msg: "Missing arguments"});
        return;
    }
    jwt.verify(req.query.cred, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const userif = await getUserData(user.usersHash);
        if (userif == "error") {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const sharedFolder = await shareFolder(req.query.location, user.usersName, req.query.user);
        if (sharedFolder === 200) {
            res.json({ msg: "Good" });
            return;
        }
        res.json({ msg: sharedFolder });
    });
});

// app.get("/getVideoStreamTest", async (req, res) => {
//     if (!req.headers["range"]) {
//         res.status(400).send("Requires Range header");
//     }
//     const range = req.headers.range;
//     const videoPath = "./storage/4813494d137e1631bba301d5acab6e7bb7aa74ce1185d456565ef51d737677b2/101.Dalmatians.1996.720p.WEB-HD.x264.900MB-Pahe.in.mkv";
//     const videoSize = fs.statSync(videoPath).size;
//     const CHUNK_SIZE = 20 ** 6;
//     const start = Number(range.replace(/\D/g, ""));
//     const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
//     const contentLength = end - start + 1;
//     const headers = {
//         "Content-Range": `bytes ${start}-${end}/${videoSize}`,
//         "Accept-Ranges": "bytes",
//         "Content-Length": contentLength,
//         "Content-Type": "video/mp4",
//     };
//     res.writeHead(206, headers);
//     const videoStream = fs.createReadStream(videoPath, { start, end });
//     videoStream.pipe(res);
// });

io.on('connection', socket => {
    socket.on("auth", (data) => {
        // if (data == "password") {
        //     whiteList.push(socket.id);
        // } else {
        //     socket.disconnect();
        // }
    });

    socket.on("test", (data) => {
        console.log(data);
        // if (whiteList.includes(socket.id)) {
        //     //console.log(data);
        // } else {
        //     socket.disconnect();
        // }
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}.`));
