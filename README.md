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
yarn install
```

After running that command you have to initialize the database and token. To do this run:

```
yarn startup
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
yarn dev
```

or:

```
node server.js
```

### Real life implementation

[Example version](https://files.gruzservices.com)

## TODO

- [x] Folder Stuff.
  - [x] Move Folder.
  - [x] Rename Folder.
  - [x] Delete Folder.
  - [x] Share Folder. Almost ready. Has to hook up to shared page.
- [x] File Stuff.
  - [x] File preview video/audio and text.
  - [x] Upload File.
  - [x] Download File.
  - [x] Move File.
  - [x] Rename File.
  - [x] Delete File.
  - [x] Share File. Almost ready. Has to hook up to shared page.
- [x] Settings Page.
- [ ] Profile Page.
  - [ ] Set sharing.
  - [ ] Theme toggling.
  - [ ] Delete account.
- [ ] Shared Page.
  - [x] Dynamic sidebar.
  - [ ] Folder Stuff.
    - [x] Delete folder.
    - [ ] Add to drive.
  - [ ] File Stuff
    - [ ] File preview video/audio and text.
    - [ ] Delete file.
    - [ ] Add to drive.
- [ ] Not logged-in Page.
