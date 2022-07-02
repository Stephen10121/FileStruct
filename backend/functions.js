const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function createHash() {
    const bytes = crypto.randomBytes(16);
    const hash = crypto.createHash('sha256').update(bytes).digest("hex");
    return hash;
}

function hashed(password) {
    const hash = crypto.createHash('sha256').update(password).digest("hex");
    return hash;
}

const copyRecursiveSync = (src, dest) => {
    var exists = fs.existsSync(src);
    var stats = exists && fs.statSync(src);
    var isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
      fs.mkdirSync(dest);
      fs.readdirSync(src).forEach(function(childItemName) {
        copyRecursiveSync(path.join(src, childItemName),
                          path.join(dest, childItemName));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
};

const addFolder = async (location, name, id) => {
  if (name.includes(".") || name.includes("/") || name.includes("&")) {
    return "Illegal Characters used.";
  }
  let fileLocation = `./storage/${hashed(id)}/home/`;
  if (location === " ") {
    fileLocation+=`${name}`;
  } else {
    fileLocation+=`${location}/${name}`;
  }
  try {
    await fs.promises.mkdir(fileLocation, { recursive: true });
  } catch (err) {
    console.error(err);
    return "Error Making folder.";
  }
  return 200;
}

module.exports = {
    createHash,
    hashed,
    copyRecursiveSync,
    addFolder
}