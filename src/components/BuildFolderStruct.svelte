<script>
  import { createEventDispatcher } from "svelte";
  import FolderButton from "./FolderButton.svelte";
  import FolderWSButton from "./FolderWSButton.svelte";
  import FolderFilter from "./FolderFilter.svelte";
  export let folders;
  export let selected;
  export let exclude;
  $: folders;

  const dispatch = createEventDispatcher();
  let currentFolder = "";

  $: {
    dispatch("folderClicked", currentFolder);
  }
</script>

<ul>
  {#each Object.keys(folders) as startFolder (startFolder)}
    {#if startFolder !== "G_files"}
      {#if (Object.keys(folders[startFolder]).length === 0) | (Object.keys(folders[startFolder]).length === 1 && Object.keys(folders[startFolder])[0] === "G_files")}
        <FolderButton
          {exclude}
          {selected}
          folderName={startFolder}
          location={startFolder}
          on:folderClicked={(e) => {
            if (currentFolder === e.detail) {
              dispatch("folderClicked", currentFolder);
            } else {
              currentFolder = e.detail;
            }
          }}>{startFolder}</FolderButton
        >
      {:else}
        <FolderWSButton
          {exclude}
          {selected}
          folderName={startFolder}
          location={startFolder}
          on:folderClicked={(e) => {
            if (currentFolder === e.detail) {
              dispatch("folderClicked", currentFolder);
            } else {
              currentFolder = e.detail;
            }
          }}
        >
          <span slot="folderName">{startFolder}</span>
          <span slot="subfolders"
            ><FolderFilter
              {selected}
              {exclude}
              on:folderClicked
              path={startFolder}
              currentFolder={folders[startFolder]}
              RecursiveFolders={FolderFilter}
            /></span
          >
        </FolderWSButton>
      {/if}
    {/if}
  {/each}
</ul>

<style>
  ul {
    width: 100%;
    height: 100%;
    padding-left: 10px;
    background-color: var(--folder-section-color);
    overflow-x: auto;
    overflow-y: auto;
  }
</style>
