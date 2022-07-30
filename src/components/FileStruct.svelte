<script>
  import File from "./File.svelte";
  import { fileExtension } from "../../scripts/stores";
  export let files;
  export let selected;
  export let PROXY;
  let fileExtensionValue;

  fileExtension.subscribe((value) => {
    fileExtensionValue = value;
  });
</script>

<ul>
  {#if files.length === 0}
    <p class="empty">No Files</p>
  {/if}
  {#each files as file}
    <File
      {selected}
      {PROXY}
      file={file.name}
      metadata={file.metadata}
      on:newLoc
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
