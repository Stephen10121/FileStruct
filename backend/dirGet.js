const fs = require('fs');
const fs2 = require('fs').promises;

async function getTFiles(directoryPath) {
    let size = 0;
    let allFiles = {
        G_files: []
    }
    const files = await fs.promises.readdir(directoryPath, { withFileTypes: true });
    for (const item of files) {
        if (item.isDirectory()) {
            const {files, fileSize} = await getFiles(`${directoryPath}/${item.name}`);
            allFiles[item.name] = files;
            size += fileSize;
        } else {
            const currentFileInfo = await fileInfo(`${directoryPath}/${item.name}`);
            size += currentFileInfo.size;
            allFiles.G_files.push({ name: item.name, metadata: currentFileInfo });
        }
    }
    return {allFiles, size};
}

const getFiles = async (directoryPath) => {
    let size = 0
    try {
        await fs.promises.access(directoryPath);
    } catch (err) {
        try {
            await fs.promises.mkdir(directoryPath);
            const tfiles = await getTFiles(directoryPath);
            size += tfiles.size;
            return {files: tfiles.allFiles, fileSize: size};
        } catch (err) {
            throw err;
        }
    }
    const tfiles = await getTFiles(directoryPath);
    size += tfiles.size;
    return {files: tfiles.allFiles, fileSize: size};
}

const fileInfo = async (fileLocation) => {
    try {
    let stats = await fs2.stat(fileLocation);
    let data = {
        dateCreated: stats.birthtime.toString().split(":")[0].slice(0, -3),
        size: stats.size
    }
    return data;
    } catch (err) {
        console.log(err);
        return { status: 500 };
    }
};

const allowedFileTypes = ["txt", "css"];
const allowedVideoTypes = ["mp4", "mkv", "mp3", "m4a"];

const readFile = async (fileLocation) => {
    if (allowedFileTypes.includes(fileLocation.split(".").reverse()[0])) {
        try {
            const data = await fs2.readFile(fileLocation, { encoding: 'utf8' });
            return data;
          } catch (err) {
            console.log(err);
            return "500";
          }
    } else if (allowedVideoTypes.includes(fileLocation.split(".").reverse()[0])) {
        return "video";
    } else {
        return "Unsupported File Type"
    }
}

module.exports = {
    getFiles,
    fileInfo,
    readFile
}
