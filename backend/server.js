require('dotenv').config();
const http = require("http");
const express = require('express');
const socketio = require('socket.io');
const fs = require("fs");
const { getFiles, readFile } = require("./dirGet");
const cookieParser = require("cookie-parser");
const { userLogin, getUserData, saveProfile, checkUserSharing } = require("./database");
const PORT = 5500;
const jwt = require('jsonwebtoken');
const { hashed } = require('./functions');
const app = express();

app.use((req, res, next) => {
    // res.setHeader('Access-Control-Allow-Origin', "https://auth.gruzservices.com"); uncomment this in prod
    res.setHeader('Access-Control-Allow-Origin', "*"); // comment this in prod
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.use(express.json(), express.static('public'), express.urlencoded({ extended: true }), cookieParser());

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowEIO3: true
    }
  });

app.post('/auth', async (req, res) => {
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

app.get("/fetchFiles", async (req, res) => {
    if (!req.query["cred"]) {
        return res.json({ msg: "Missing params" });
    }
    jwt.verify(req.query.cred, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const userif = await getUserData(user.usersHash);
        if (userif == "error") {
            return res.status(400).json({ msg: 'Invalid input' });
        }
        const files = await getFiles(`./storage/${hashed(user.usersName)}`);
        res.json({ msg: "Good", files });
    });
});

app.get("/getFileData", async (req, res) => {
    if (!req.query["location"]) {
        return res.json({ msg: "Missing arguments"});
    }
    const fileData = await readFile(req.query.location);
    let jsonResult;
    if (fileData === "video") {
        jsonResult = { video: true }
    } else {
        jsonResult = {fileData}
    }
    return res.json(jsonResult)
});

app.get("/getVideoStream", async (req, res) => {
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
    }
    const videoPath = `./storage/${req.query.location}`;
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