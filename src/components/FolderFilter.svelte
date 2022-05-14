<script>
  import FolderButton from "./FolderButton.svelte";
  import FolderWSButton from "./FolderWSButton.svelte";
  export let currentFolder;
  export let RecursiveFolders;
  export let path;
  export let selected;
</script>

{#each Object.keys(currentFolder) as startFolder (startFolder)}
  {#if startFolder !== "G_files"}
    {#if (Object.keys(currentFolder[startFolder]).length === 0) | (Object.keys(currentFolder[startFolder]).length === 1 && Object.keys(currentFolder[startFolder])[0] === "G_files")}
      <FolderButton
        {selected}
        folderName={startFolder}
        location={path + "/" + startFolder}
        on:folderClicked>{startFolder}</FolderButton
      >
    {:else}
      <FolderWSButton
        {selected}
        folderName={startFolder}
        location={path + "/" + startFolder}
        on:folderClicked
      >
        <span slot="folderName">{startFolder}</span>
        <span slot="subfolders">
          <svelte:component
            this={RecursiveFolders}
            on:folderClicked
            {selected}
            currentFolder={currentFolder[startFolder]}
            path={path + "/" + startFolder}
            {RecursiveFolders}
          /></span
        >
      </FolderWSButton>
    {/if}
  {/if}
{/each}
