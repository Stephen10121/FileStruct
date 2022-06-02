<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let selected;
</script>

<section class="path-grid">
  {#if selected}
    <button
      on:click={() => {
        dispatch("change-dir", null);
      }}>home</button
    ><p>/</p>
    {#each selected.split("/") as folderLocation, i}
      <button
        on:click={() => {
          dispatch(
            "change-dir",
            selected
              .split("/")
              .slice(0, i + 1)
              .join("/")
          );
        }}>{folderLocation}</button
      ><p>/</p>
    {/each}
  {:else}
    <button
      on:click={() => {
        dispatch("change-dir", null);
      }}>home</button
    ><p>/</p>
  {/if}
</section>

<style>
  .path-grid {
    width: 100%;
    height: 100%;
    background-color: var(--folder-selected-color);
    display: flex;
    align-items: center;
    justify-content: start;
    overflow-x: auto;
    padding: 5px 5px;
    gap: 2px;
  }
  button {
    background: none;
    border: none;
    text-decoration: underline;
    cursor: pointer;
    font-family: "Roboto", sans-serif;
    font-size: 1.5rem;
    color: var(--name-font-color);
  }

  p {
    background: none;
    border: none;
    font-family: "Roboto", sans-serif;
    font-size: 1.5rem;
    color: var(--name-font-color);
  }

  ::-webkit-scrollbar {
    width: 7px;
    height: 2px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background: #888;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
</style>
