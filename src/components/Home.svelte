<script>
  import ToastNotification from "./ToastNotification.svelte";
  import FileStruct from "./FileStruct.svelte";
  import SideFolder from "./SideFolder.svelte";
  import FolderPart from "./FolderPart.svelte";
  import LocationPath from "./LocationPath.svelte";
  import Prompt from "./Prompt.svelte";
  import BoolPrompt from "./BoolPrompt.svelte";
  import MoveTo from "./MoveTo.svelte";
  import Settings from "./Settings.svelte";
  import { getCookie } from "../cookie";
  import { fileExtension, folderStructValue } from "../../scripts/stores";

  export let userData;
  export let PROXY;

  let selected = "none";
  $: selected;
  let currentFolderPathFiles = "";
  let notification = null;
  let folderStruct = {};
  let showPrompt = false;
  let promptExtra = "jeff";
  let promptPlaceholder;
  let promptEvent;
  let boolPrompt = false;
  let excludeFolder = null;
  let moveFolder = false;
  let settings = false;
  let usedSize = "N/A";
  let fileExtensionValue;

  folderStructValue.subscribe((value) => {
    folderStruct = value;
  });

  fileExtension.subscribe((value) => {
    fileExtensionValue = value;
  });

  console.log(userData);

  if (window.localStorage.getItem("fileExtension")) {
    fileExtension.update((n) =>
      window.localStorage.getItem("fileExtension") === "true" ? true : false
    );
  }
  fetch(`${PROXY}fetchFiles?cred=${getCookie("G_VAR2")}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      folderStructValue.update((n) => data.files);
      usedSize = data.fileSize;
      newLoc({ detail: null });
    });
  const fetchFiles = () => {
    fetch(`${PROXY}fetchFiles?cred=${getCookie("G_VAR2")}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        folderStructValue.update((n) => data.files);
        usedSize = data.fileSize;
        newLoc({ detail: selected });
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
          folderStructValue.update((n) => data.files);
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

  const renameFolder = (e, extra) => {
    if (!e) {
      showPrompt = false;
      return;
    }
    showPrompt = false;
    fetch(
      `${PROXY}renameFolder?cred=${getCookie("G_VAR2")}&location=${
        extra ? extra : " "
      }&name=${e.target[0].value}`,
      { method: "POST" }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.msg === "Good") {
          folderStructValue.update((n) => data.files);
          notification = {
            status: "success",
            msg: `Renamed folder to '${e.target[0].value}'`,
          };
          newLoc({
            detail:
              selected.split("/").slice(0, -1).join("/") + e.target[0].value,
          });
        } else {
          notification = {
            status: "alert",
            msg: data.msg,
          };
        }
      });
  };

  const shareFolder = (e, extra) => {
    if (!e) {
      showPrompt = false;
      return;
    }
    showPrompt = false;
    fetch(
      `${PROXY}shareFolder?cred=${getCookie("G_VAR2")}&location=${extra}&user=${
        e.target[0].value
      }`,
      { method: "POST" }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.msg === "Good") {
          notification = {
            status: "success",
            msg: `Shared folder: '${extra.split("/").reverse()[0]}'`,
          };
        } else {
          notification = {
            status: "alert",
            msg: data.msg,
          };
        }
      });
  };

  const deleteFolder = ({ detail }) => {
    boolPrompt = false;
    if (!detail.choose) {
      return;
    }
    fetch(
      `${PROXY}deleteFolder?cred=${getCookie("G_VAR2")}&location=${
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

  const moveHere = ({ detail }) => {
    fetch(
      `${PROXY}moveFolder?cred=${getCookie(
        "G_VAR2"
      )}&location=${selected}&dest=${detail}`,
      { method: "POST" }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.msg === "Good") {
          folderStructValue.update((n) => data.files);
          notification = {
            status: "success",
            msg: `Moved folder!`,
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

  const renameFolderPrompt = ({ detail }) => {
    promptExtra = detail;
    promptEvent = renameFolder;
    promptPlaceholder = "Rename Folder to";
    showPrompt = true;
  };

  const newFolderPrompt = ({ detail }) => {
    promptExtra = detail.selected;
    promptEvent = newFolder;
    promptPlaceholder = "Folder Name";
    showPrompt = true;
  };

  const deleteFolderPrompt = ({ detail }) => {
    boolPrompt = {
      msg: "Delete Folder?",
      extra: detail,
      callback: deleteFolder,
    };
  };

  const moveFolderPrompt = ({ detail }) => {
    moveFolder = true;
    excludeFolder = detail;
  };

  const shareFolderPrompt = ({ detail }) => {
    promptExtra = detail;
    promptEvent = shareFolder;
    promptPlaceholder = "Share to";
    showPrompt = true;
  };
</script>

<svelte:head>
  <title>GCloud</title>
</svelte:head>

{#if settings}
  <Settings
    {usedSize}
    on:close-settings={() => {
      settings = false;
    }}
  />
{/if}
{#if moveFolder}
  <MoveTo
    {folderStruct}
    exclude={excludeFolder}
    on:close-move={() => {
      moveFolder = false;
    }}
    on:move-here={moveHere}
  />
{/if}
{#if boolPrompt}
  <BoolPrompt extra={boolPrompt.extra} on:boolChoose={boolPrompt.callback}
    >{boolPrompt.msg}</BoolPrompt
  >
{/if}
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
  <SideFolder
    shared={false}
    profile={false}
    {PROXY}
    {selected}
    on:update-file-struct={fetchFiles}
  />
  <FolderPart
    {userData}
    {folderStruct}
    {selected}
    shared={false}
    on:folderClicked={newLoc}
    on:rename-folder={renameFolderPrompt}
    on:new-folder={newFolderPrompt}
    on:move-folder={moveFolderPrompt}
    on:delete-folder={deleteFolderPrompt}
    on:share-folder={shareFolderPrompt}
    on:settings={() => {
      settings = true;
    }}
  />
  <section class="file-part">
    <LocationPath {selected} on:change-dir={newLoc} />
    <FileStruct
      shared={false}
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
