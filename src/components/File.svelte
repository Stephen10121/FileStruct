<script>
  import FilePreview from "./FilePreview.svelte";
  export let selected;
  export let file;
  export let metadata;
  let previewShow = false;

  const downloadFile = () => {
    console.log("Download");
  };

  const shareFile = () => {
    console.log("Share");
  };

  const deleteFile = () => {
    console.log("Delete");
  };
</script>

<li>
  {#if previewShow}
    <FilePreview
      {file}
      {selected}
      {metadata}
      on:hidePreview={() => (previewShow = false)}
    />
  {/if}
  <button on:click={() => (previewShow = true)}><slot /></button>
  <div class="stuff">
    <button on:click={downloadFile}
      ><img src="icons/download.svg" alt="Download" /></button
    >
    <button on:click={shareFile}
      ><img src="icons/share.svg" alt="Share" /></button
    >
    <button on:click={deleteFile}
      ><img src="icons/trash.svg" alt="Trash" /></button
    >
  </div>
</li>

<style>
  li {
    list-style: none;
    width: 100%;
    margin-top: 10px;
    height: 40px;
    background-color: rgb(146, 146, 146);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    border-radius: 5px;
  }

  .stuff {
    display: none;
    gap: 10px;
  }

  li button {
    border: none;
    font-family: "Roboto", sans-serif;
    background: none;
    font-size: 1.5rem;
    border-bottom: 1px solid currentColor;
    cursor: pointer;
  }

  li:hover {
    background-color: rgb(124, 124, 124);
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
  }

  .stuff button img {
    width: 25px;
  }
</style>
