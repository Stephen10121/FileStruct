<script>
  import { createEventDispatcher } from "svelte";
  export let location;
  export let folderName;
  export let selected;
  let showSub = false;
  const dispatch = createEventDispatcher();
  const clickFolder = () => {
    dispatch("folderClicked", location);
  };

  $: {
    console.log(location, selected);
  }
</script>

<li id={location + folderName}
  ><button
    class="tributton {showSub ? 'rotateButton' : null}"
    on:click={() => {
      showSub = !showSub;
    }}
  >
    <img src="triangle.svg" alt="" />
  </button>
  <button class="selectButton" on:click={clickFolder}>
    <img src="folder.png" alt="Folder Img" /><p><slot name="folderName" /></p>
  </button></li
>
{#if showSub}
  <ul class="subfolder">
    <slot class="subfolderspan" name="subfolders" />
  </ul>
{/if}

<style>
  li {
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    width: fit-content;
    display: flex;
    gap: 2px;
    border-radius: 5px;
    /* background-color: rebeccapurple; */
  }

  .selectButton {
    font-size: 2rem;
    padding: 5px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    display: flex;
    gap: 5px;
    background-color: var(--folder-color);
    border: none;
    cursor: pointer;
    transition: background-color 0.25s linear;
  }

  .selectButton:hover {
    background-color: var(--folder-hover-color);
  }

  .tributton {
    color: black;
    padding: 0 2px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 2rem;
    font-family: sans-serif;
    user-select: none;
    transition: color 0.25s linear;
    position: relative;
  }

  .tributton::before {
    content: "";
    position: absolute;
    top: 50%;
    right: 20px;
    width: 40px;
    height: 3px;
    transform: translateY(-50%);
    background-color: black;
  }

  .tributton::after {
    content: "";
    position: absolute;
    top: -1988px;
    right: 60px;
    width: 3px;
    height: 2000px;
    transform: translateX(50%);
    background-color: black;
    z-index: 100;
  }

  .tributton:hover {
    color: gray;
  }

  .rotateButton {
    --rotate-deg: 180deg;
  }

  .tributton img {
    width: 1.5rem;
    transform: rotate(var(--rotate-deg));
    transition: transform 0.2s linear;
  }

  li img {
    width: 2rem;
  }

  li p {
    font-family: "Roboto", sans-serif;
    font-size: 1.5rem;
  }

  .subfolder {
    padding-left: 50px;
    overflow: hidden;
  }
</style>
