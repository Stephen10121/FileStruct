const Database = require('sqlite-async');
const fs = require("fs");
const crypto = require("crypto");

function hashed(password) {
    const hash = crypto.createHash('sha256').update(password).digest("hex");
    return hash;
}
async function createTable() {
    const dir = `./storage/`;

    fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) throw err;
    });
    const db = await Database.open("./users.db");
    try {
        await db.run(`CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            usersName varchar(200) NOT NULL, 
            usersHash varchar(200) NOT NULL,
            usersRName varchar(200) NOT NULL,
            usersEmail varchar(200) NOT NULL,
            usersProfile varchar(200) NOT NULL
        )`);
    } catch (error) {
        console.error(error.message);
    } finally {
        await db.close();
        return 200;
    }
}

async function getUser(id) {
    const db = await Database.open("./users.db");
    let sql = "SELECT * FROM USERS WHERE usersHash=?";
    const result = await db.all(sql, [id]);
    await db.close();
    return result;
}

async function getUserByHash(hash) {
    const db = await Database.open("./users.db");
    let sql = "SELECT * FROM USERS WHERE usersHash=?";
    const result = await db.all(sql, [hash]);
    await db.close();
    return result;
}

async function getUserByName(name) {
    const db = await Database.open("./users.db");
    let sql = "SELECT * FROM USERS WHERE usersName=?";
    const result = await db.all(sql, [name]);
    await db.close();
    return result;
}

async function addUser(username, hash, rName, email, profile) {
    const db = await Database.open("./users.db");
    const insertStatement = "INSERT INTO users (usersName, usersHash, usersRName, usersEmail, usersProfile) VALUES (?, ?, ?, ?, ?)";
    
    try {
        const result = db.run(insertStatement, [username, hash, rName, email, profile]);
        await db.close();
        return result;
    } catch (err) {
        console.error(err);
        return 'error';
    }
}

async function editUser(id, hash, rName, email, profile, username) {
    const db = await Database.open("./users.db");
    const updateStatement = "UPDATE users SET usersName=? usersHash=?, usersRName=?, usersEmail=?, usersProfile=? WHERE id=?";
    try {
        const result = await db.run(updateStatement, [username, hash, rName, email, profile, id]);
        await db.close();
        return result;
    } catch (err) {
        console.error(err);
        return 'error';
    }
}

async function changeProfile(id, profile) {
    const db = await Database.open("./users.db");
    const updateStatement = "UPDATE users SET usersProfile=? WHERE id=?";
    try {
        const result = await db.run(updateStatement, [profile, id]);
        await db.close();
        return result;
    } catch (err) {
        console.error(err);
        return 'error';
    }
}

async function userLogin({ hash, name, email, username}) {
    let users = await getUserByHash(hash);
    if (users.length === 0) {
        const addedUser = await addUser(username, hash, name, email, JSON.stringify({profile: "profilePics/profile1.jpg", theme: "dark", sharing: false}));
        if (addedUser === 'error') {
            return({errorMessage: "Error Try Again", error: 1000});
        }
        const dir = `./storage/${hashed(username)}/shared/welcome`;

        fs.mkdir(dir, { recursive: true }, (err) => {
            if (err) throw err;
        });
        const dir2 = `./storage/${hashed(username)}/home/welcome`;

        fs.mkdir(dir2, { recursive: true }, (err) => {
            if (err) throw err;
        });
        users = await getUserByHash(hash);
    }
    return({error: 200, data: {userInfo: users[0]}});
}

async function getUserData(user) {
    const users = await getUser(user);
    if (users.length > 0) {
        return users[0];
    } else {
        return "error";
    }
}

async function saveProfile(profile, user) {
    const db = await Database.open("./users.db");
    const updateStatement = "UPDATE users SET usersProfile=? WHERE usersHash=?";
    try {
        const result = await db.run(updateStatement, [profile, user]);
        await db.close();
        return result;
    } catch (err) {
        console.error(err);
        return 'error';
    }
}

async function checkUserSharing(user) {
    const gettingUser = await getUserByName(user);
    if (gettingUser.length > 0) {
        if (JSON.parse(gettingUser[0].usersProfile).sharing===false) {
            return "sfalse";
        } else {
            return 200;
        }
    } else {
        return null;
    }
}

module.exports = {
    userLogin,
    getUserData,
    saveProfile,
    checkUserSharing,
    createTable,
    saveProfile
}