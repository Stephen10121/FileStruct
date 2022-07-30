const crypto = require("crypto");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const {promisify} = require('util');
const {join} = require('path');
const mv = promisify(fs.rename);

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
        copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
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

const renameFolder = async (location, name, id) => {
  if (name.includes(".") || name.includes("/") || name.includes("&")) {
    return "Illegal Characters used.";
  }
  let fileLocation = `./storage/${hashed(id)}/home/`;
  if (location !== " ") {
    fileLocation+=`${location}`;
  }
  let fileLocation2 = `./storage/${hashed(id)}/home/`;
  if (location === " ") {
    fileLocation2+=name;
  } else {
    fileLocation2+=`${location.split("/").slice(0, -1).join("/")}/${name}`;
  }
  try {
    await fs.promises.rename(fileLocation, fileLocation2);
  } catch (err) {
    console.error(err);
    return "Error Renaming folder.";
  }
  return 200;
}

const renameFile = async (location, name, id) => {
  if (name.includes(".") || name.includes("/") || name.includes("&")) {
    return "Illegal Characters used.";
  }
  let fileLocation = `./storage/${hashed(id)}/home/`;
  if (location !== " ") {
    fileLocation+=`${location}`;
  }
  let fileLocation2 = `./storage/${hashed(id)}/home/`;
  if (location === " ") {
    fileLocation2+=name;
  } else {
    fileLocation2+=`${location.split("/").slice(0, -1).join("/")}/${name}`;
  }
  try {
    await fs.promises.rename(fileLocation, fileLocation2 +"."+ fileLocation.split(".").reverse()[0]);
  } catch (err) {
    console.error(err);
    return "Error Renaming file.";
  }
  return 200;
}

const deleteFolder = async (location, id) => {
  let fileLocation = `./storage/${hashed(id)}/home/`;
  if (location !== " ") {
    fileLocation+=`${location}`;
  }
  try {
    await fs.promises.rmdir(fileLocation, { recursive: true });
  } catch (err) {
    console.error(err);
    return "Error deleting folder.";
  }
  return 200;
}

const deleteSharedFolder = async (location, id) => {
  let fileLocation = `./storage/${hashed(id)}/shared/`;
  if (location !== " ") {
    fileLocation+=`${location}`;
  }
  try {
    await fs.promises.rmdir(fileLocation, { recursive: true });
  } catch (err) {
    console.error(err);
    return "Error deleting folder.";
  }
  return 200;
}

const deleteFile = async (location, id) => {
  let fileLocation = `./storage/${hashed(id)}/home/`;
  if (location !== " ") {
    fileLocation+=`${location}`;
  }
  try {
    await fs.promises.unlink(fileLocation);
  } catch (err) {
    console.error(err);
    return "Error deleting file.";
  }
  return 200;
}

const moveFolder = async (location, id, dest) => {
  let fileLocation = `./storage/${hashed(id)}/home/${location}`;
  let fileDestination = `./storage/${hashed(id)}/home/${dest}/${location.split("/").reverse()[0]}`;
  try {
    await fse.move(fileLocation, fileDestination);
  } catch (err) {
    console.log(err);
    return "Error moving folder";
  }
  return 200;
}

const addToDrive = async (location, id) => {
  let fileLocation = `./storage/${hashed(id)}/shared/${location}`;
  let fileDestination = `./storage/${hashed(id)}/home/${location.split("/").reverse()[0]}`;
  try {
    await fse.move(fileLocation, fileDestination);
  } catch (err) {
    console.log(err);
    return "Error moving folder";
  }
  return 200;
}

const moveFile = async (location, id, dest) => {
  let fileLocation = `./storage/${hashed(id)}/home/${location}`;
  let fileDestination = `./storage/${hashed(id)}/home/${dest}`;
  try {
    await mv(fileLocation, fileDestination);
  } catch (err) {
    console.log(err);
    return "Error moving file";
  }
  return 200;
}

const shareFolder = async (location, id, user) => {
  console.log(location, id ,user);
  return "Feature not implemented yet!";
}


const shareFile = async (location, id, user) => {
  console.log(location, id ,user);
  return "Feature not implemented yet!";
}

module.exports = {
    createHash,
    hashed,
    copyRecursiveSync,
    addFolder,
    renameFolder,
    renameFile,
    deleteFolder,
    deleteSharedFolder,
    deleteFile,
    moveFolder,
    moveFile,
    addToDrive,
    shareFolder,
    shareFile
}