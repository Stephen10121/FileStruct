<script>
  import BuildFolderStruct from "./BuildFolderStruct.svelte";
  export let userData;
  export let folderStruct2;
  export let selected;
</script>

<button
  class="folder-part-button"
  id="folderpartbutton"
  on:click={() => {
    if (document.getElementById("folderpartbutton").style.right === "215px") {
      document.getElementById("folderpartbutton").style.right = "5px";
      document.getElementById("folder-part").style.right = "-300px";
      return;
    }
    document.getElementById("folderpartbutton").style.right = "215px";
    document.getElementById("folder-part").style.right = 0;
  }}><img src="/icons/folder-fill.svg" alt="Folder" /></button
>
<section class="folder-part" id="folder-part">
  <section class="name-section">
    <p>{userData.usersRName}</p>
  </section>
  <BuildFolderStruct folders={folderStruct2} on:folderClicked {selected} />
</section>

<style>
  .folder-part-button {
    position: fixed;
    bottom: 5px;
    right: 5px;
    border: none;
    cursor: pointer;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    z-index: 150;
    background-color: var(--side-folder-color);
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    transition: right 0.25s linear;
    display: none;
  }

  .folder-part-button img {
    width: 50%;
  }

  .folder-part {
    height: 100%;
    display: grid;
    grid-template-rows: 70px auto;
  }

  .name-section {
    background-color: var(--name-section-color);
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
  }

  .name-section p {
    font-family: "Poppins", sans-serif;
    font-size: 3rem;
    color: var(--name-font-color);
  }
  @media only screen and (max-width: 600px) {
    .folder-part {
      position: fixed;
      right: -300px;
      top: 0;
      transition: right 0.25s linear;
    }

    .folder-part-button {
      display: block;
    }
  }
</style>
