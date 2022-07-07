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
  {#each files as file}
    <File {selected} {PROXY} file={file.name} metadata={file.metadata}>
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
  }
</style>
