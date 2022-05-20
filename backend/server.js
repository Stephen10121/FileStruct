const http = require("http");
const express = require('express');
const fs = require("fs");
const { getFiles, readFile } = require("./dirGet");
const PORT = 5500;
const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.use(express.json(), express.static('public'), express.urlencoded({ extended: true }));

const server = http.createServer(app);

app.get("/fetchFiles", async (req, res) => {
    console.log(req.query);
    const files = await getFiles(req.query.location);
    res.json({ msg: "Good", files });
});

app.get("/getFileData", async (req, res) => {
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

server.listen(PORT, () => console.log(`Server running on port ${PORT}.`));