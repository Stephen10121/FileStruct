require('dotenv').config();
const http = require("http");
const express = require('express');
const socketio = require('socket.io');
const path = require("path");
const fs = require("fs");
const { getFiles, readFile } = require("./dirGet");
const cookieParser = require("cookie-parser");
const { userLogin, getUserData } = require("./database");
const PORT = process.env.SERVER_PORT || 5700;
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const _ = require('lodash');
const { hashed, addFolder, renameFolder, renameFile, deleteFolder, deleteSharedFolder, deleteFile, moveFolder, moveFile, addToDrive, addFileToDrive, shareFolder, shareFile } = require('./functions');
const { query } = require('express');
const app = express();

app.use((req, res, next) => {
    // res.setHeader('Access-Control-Allow-Origin', "https://auth.gruzservices.com"); uncomment this in prod
    res.setHeader('Access-Control-Allow-Origin', "*"); // comment this in prod
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.use(fileUpload({
    createParentPath: true
}), express.json(), express.static('../public'), express.urlencoded({ extended: true }), cookieParser(), cors(), bodyParser.json(), bodyParser.urlencoded({extended: true}), morgan('dev'));

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowEIO3: true
    }
  });


app.post("/upload", async (req, res) => {
    if (!req.body["user"]) {
        res.send({
            status: false,
            message: 'Missing arguments.'
        });
        return;
    }
    const userDecode = JSON.parse(req.body.user);
    if (!userDecode["cred"] || userDecode["where"] === undefined) {
        res.send({
            status: false,
            message: 'Missing arguments.'
        });
        return;
    }
    if (!userDecode.where === null || !userDecode.where === false) {
        if (userDecode.where.includes("..")) {
            res.send({
                status: false,
                message: 'Bad.'
            });
            return
        }
    }
    console.log(userDecode.where);
    jwt.verify(userDecode.cred, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            res.send({
                status: false,
                message: 'Invalid input.'
            });
            return;
        }
        const userif = await getUserData(user.usersHash);
        if (userif == "error") {
            res.send({
                status: false,
                message: 'Invalid input.'
            });
            return;
        }
        try {
            if(!req.files) {
                res.send({
                    status: false,
                    message: 'No file uploaded'
                });
            } else {
                //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
                let file = req.files.file;
                
                //Use the mv() method to place the file in upload directory (i.e. "uploads")
                console.log(userDecode.where);
                if (!userDecode.where) {
                    file.mv(`./storage/${hashed(user.usersName)}/home/` + file.name);
                } else {
                    file.mv(`./storage/${hashed(user.usersName)}/home/${userDecode.where}/` + file.name);
                }
    
                //send response
                res.send({
                    status: true,
                    message: 'File is uploaded',
                    data: {
                        name: file.name,
                        mimetype: file.mimetype,
                        size: file.size
                    }
                });
            }
        } catch (err) {
            res.status(500).send(err);
        }
    });
});

app.get("/download", async (req, res) => {
    console.log(req.query.file);
    if (!req.query["file"] || !req.query["location"] || !req.query["cred"]) {
        res.json({ msg: "Missing arguments", error: true });
        return;
    }
    jwt.verify(req.query.cred, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.json({ msg: 'Invalid input', status: 400, error: true });
        }
        const userif = await getUserData(user.usersHash);
        if (userif == "error") {
            return res.json({ msg: 'Invalid input', status: 400, error: true });
        }
        let where = "";
        if (req.query.location !== "false") {
            where = req.query.location + "/";
        }
        let location = `./storage/${hashed(userif.usersName)}/`;
        if (req.query["shared"] === "true") {
            location+=`shared/${where}${req.query.file}`;
        } else {
            location+=`home/${where}${req.query.file}`;
        }
        try {
            await fs.promises.access(location);
        } catch (err) {
            res.json({ msg: "Path or file doesnt exist.", error: true });
            return;
        }
        console.log(location);
        res.download(location);
    });
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
        
        const fileData = await readFile(path.join(__dirname, `./storage/${hashed(user.usersName)}/${req.query["shared"]==="true"?"shared":"home"}`, req.query.location));
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

        try {
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
        } catch (err) {
            console.error(err);
        }
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

app.post("/renameFile", async (req, res) => {
    if (!req.query["location"] || !req.query["cred"] || !req.query["renamed"]) {
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
        const renamedFile = await renameFile(req.query.location, req.query.renamed, user.usersName);
        if (renamedFile === 200) {
            const files = await getFiles(`./storage/${hashed(user.usersName)}/home`);
            res.json({ msg: "Good", files: files.files, fileSize: files.fileSize });
            return;
        }
        res.json({ msg: renamedFile });
    });
});

app.post("/deleteFolder", async (req, res) => {
    if (!req.query["location"] || !req.query["cred"]) {
        res.json({ msg: "Missing arguments"});
        return;
    }
    if (req.query.location.includes("..")) {
        res.json({ msg: "Not allowed!" });
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

app.post("/deleteSharedFolder", async (req, res) => {
    if (!req.query["location"] || !req.query["cred"]) {
        res.json({ msg: "Missing arguments"});
        return;
    }
    if (req.query.location.includes("..")) {
        res.json({ msg: "Not allowed!" });
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
        const deletedFolder = await deleteSharedFolder(req.query.location, user.usersName);
        if (deletedFolder === 200) {
            const files = await getFiles(`./storage/${hashed(user.usersName)}/shared`);
            res.json({ msg: "Good", files: files.files, fileSize: files.fileSize });
            return;
        }
        res.json({ msg: deletedFolder });
    });
});

app.post("/deleteFile", async (req, res) => {
    if (!req.query["location"] || !req.query["cred"]) {
        res.json({ msg: "Missing arguments"});
        return;
    }
    if (req.query.location.includes("..")) {
        res.json({ msg: "Not allowed!" });
        return;
    }
    let sendLocation = "home";
    if (req.query["shared"] === "true") {
        sendLocation = "shared";
    }
    jwt.verify(req.query.cred, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const userif = await getUserData(user.usersHash);
        if (userif == "error") {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const deletedFile = await deleteFile(req.query.location, user.usersName, req.query["shared"]==="true"?true:false);
        if (deletedFile === 200) {
            const files = await getFiles(`./storage/${hashed(user.usersName)}/${sendLocation}`);
            res.json({ msg: "Good", files: files.files, fileSize: files.fileSize });
            return;
        }
        res.json({ msg: deletedFile });
    });
});

app.post("/moveFolder", async (req, res) => {
    if (!req.query["location"] || !req.query["cred"] || !req.query["dest"]) {
        res.json({ msg: "Missing arguments"});
        return;
    }
    if (req.query.dest.includes("..")) {
        res.json({ msg: "Not allowed!" });
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

app.post("/addToDrive", async (req, res) => {
    if (!req.query["location"] || !req.query["cred"]) {
        res.json({ msg: "Missing arguments"});
        return;
    }
    if (req.query.location === "null" || req.query.location === "false") {
        res.json({ msg: "Cannot move root folder." });
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
        const movedFolder = await addToDrive(req.query.location, user.usersName);
        if (movedFolder === 200) {
            const files = await getFiles(`./storage/${hashed(user.usersName)}/shared`);
            res.json({ msg: "Good", files: files.files, fileSize: files.fileSize });
            return;
        }
        res.json({ msg: movedFolder });
    });
});

app.post("/addFileToDrive", async (req, res) => {
    if (!req.query["location"] || !req.query["cred"]) {
        res.json({ msg: "Missing arguments"});
        return;
    }
    if (req.query.location === "null" || req.query.location === "false") {
        res.json({ msg: "Cannot move root folder." });
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
        const movedFolder = await addFileToDrive(req.query.location, user.usersName);
        if (movedFolder === 200) {
            const files = await getFiles(`./storage/${hashed(user.usersName)}/shared`);
            res.json({ msg: "Good", files: files.files, fileSize: files.fileSize });
            return;
        }
        res.json({ msg: movedFolder });
    });
});

app.post("/moveFile", async (req, res) => {
    if (!req.query["location"] || !req.query["cred"] || !req.query["dest"]) {
        res.json({ msg: "Missing arguments"});
        return;
    }
    if (req.query.dest.includes("..")) {
        res.json({ msg: "Not allowed!" });
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
        const movedFile = await moveFile(req.query.location, user.usersName, req.query.dest);
        if (movedFile === 200) {
            const files = await getFiles(`./storage/${hashed(user.usersName)}/home`);
            res.json({ msg: "Good", files: files.files, fileSize: files.fileSize });
            return;
        }
        res.json({ msg: movedFile });
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

app.post("/shareFile", async (req, res) => {
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
        const sharedFile = await shareFile(req.query.location, user.usersName, req.query.user);
        if (sharedFile === 200) {
            res.json({ msg: "Good" });
            return;
        }
        res.json({ msg: sharedFile });
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
