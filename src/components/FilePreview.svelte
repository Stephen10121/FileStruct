<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let selected;
  export let file;
  export let metadata;

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
  fetch(
    `http://localhost:5500/getFileData?location=./storage/${selected}/${file}`
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
  <button class="previewBox" on:click={closePreviewBox}>
    {#if fileData["video"]}
      <video id="previewBoxView" controls muted="muted" autoplay>
        <source
          src="http://localhost:5500/getVideoStream?location={selected +
            '/' +
            file}"
          type="video/mp4"
        />
      </video>
    {:else}
      <div id="previewBoxView" class="previewBoxView">
        <p>{fileData}</p>
      </div>
    {/if}
  </button>
  <div class="previewMeta">
    <button class="close-button" on:click={() => dispatch("hidePreview", true)}
      >&#10006;</button
    >
    <h1>About File</h1>
    <p>Size: <span>{fileSize}{fileSizeUnit}</span></p>
    <p>Date created: <span>{metadata.dateCreated}</span></p>
    <p>Location: <span>./{selected}/{file}</span></p>
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
    background-color: rgba(153, 153, 153, 0.5);
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
    height: 50%;
    background-color: #dfdfdf;
    padding: 10px;
    border-radius: 10px;
  }

  .previewBoxView p {
    font-size: 2rem;
    color: rgb(87, 87, 87);
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
</style>
