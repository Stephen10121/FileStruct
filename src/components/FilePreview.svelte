<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let selected;
  export let file;
  export let metadata;
  export let PROXY;
  export let shared;

  let fileData = "N/A";
  let fileSizeUnit = "b";
  let fileSize = metadata.size;
  if (metadata.size > 1000000000) {
    fileSizeUnit = "Gb";
    fileSize = Math.round(metadata.size / 1000000000);
  } else if (metadata.size > 1000000) {
    fileSizeUnit = "Mb";
    fileSize = Math.round(metadata.size / 1000000);
  } else if (metadata.size > 1000) {
    fileSizeUnit = "Kb";
    fileSize = Math.round(metadata.size / 1000);
  }
  let path;
  if (selected) {
    path = `./${selected}/${file}`;
  } else {
    path = `./${file}`;
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  fetch(
    `${PROXY}getFileData?location=${path}&cred=${getCookie(
      "G_VAR2"
    )}&shared=${shared}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data["video"]) {
        fileData = { video: true };
      } else {
        fileData = data.fileData;
      }
    });

  const closePreviewBox = (e) => {
    const innerBox = document.querySelector("#previewBoxView");
    const x = e.pageX,
      y = e.pageY,
      boxX = innerBox.getBoundingClientRect().left,
      boxY = innerBox.getBoundingClientRect().top,
      boxWidth = innerBox.offsetWidth,
      boxHeight = innerBox.offsetHeight;
    if (
      !(
        (x >= boxX) &
        (x <= boxX + boxWidth) &
        (y >= boxY) &
        (y <= boxY + boxHeight)
      )
    ) {
      dispatch("hidePreview", true);
    }
  };
</script>

<div class="preview">
  <div class="previewBox" on:click={closePreviewBox}>
    {#if fileData["video"]}
      <video id="previewBoxView" controls autoplay muted={false}>
        <source
          src="{PROXY}getVideoStream?location={path}&cred={getCookie('G_VAR2')}"
          type="video/mp4"
        />
      </video>
    {:else}
      <div id="previewBoxView" class="previewBoxView">
        <pre>{fileData}</pre>
      </div>
    {/if}
  </div>
  <div class="previewMeta">
    <button class="close-button" on:click={() => dispatch("hidePreview", true)}
      >&#10006;</button
    >
    <h1>About File</h1>
    <p>Size: <span>{fileSize}{fileSizeUnit}</span></p>
    <p>Date created: <span>{metadata.dateCreated}</span></p>
    {#if selected}
      <p>Location: <span>./{selected}/{file}</span></p>
    {:else}
      <p>Location: <span>./{file}</span></p>
    {/if}
    <div class="actionButtons">
      <button
        class="downloadButton"
        on:click={() => {
          dispatch("downloadFile", true);
        }}>Download</button
      >
      {#if shared}
        <button
          class="addToDriveButton"
          on:click={() => {
            dispatch("addToDrive", true);
            dispatch("hidePreview", true);
          }}>Add to Drive</button
        >
      {:else}
        <button
          class="shareButton"
          on:click={() => {
            dispatch("shareFile", true);
            dispatch("hidePreview", true);
          }}>Share</button
        >
        <button
          class="renameButton"
          on:click={() => {
            dispatch("renameFile", true);
            dispatch("hidePreview", true);
          }}>Rename</button
        >
        <button
          class="moveButton"
          on:click={() => {
            dispatch("moveFile", true);
            dispatch("hidePreview", true);
          }}>Move</button
        >
      {/if}
      <button
        class="deleteButton"
        on:click={() => {
          dispatch("deleteFile", true);
          dispatch("hidePreview", true);
        }}>Delete</button
      >
    </div>
  </div>
</div>

<style>
  .close-button {
    position: absolute;
    top: 0;
    right: 3px;
    width: 20px;
    height: 20px;
    color: white;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 2rem;
  }
  .preview {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: none;
    z-index: 100;
    border: none;
    display: grid;
    grid-template-columns: 70% 30%;
    animation: slideIn 2s linear forwards;
  }

  .previewBox {
    background-color: rgba(61, 61, 61, 0.5);
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: slideIn2 2s linear forwards;
    outline: none;
    border: none;
  }

  .previewBoxView {
    width: 50%;
    height: 50vh;
    overflow: auto;
    background-color: #292d3e;
    padding: 10px;
    border-radius: 10px;
  }

  .previewBoxView pre {
    font-size: 2rem;
    color: #bfc9ba;
    font-family: "Roboto";
  }

  .previewMeta {
    width: 100%;
    height: 100%;
    background-color: rgb(37, 37, 37);
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 20px;
    position: relative;
    padding: 10px 20px;
  }

  .previewMeta h1 {
    font-family: "Poppins", sans-serif;
    font-size: 3rem;
    color: orange;
  }

  .previewMeta p {
    font-family: "Roboto", sans-serif;
    font-size: 1.5rem;
    font-weight: bold;
    color: rgb(194, 194, 194);
  }

  .previewMeta p span {
    font-weight: normal;
    color: rgb(194, 194, 194);
    color: rgb(255, 255, 255);
  }

  @keyframes slideIn {
    0% {
      left: 30%;
    }
    20% {
      left: 0;
    }
    100% {
      left: 0;
    }
  }
  @keyframes slideInsmall {
    0% {
      left: 100%;
    }
    20% {
      left: 0;
    }
    100% {
      left: 0;
    }
  }
  @keyframes slideIn2 {
    0% {
      visibility: hidden;
    }
    20% {
      visibility: hidden;
    }
    100% {
      visibility: visible;
    }
  }

  video {
    width: 70%;
  }

  .actionButtons {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
  }

  .actionButtons button {
    padding: 10px 10px;
    font-family: "Poppins", sans-serif;
    cursor: pointer;
    border: none;
    border-radius: 5px;
    transition: outline 0.15s linear;
  }

  .renameButton {
    background-color: rgb(60, 37, 163);
    outline: 1px solid rgb(60, 37, 163);
  }

  .renameButton:hover {
    outline: 3px solid rgb(60, 37, 163);
  }

  .addToDriveButton {
    background-color: rgb(17, 131, 112);
    outline: 1px solid rgb(17, 131, 112);
  }

  .addToDriveButton:hover {
    outline: 3px solid rgb(17, 131, 112);
  }

  .moveButton {
    background-color: rgb(163, 47, 154);
    outline: 1px solid rgb(163, 47, 154);
  }

  .moveButton:hover {
    outline: 3px solid rgb(163, 47, 154);
  }

  .downloadButton {
    background-color: rgb(47, 190, 47);
    outline: 1px solid rgb(47, 190, 47);
  }

  .downloadButton:hover {
    outline: 3px solid rgb(47, 190, 47);
  }

  .shareButton {
    background-color: rgb(37, 99, 156);
    outline: 1px solid rgb(37, 99, 156);
  }

  .shareButton:hover {
    outline: 3px solid rgb(37, 99, 156);
  }

  .deleteButton {
    background-color: rgb(153, 0, 0);
    outline: 1px solid rgb(153, 0, 0);
  }

  .deleteButton:hover {
    outline: 3px solid rgb(153, 0, 0);
  }

  @media only screen and (max-width: 1000px) {
    .preview {
      z-index: 200;
      grid-template-columns: 1fr;
      grid-template-rows: 2fr 1fr;
      animation: slideInsmall 2s linear forwards;
    }
  }
</style>
