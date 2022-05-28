<script>
  import { Router, Route, Link } from "svelte-navigator";
  import BuildFolderStruct from "./components/BuildFolderStruct.svelte";
  import { folderStruct } from "./directory";
  import ToastNotification from "./components/ToastNotification.svelte";
  import FileStruct from "./components/FileStruct.svelte";
  let selected = "none";
  let folderStruct2 = folderStruct;
  let currentFolderPathFiles = "";
  let notification = null;

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  fetch(`http://localhost:5500/fetchFiles?cred=${getCookie("G_VAR")}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      folderStruct2 = data.files;
    });

  const newLoc = ({ detail }) => {
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
  <div class="sideFolder"><Link to="about">About page</Link></div>
  <section class="folder-part">
    <p>Name</p>
    <BuildFolderStruct
      folders={folderStruct2}
      on:folderClicked={newLoc}
      {selected}
    />
  </section>
  <FileStruct {selected} files={currentFolderPathFiles} />
</main>

<style>
  main {
    display: grid;
    grid-template-columns: 80px 300px auto;
    width: 100vw;
    height: 100vh;
  }

  .folder-part {
    height: 100%;
    display: grid;
    grid-template-rows: 70px auto;
  }
</style>
