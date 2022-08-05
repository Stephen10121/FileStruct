<script>
  import BuildFolderStruct from "./BuildFolderStruct.svelte";
  import RightClick from "./RightClick.svelte";
  export let userData;
  export let folderStruct;
  export let selected;
  export let shared;
  $: folderStruct;

  let contextMenu;

  const hideRightClick = () => {
    contextMenu.style.visibility = "hidden";
  };
  const menuShow = (e) => {
    let x = e.pageX,
      y = e.pageY,
      winWidth = window.innerWidth,
      winHeight = window.innerHeight,
      cmWidth = contextMenu.offsetWidth,
      cmHeight = contextMenu.offsetHeight;
    contextMenu.style.left = `${
      x > winWidth - cmWidth ? winWidth - cmWidth : x
    }px`;
    contextMenu.style.top = `${
      y > winHeight - cmHeight ? winHeight - cmHeight : y
    }px`;
    contextMenu.style.visibility = "visible";
  };
  document.addEventListener("click", (e) => {
    if (!contextMenu) {
      return;
    }
    if (contextMenu.style.visibility !== "visible") {
      return;
    }
    const pos = {
      x: parseInt(contextMenu.style.left.replace("px", "")),
      y: parseInt(contextMenu.style.top.replace("px", "")),
      width: contextMenu.offsetWidth,
      height: contextMenu.offsetHeight,
    };
    if (
      pos.x + pos.width >= e.pageX &&
      e.pageX >= pos.x &&
      pos.y + pos.height >= e.pageY &&
      e.pageY >= pos.y
    ) {
      return;
    }
    hideRightClick();
  });
</script>

{#if shared}
  <section class="right-click" bind:this={contextMenu}>
    <RightClick
      bind:this={contextMenu}
      {selected}
      {shared}
      on:addToDrive
      on:delete-folder
      on:settings
      on:close-right={hideRightClick}
    />
  </section>
{:else}
  <section class="right-click" bind:this={contextMenu}>
    <RightClick
      bind:this={contextMenu}
      {selected}
      {shared}
      on:new-folder
      on:rename-folder
      on:delete-folder
      on:move-folder
      on:share-folder
      on:settings
      on:close-right={hideRightClick}
    />
  </section>
{/if}
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
    document.getElementById("folder-part").style.right = "0";
  }}><img src="/icons/folder-fill.svg" alt="Folder" /></button
>
<section
  class="folder-part"
  id="folder-part"
  on:contextmenu|preventDefault={menuShow}
>
  <section class="name-section">
    <p>{userData.usersRName}</p>
  </section>
  <BuildFolderStruct
    folders={folderStruct}
    on:folderClicked
    {selected}
    exclude={false}
  />
</section>

<style>
  .right-click {
    z-index: 400;
    position: fixed;
    top: 50%;
    left: 50%;
    width: 200px;
    background-color: rgb(230, 230, 230);
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    padding: 5px 4px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    visibility: hidden;
  }
  .folder-part-button {
    position: fixed;
    bottom: 5px;
    right: 5px;
    border: none;
    cursor: pointer;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    z-index: 101;
    background-color: var(--side-folder-color);
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    transition: right 0.25s linear;
    display: none;
  }

  .folder-part-button img {
    width: 50%;
  }

  .folder-part {
    height: 100vh;
    width: 300px;
    display: grid;
    grid-template-rows: 70px auto;
    overflow-y: auto;
    z-index: 100;
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
