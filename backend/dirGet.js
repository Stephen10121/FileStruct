const fs = require('fs');
const fs2 = require('fs/promises');

async function getTFiles(directoryPath) {
    let allFiles = {
        G_files: []
    }
    const files = await fs.promises.readdir(directoryPath, { withFileTypes: true });
    for (const item of files) {
        if (item.isDirectory()) {
            allFiles[item.name] = await getFiles(`${directoryPath}/${item.name}`)
        } else {
            const currentFileInfo = await fileInfo(`${directoryPath}/${item.name}`);
            allFiles.G_files.push({ name: item.name, metadata: currentFileInfo });
        }
    }
    return allFiles;
}

const getFiles = async (directoryPath) => {
    fs.access(directoryPath, (error) => {
        if (error) {
            fs.mkdir(directoryPath, { recursive: true }, (err) => {
                if (err) {
                    throw err;
                }
                return getTFiles(directoryPath);
            });
        }
    });
    return getTFiles(directoryPath);
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
const allowedVideoTypes = ["mp4"];

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