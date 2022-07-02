<script>
  import ToastNotification from "./ToastNotification.svelte";
  import FileStruct from "./FileStruct.svelte";
  import SideFolder from "./SideFolder.svelte";
  import FolderPart from "./FolderPart.svelte";
  import LocationPath from "./LocationPath.svelte";
  import Prompt from "./Prompt.svelte";
  import { getCookie } from "../cookie";

  export let userData;
  export let PROXY;

  let selected = "none";
  let currentFolderPathFiles = "";
  let notification = null;
  let folderStruct = {};
  let showPrompt = false;
  let promptExtra = "jeff";
  let promptPlaceholder = "Folder Name";
  let promptEvent;

  fetch(`${PROXY}fetchFiles?cred=${getCookie("G_VAR2")}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      folderStruct = data.files;
      newLoc({ detail: null });
    });

  const newLoc = ({ detail }) => {
    if (detail === null) {
      selected = false;
      currentFolderPathFiles =
        !folderStruct["G_files"].length === 0 ? [] : folderStruct.G_files;
    } else {
      selected = detail;
      detail = detail.split("/");
      let files = folderStruct[detail[0]];
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

  const newFolder = (e, extra) => {
    if (!e) {
      showPrompt = false;
      return;
    }
    showPrompt = false;
    fetch(
      `${PROXY}addFolder?cred=${getCookie("G_VAR2")}&location=${
        extra ? extra : " "
      }&name=${e.target[0].value}`,
      { method: "POST" }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.msg === "Good") {
          folderStruct = data.files;
          notification = {
            status: "success",
            msg: `Created folder '${e.target[0].value}'`,
          };
        } else {
          notification = {
            status: "alert",
            msg: data.msg,
          };
        }
      });
  };

  const newFolderPrompt = ({ detail }) => {
    promptExtra = detail.selected;
    promptEvent = newFolder;
    showPrompt = true;
  };
</script>

{#if showPrompt}
  <Prompt {promptPlaceholder} {promptEvent} {promptExtra} />
{/if}
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
  <FolderPart
    {userData}
    {folderStruct}
    {selected}
    on:folderClicked={newLoc}
    on:new-folder={newFolderPrompt}
  />
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
