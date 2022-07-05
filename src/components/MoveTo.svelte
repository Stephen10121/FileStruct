<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  import BuildFolderStruct from "./BuildFolderStruct.svelte";
  export let folderStruct;
  export let exclude;
  let mockSelected = null;

  const closeMove = (e) => {
    if (e.target.id === "cover") {
      dispatch("close-move", true);
    }
  };

  const moveToPlace = (e) => {
    mockSelected = e.detail;
  };
</script>

<div id="cover" class="cover" on:click={closeMove}>
  <div class="info">
    <BuildFolderStruct
      folders={folderStruct}
      on:folderClicked={moveToPlace}
      {exclude}
      selected={mockSelected}
    />
  </div>
  <div class="buttons">
    {#if mockSelected !== null}
      <button
        class="move"
        on:click={() => {
          dispatch("move-here", mockSelected);
          dispatch("close-move", true);
        }}>Move Here.</button
      >
    {/if}
    <button
      class="cancel"
      on:click={() => {
        dispatch("close-move", true);
      }}>Cancel</button
    >
  </div>
</div>

<style>
  .cover {
    position: fixed;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-direction: column;
    gap: 10px;
  }

  .info {
    width: 40%;
    height: 60%;
    background-color: white;
    border-radius: 10px;
    overflow: hidden;
    cursor: default;
  }

  .buttons {
    display: flex;
    gap: 10px;
  }

  button {
    padding: 10px;
    font-size: 2rem;
    font-family: "Roboto", sans-serif;
    cursor: pointer;
    border: none;
    color: white;
    transition: background-color 0.25s linear;
  }

  .cancel {
    background-color: red;
    border-radius: 10px;
  }

  .cancel:hover {
    background-color: rgb(202, 0, 0);
  }

  .move {
    border-radius: 100vw;
    background-color: rgb(0, 119, 255);
  }

  .move:hover {
    background-color: rgb(0, 98, 211);
  }
</style>
