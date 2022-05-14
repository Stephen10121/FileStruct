<script>
  import { createEventDispatcher } from "svelte";
  import FolderButton from "./FolderButton.svelte";
  import FolderWSButton from "./FolderWSButton.svelte";
  import FolderFilter from "./FolderFilter.svelte";
  export let folders;
  export let selected;

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
    width: 500px;
    height: 90%;
    padding-left: 50px;
  }
</style>
