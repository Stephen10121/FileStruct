<script>
  import FilePreview from "./FilePreview.svelte";
  import FileShare from "./FileShare.svelte";
  import ToastNotification from "./ToastNotification.svelte";
  import BoolPrompt from "./BoolPrompt.svelte";
  export let selected;
  export let file;
  export let metadata;
  let notification = null;
  let previewShow = false;
  let showFileShare = false;
  let deleteFileCheck = false;

  const downloadFile = () => {
    console.log("Download");
  };

  const shareFile = () => {
    showFileShare = true;
  };

  const deleteFile = () => {
    deleteFileCheck = true;
  };
</script>

{#if deleteFileCheck}
  <BoolPrompt
    on:boolChoose={(e) => {
      deleteFileCheck = false;
      console.log(e.detail);
    }}>Delete <span class="bold">{file}</span>?</BoolPrompt
  >
{/if}
{#if showFileShare}
  <FileShare
    {file}
    on:shareTo={(e) => {
      notification = { msg: e.detail, status: "success" };
    }}
    on:hideShare={() => {
      showFileShare = false;
    }}
  />
{/if}
{#if notification !== null}
  <ToastNotification
    type={notification.status}
    on:close={() => {
      notification = null;
    }}>{notification.msg}</ToastNotification
  >
{/if}
<li>
  {#if previewShow}
    <FilePreview
      on:deleteFile={deleteFile}
      on:downloadFile={downloadFile}
      on:shareFile={shareFile}
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
    background-color: var(--file-color);
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
  }

  .stuff button img {
    width: 25px;
  }

  .bold {
    font-weight: bold;
  }
</style>
