<script>
  import { Router, Route, Link } from "svelte-navigator";
  import BuildFolderStruct from "./BuildFolderStruct.svelte";
  import { folderStruct } from "../directory";
  import ToastNotification from "./ToastNotification.svelte";
  import FileStruct from "./FileStruct.svelte";
  import LocationPath from "./LocationPath.svelte";
  export let userData;
  export let PROXY;

  let selected = "none";
  let folderStruct2 = folderStruct;
  let currentFolderPathFiles = "";
  let notification = null;
  console.log(userData);
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  fetch(`${PROXY}/fetchFiles?cred=${getCookie("G_VAR")}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      folderStruct2 = data.files;
      newLoc({ detail: null });
    });

  const newLoc = ({ detail }) => {
    if (detail === null) {
      selected = false;
      currentFolderPathFiles =
        !folderStruct2["G_files"].length === 0 ? [] : folderStruct2.G_files;
    } else {
      selected = detail;
      detail = detail.split("/");
      let files = folderStruct2[detail[0]];
      for (let i = 1; i < detail.length; i++) {
        files = files[detail[i]];
      }
      if (!files["G_files"]) {
        currentFolderPathFiles = [];
        return;
      }
      currentFolderPathFiles =
        !files["G_files"].length === 0 ? [] : files.G_files;
    }
  };

  const addVal = () => {
    folderStruct2.house["nancy"] = {
      G_files: [],
    };
    console.log("button");
  };

  const deleteSomething = () => {
    folderStruct2.vids.Date_2020 = {};
    console.log(folderStruct2);
  };
</script>

{#if notification !== null}
  <ToastNotification
    type={notification.status}
    on:close={() => {
      notification = null;
    }}>{notification.msg}</ToastNotification
  >
{/if}
<main>
  <button
    class="slide-folder-button"
    id="slide-button"
    on:click={() => {
      if (document.getElementById("slide-button").style.left === "85px") {
        document.getElementById("slide-button").style.left = "5px";
        document.getElementById("sideFolder").style.left = "-80px";
        return;
      }
      document.getElementById("slide-button").style.left = "85px";
      document.getElementById("sideFolder").style.left = 0;
    }}><img src="/icons/grid.svg" alt="Menu" /></button
  >
  <div class="sideFolder" id="sideFolder"
    ><Link to="about">About page</Link></div
  >
  <button
    class="folder-part-button"
    id="folderpartbutton"
    on:click={() => {
      if (document.getElementById("folderpartbutton").style.right === "215px") {
        document.getElementById("folderpartbutton").style.right = "5px";
        document.getElementById("folder-part").style.right = "-300px";
        return;
      }
      document.getElementById("folderpartbutton").style.right = "215px";
      document.getElementById("folder-part").style.right = 0;
    }}><img src="/icons/folder-fill.svg" alt="Folder" /></button
  >
  <section class="folder-part" id="folder-part">
    <section class="name-section">
      <p>{userData.usersRName}</p>
    </section>
    <BuildFolderStruct
      folders={folderStruct2}
      on:folderClicked={newLoc}
      {selected}
    />
  </section>
  <section class="file-part">
    <LocationPath {selected} on:change-dir={newLoc} />
    <FileStruct {selected} files={currentFolderPathFiles} {PROXY} />
  </section>
</main>

<style>
  main {
    display: grid;
    grid-template-columns: 80px 300px auto;
    width: 100vw;
    height: 100vh;
    overflow-y: auto;
  }

  .sideFolder {
    width: 80px;
    height: 100vh;
    background-color: var(--side-folder-color);
    z-index: 150;
  }

  .slide-folder-button {
    position: fixed;
    bottom: 5px;
    left: 5px;
    border: none;
    cursor: pointer;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    background-color: var(--side-folder-color);
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    transition: left 0.25s linear;
    display: none;
  }

  .slide-folder-button img {
    width: 50%;
  }

  .folder-part-button {
    position: fixed;
    bottom: 5px;
    right: 5px;
    border: none;
    cursor: pointer;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    z-index: 150;
    background-color: var(--side-folder-color);
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    transition: right 0.25s linear;
    display: none;
  }

  .folder-part-button img {
    width: 50%;
  }

  .folder-part {
    height: 100%;
    display: grid;
    grid-template-rows: 70px auto;
  }

  .file-part {
    display: grid;
    grid-template-rows: 30px auto;
    height: 100vh;
    width: 100%;
    overflow-y: auto;
  }

  .name-section {
    background-color: var(--name-section-color);
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
  }

  .name-section p {
    font-family: "Poppins", sans-serif;
    font-size: 3rem;
    color: var(--name-font-color);
  }

  @media only screen and (max-width: 850px) {
    main {
      grid-template-columns: 300px auto;
    }

    .sideFolder {
      position: fixed;
      top: 0;
      left: -80px;
      transition: left 0.25s linear;
    }

    .slide-folder-button {
      display: block;
    }
  }

  @media only screen and (max-width: 600px) {
    main {
      grid-template-columns: 1fr;
    }
    .folder-part {
      position: fixed;
      right: -300px;
      top: 0;
      transition: right 0.25s linear;
    }

    .folder-part-button {
      display: block;
    }
  }
</style>
