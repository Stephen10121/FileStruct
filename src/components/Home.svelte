<script>
  import { folderStruct } from "../directory";
  import ToastNotification from "./ToastNotification.svelte";
  import FileStruct from "./FileStruct.svelte";
  import SideFolder from "./SideFolder.svelte";
  import FolderPart from "./FolderPart.svelte";
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

  fetch(`${PROXY}fetchFiles?cred=${getCookie("G_VAR2")}`)
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
  <SideFolder />
  <FolderPart {userData} {folderStruct2} {selected} on:folderClicked={newLoc} />
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

  .file-part {
    display: grid;
    grid-template-rows: 30px auto;
    height: 100vh;
    width: 100%;
    overflow-y: auto;
  }

  @media only screen and (max-width: 850px) {
    main {
      grid-template-columns: 300px auto;
    }
  }

  @media only screen and (max-width: 600px) {
    main {
      grid-template-columns: 1fr;
    }
  }
</style>
