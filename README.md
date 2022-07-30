# FileStruct

This is a project I made to have a virtual file structure that I can access anywhere online.

## What I'm using

Frontend:

- Svelte
- Socket.io
- Bootstap Icons

Backend:

- Sqlite
- Express
- Socket.io

For authentication I'm using my own authentication program that I use for all of my projects.
[Authentication Website](https://auth.gruzservices.com)

## Getting Started

First clone this repo and go to the backend folder.

Then run this command to install all of the required dependencies:

```
npm i
```

After running that command you have to initialize the database and token. To do this run:

```
npm run startup
```

### Optional

You can add your own port for the server in the .env file using:

```
SERVER_PORT=5000
```

Replace the 5000 with whatever port you want it to be.

### End Optional

Finally you can run the server using:

```
npm run dev
```

or:

```
node server.js
```

### Real life implementation

[Example version](https://files.gruzservices.com)

## TODO

- [x] Move Folder.
- [x] Rename Folder.
- [x] Delete Folder.
- [x] Settings Page.
- [x] Upload File.
- [x] Download File.
- [x] Move File.
- [x] Rename File.
- [x] Delete File.
- [ ] Profile Page.
- [ ] Shared Page.
- [x] Share Folder. Almost ready. Has to hook up to shared page.
- [x] Share File. Almost ready. Has to hook up to shared page.
