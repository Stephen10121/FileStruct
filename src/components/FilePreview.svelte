<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let selected;
  export let previewShow;
  export let file;
  let fileData = { size: "N/A", dateCreated: "N/A" };
  const getMetaData = () => {
    fetch(
      `http://localhost:5500/fetchFileData?location=./storage/${selected}/${file}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        fileData = data.fileData;
      });
  };

  if (previewShow) {
    getMetaData();
  }
  $: {
    getMetaData();
  }
</script>

<div class="preview {previewShow ? 'showPreview' : 'hidePreview'}">
  <div class="previewBox">
    <div class="previewBoxView">View</div>
  </div>
  <div class="previewMeta">
    <button class="close-button" on:click={() => dispatch("hidePreview", true)}
      >&#10006;</button
    >
    <h1>About File</h1>
    <p>Size: <span>{fileData.size}b</span></p>
    <p>Date created: <span>{fileData.dateCreated}</span></p>
    <p>Location: <span>{selected}/{file}</span></p>
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
  }

  .previewBox {
    background-color: rgba(153, 153, 153, 0.5);
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .previewBoxView {
    width: 50%;
    height: 50%;
    background-color: white;
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

  .hidePreview {
    visibility: hidden;
  }

  .showPreview {
    animation: slideIn 2s linear forwards;
  }

  .showPreview .previewBox {
    animation: slideIn2 2s linear forwards;
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
</style>
