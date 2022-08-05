<script>
  import File from "./File.svelte";
  import { fileExtension } from "../../scripts/stores";
  import ToastNotification from "./ToastNotification.svelte";
  export let files;
  export let selected;
  export let folderStruct;
  export let shared;
  let fileExtensionValue;
  let notification = false;

  fileExtension.subscribe((value) => {
    fileExtensionValue = value;
  });
</script>

{#if notification}
  <ToastNotification
    type={notification.status}
    on:close={() => {
      notification = false;
    }}>{notification.msg}</ToastNotification
  >
{/if}
<ul>
  {#if files.length === 0}
    <p class="empty">No Files</p>
  {/if}
  {#each files as file}
    <File
      {selected}
      file={file.name}
      metadata={file.metadata}
      {folderStruct}
      {shared}
      on:newLoc
      on:notification={({ detail }) => {
        notification = detail;
      }}
    >
      {fileExtensionValue
        ? file.name
        : file.name.split(".").slice(0, -1).join(".")}
    </File>
  {/each}
</ul>

<style>
  ul {
    width: 100%;
    padding: 0 10px;
    height: 100%;
    overflow-y: auto;
    background-color: var(--file-section-color);
    position: relative;
  }

  .empty {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 3rem;
    font-family: "Poppins", sans-serif;
    color: var(--file-color);
    user-select: none;
  }
</style>
