const http = require("http");
const express = require('express');
const { getFiles, fileInfo } = require("./dirGet");
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
    console.log(req.body, req.query);
    const files = await getFiles(req.query.location);
    res.json({ msg: "Good", files });
});

app.get("/fetchFileData", async (req, res) => {
    console.log(req.body, req.query);
    const fileData = await fileInfo(req.query.location);
    res.json({ msg: "Good", fileData });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}.`));