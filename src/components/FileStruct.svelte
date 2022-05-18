<script>
  import File from "./File.svelte";
  export let files;
  export let selected;
</script>

<ul>
  {#each files as file}
    <File {selected} file={file.name} metadata={file.metadata}>
      {file.name}
    </File>
  {/each}
</ul>

<style>
  ul {
    width: 100%;
    padding: 0 10px;
    height: 100%;
    overflow-y: auto;
  }
</style>
