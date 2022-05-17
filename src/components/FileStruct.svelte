<script>
  import File from "./File.svelte";
  export let files;
  export let selected;
  console.log(files);
  let x = 0;
</script>

<ul>
  {#each files as file}
    <File {selected} {file}>{file}</File>
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
