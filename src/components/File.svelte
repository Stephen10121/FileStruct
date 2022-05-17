<script>
  import FilePreview from "./FilePreview.svelte";
  export let selected;
  export let file;
  let previewShow = false;
</script>

<li>
  <FilePreview
    {file}
    {selected}
    {previewShow}
    on:hidePreview={() => (previewShow = false)}
  />
  <button on:click={() => (previewShow = true)}><slot /></button>
  <div class="stuff">
    <button><img src="icons/download.svg" alt="Download" /></button>
    <button><img src="icons/share.svg" alt="Share" /></button>
    <button><img src="icons/trash.svg" alt="Trash" /></button>
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
