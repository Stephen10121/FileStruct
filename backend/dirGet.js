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
            allFiles.G_files.push(item.name);
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

module.exports = {
    getFiles,
    fileInfo
}