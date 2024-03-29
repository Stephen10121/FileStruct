<script>
  import FilePreview from "./FilePreview.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  import MoveTo from "./MoveTo.svelte";
  import BoolPrompt from "./BoolPrompt.svelte";
  import Prompt from "./Prompt.svelte";
  import { getCookie } from "../cookie";
  import { folderStructValue } from "../../scripts/stores";
  export let selected;
  export let file;
  export let metadata;
  export let folderStruct;
  export let shared;
  let moveFile = false;
  let previewShow = false;
  let deleteFileCheck = false;
  let showPrompt = false;

  const downloadFile = async () => {
    console.log("Download");
    let res = await fetch(
      `/download?file=${file}&location=${selected}&cred=${getCookie(
        "G_VAR2"
      )}&shared=${shared}`,
      {
        method: "GET",
      }
    );
    try {
      // convert zip file to url object (for anchor tag download)
      let blob = await res.blob();
      var url = window.URL || window.webkitURL;
      let link = url.createObjectURL(blob);

      // generate anchor tag, click it for download and then remove it again
      let a = document.createElement("a");
      a.setAttribute("download", file);
      a.setAttribute("href", link);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      const result = await res.json();
      if (result.error) {
        dispatch("notification", { msg: result.msg, status: "alert" });
        return;
      }
      return;
    }
  };

  const shareFileDo = () => {
    showPrompt = {
      placeholder: "Share file to",
      callback: shareFile,
      extra: [selected, file],
    };
  };

  const renameFileDo = () => {
    showPrompt = {
      placeholder: "Rename file to",
      callback: renameFile,
      extra: [selected, file],
    };
  };

  const deleteFile = () => {
    deleteFileCheck = true;
  };

  const shareFile = (e, extra) => {
    showPrompt = false;
    if (!e) {
      return;
    }
    let location;
    if (!extra[0]) {
      location = extra[1];
    } else {
      location = extra[0] + "/" + extra[1];
    }
    fetch(
      `/shareFile?cred=${getCookie("G_VAR2")}&location=${location}&user=${
        e.target[0].value
      }`,
      { method: "POST" }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.msg === "Good") {
          dispatch("notification", {
            status: "success",
            msg: `Shared file: '${file}'`,
          });
        } else {
          dispatch("notification", {
            status: "alert",
            msg: data.msg,
          });
        }
      });
  };

  const renameFile = (e, extra) => {
    showPrompt = false;
    if (!e) {
      return;
    }
    let location;
    if (!extra[0]) {
      location = extra[1];
    } else {
      location = extra[0] + "/" + extra[1];
    }
    fetch(
      `/renameFile?cred=${getCookie("G_VAR2")}&location=${location}&renamed=${
        e.target[0].value
      }`,
      { method: "POST" }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.msg === "Good") {
          folderStructValue.update((_n) => data.files);
          dispatch("newLoc", selected);
          dispatch("notification", {
            status: "success",
            msg: `Renamed file: '${extra[1]}'`,
          });
        } else {
          dispatch("notification", {
            status: "alert",
            msg: data.msg,
          });
        }
      });
  };

  const moveFileHere = ({ detail }) => {
    moveFile = false;
    let location;
    if (!selected) {
      location = file;
    } else {
      location = selected + "/" + file;
    }
    let destination = `${detail}/${file}`;
    fetch(
      `/moveFile?cred=${getCookie(
        "G_VAR2"
      )}&location=${location}&dest=${destination}`,
      { method: "POST" }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.msg === "Good") {
          folderStructValue.update((_n) => data.files);
          dispatch("newLoc", selected);
          dispatch("notification", {
            status: "success",
            msg: `Moved file!`,
          });
        } else {
          dispatch("notification", {
            status: "alert",
            msg: data.msg,
          });
        }
      });
  };

  const confirmedDeleteFile = () => {
    let location;
    if (!selected) {
      location = file;
    } else {
      location = selected + "/" + file;
    }
    fetch(
      `/deleteFile?cred=${getCookie(
        "G_VAR2"
      )}&location=${location}&shared=${shared}`,
      { method: "POST" }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.msg === "Good") {
          folderStructValue.update((_n) => data.files);
          dispatch("newLoc", selected);
          dispatch("notification", {
            status: "success",
            msg: `Deleted file: '${file}'`,
          });
        } else {
          dispatch("notification", {
            status: "alert",
            msg: data.msg,
          });
        }
      });
  };

  const addToDrive = () => {
    let location;
    if (!selected) {
      location = file;
    } else {
      location = selected + "/" + file;
    }
    fetch(`/addFileToDrive?cred=${getCookie("G_VAR2")}&location=${location}`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.msg === "Good") {
          folderStructValue.update((_n) => data.files);
          dispatch("newLoc", selected);
          dispatch("notification", {
            status: "success",
            msg: `Added file to drive.`,
          });
        } else {
          dispatch("notification", {
            status: "alert",
            msg: data.msg,
          });
        }
      });
  };
</script>

{#if moveFile}
  <MoveTo
    {folderStruct}
    exclude={null}
    on:close-move={() => {
      moveFile = false;
    }}
    on:move-here={moveFileHere}
  />
{/if}
{#if deleteFileCheck}
  <BoolPrompt
    on:boolChoose={(e) => {
      deleteFileCheck = false;
      if (e.detail.choose) {
        confirmedDeleteFile();
      }
    }}>Delete <span class="bold">{file}</span>?</BoolPrompt
  >
{/if}
{#if showPrompt}
  <Prompt
    promptPlaceholder={showPrompt.placeholder}
    promptEvent={showPrompt.callback}
    promptExtra={showPrompt.extra}
  />
{/if}
<li>
  {#if previewShow}
    <FilePreview
      on:deleteFile={deleteFile}
      on:downloadFile={downloadFile}
      on:shareFile={shareFileDo}
      on:renameFile={renameFileDo}
      on:addToDrive={addToDrive}
      on:moveFile={() => {
        moveFile = true;
      }}
      {file}
      {selected}
      {metadata}
      {shared}
      on:hidePreview={() => (previewShow = false)}
    />
  {/if}
  <button class="slot" on:click={() => (previewShow = true)}><slot /></button>
  <div class="stuff">
    <button on:click={downloadFile} title="Download">
      <img src="icons/download.svg" alt="Download" />
    </button>
    {#if shared}
      <button title="Add to drive." on:click={addToDrive}>
        <img src="/icons/folder-plus.svg" alt="Add to drive" />
      </button>
    {:else}
      <button
        title="Move"
        on:click={() => {
          moveFile = true;
        }}
      >
        <img src="icons/send-fill.svg" alt="Move" />
      </button>
      <button on:click={shareFileDo} title="Share">
        <img src="icons/share.svg" alt="Share" />
      </button>
    {/if}
    <button on:click={deleteFile} title="Delete">
      <img src="icons/trash.svg" alt="Delete" />
    </button>
  </div>
</li>

<style>
  li {
    list-style: none;
    width: 100%;
    margin-top: 10px;
    height: 40px;
    background-color: var(--file-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    border-radius: 5px;
  }

  .stuff {
    display: none;
    gap: 5px;
    height: 100%;
    width: fit-content;
  }

  .slot {
    border: none;
    font-family: "Roboto", sans-serif;
    background: none;
    font-size: 1.5rem;
    border-bottom: 1px solid currentColor;
    cursor: pointer;
  }

  li:hover {
    background-color: var(--file-hover-color);
  }

  li:hover .stuff {
    display: flex;
  }

  .stuff button {
    border: none;
    background: none;
    cursor: pointer;
    display: grid;
    place-content: center;
    height: 100%;
    width: 25px;
  }

  .stuff button img {
    width: 100%;
    transition: filter 0.25s linear;
  }

  .stuff button:hover img {
    filter: invert(0.25);
  }

  .bold {
    font-weight: bold;
  }
</style>
