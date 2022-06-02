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
    >
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
      >
    {/each}
  {:else}
    <button
      on:click={() => {
        dispatch("change-dir", null);
      }}>home</button
    >
  {/if}
</section>

<style>
  .path-grid {
    width: 100%;
    height: 100%;
    background-color: var(--folder-selected-color);
    display: flex;
    padding: 5px 5px;
  }
  .path-grid button {
    background: none;
    border: none;
    text-decoration: underline;
    cursor: pointer;
    font-family: "Roboto", sans-serif;
    font-size: 1.5rem;
    color: white;
  }
  .path-grid button::after {
    content: "/";
    margin: 0 5px;
    display: inline-block;
    text-decoration: none;
    cursor: default;
    user-select: none;
  }
</style>
