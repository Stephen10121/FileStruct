
const fs = require('fs');

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

module.exports = {
    getFiles
}