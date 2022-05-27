const { createTable } = require("./database");
const crypto = require("crypto");
const fs = require("fs");

function createHash() {
    const bytes = crypto.randomBytes(32);
    const hash = crypto.createHash('sha256').update(bytes).digest("hex");
    return hash;
}

fs.writeFileSync('./.env', `ACCESS_TOKEN_SECRET=${createHash()}`);

createTable().then(data=>console.log(data));