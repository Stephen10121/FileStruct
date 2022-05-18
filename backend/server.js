const http = require("http");
const express = require('express');
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
    console.log(req.query);
    return res.json({ fileData: await readFile(req.query.location) })
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}.`));