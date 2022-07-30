<script>
  import ToastNotification from "./ToastNotification.svelte";
  import FileStruct from "./FileStruct.svelte";
  import SideFolder from "./SideFolder.svelte";
  import FolderPart from "./FolderPart.svelte";
  import LocationPath from "./LocationPath.svelte";
  import BoolPrompt from "./BoolPrompt.svelte";
  import { getCookie } from "../cookie";
  import { folderStructValue } from "../../scripts/stores";

  export let userData;
  export let PROXY;

  let selected = "none";
  $: selected;
  let currentFolderPathFiles = "";
  let notification = null;
  let folderStruct = {};
  let boolPrompt = false;

  folderStructValue.subscribe((value) => {
    folderStruct = value;
  });

  console.log(userData);

  fetch(`${PROXY}fetchSharedFiles?cred=${getCookie("G_VAR2")}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      folderStructValue.update((n) => data.files);
      newLoc({ detail: null });
    });

  const fetchFiles = () => {
    fetch(`${PROXY}fetchSharedFiles?cred=${getCookie("G_VAR2")}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        folderStructValue.update((n) => data.files);
        newLoc({ detail: null });
      });
  };

  const newLoc = ({ detail }) => {
    if (detail === null || !detail) {
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

  const deleteFolder = ({ detail }) => {
    boolPrompt = false;
    if (!detail.choose) {
      return;
    }
    fetch(
      `${PROXY}deleteSharedFolder?cred=${getCookie("G_VAR2")}&location=${
        detail.extra
      }`,
      { method: "POST" }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.msg === "Good") {
          folderStructValue.update((n) => data.files);
          notification = {
            status: "success",
            msg: `Deleted folder: '${detail.extra.split("/").reverse()[0]}'`,
          };
          newLoc({
            detail:
              selected.split("/").slice(0, -1).join("/") === ""
                ? null
                : selected.split("/").slice(0, -1).join("/"),
          });
        } else {
          notification = {
            status: "alert",
            msg: data.msg,
          };
        }
      });
  };

  const deleteFolderPrompt = ({ detail }) => {
    boolPrompt = {
      msg: "Delete Folder?",
      extra: detail,
      callback: deleteFolder,
    };
  };

  const addToDrive = () => {
    fetch(
      `${PROXY}addToDrive?cred=${getCookie("G_VAR2")}&location=${selected}`,
      { method: "POST" }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.msg === "Good") {
          folderStructValue.update((n) => data.files);
          notification = {
            status: "success",
            msg: `Added folder to drive.`,
          };
          newLoc({ detail });
        } else {
          notification = {
            status: "alert",
            msg: data.msg,
          };
        }
      });
  };
</script>

<svelte:head>
  <title>Shared | GCloud</title>
</svelte:head>

{#if boolPrompt}
  <BoolPrompt extra={boolPrompt.extra} on:boolChoose={boolPrompt.callback}
    >{boolPrompt.msg}</BoolPrompt
  >
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
  <SideFolder
    shared={true}
    {PROXY}
    {selected}
    on:update-file-struct={fetchFiles}
  />
  <FolderPart
    {userData}
    {folderStruct}
    {selected}
    shared={true}
    on:folderClicked={newLoc}
    on:delete-folder={deleteFolderPrompt}
    on:addToDrive={addToDrive}
  />
  <section class="file-part">
    <LocationPath {selected} on:change-dir={newLoc} />
    <FileStruct
      {selected}
      files={currentFolderPathFiles}
      {PROXY}
      {folderStruct}
      on:newLoc={newLoc}
    />
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
