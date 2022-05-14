<script>
  import { createEventDispatcher } from "svelte";
  export let location;
  export let folderName;
  const dispatch = createEventDispatcher();
  const clickFolder = () => {
    dispatch("folderClicked", location);
  };
</script>

<li id={location + folderName}>
  <button class="tributton">
    <img src="triangle.svg" alt="" />
  </button>
  <button class="selectButton" on:click={clickFolder}>
    <img src="folder.png" alt="Folder Img" /><p><slot /></p>
  </button>
</li>

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

  .tributton::before {
    content: "";
    position: absolute;
    top: 50%;
    right: 20px;
    width: 40px;
    height: 3px;
    transform: translateY(-50%);
    background-color: black;
    z-index: 0;
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

  .tributton {
    pointer-events: none;
    color: black;
    position: relative;
    padding: 0 2px;
    border: none;
    user-select: none;
    background: none;
    cursor: pointer;
    font-size: 2rem;
    font-family: sans-serif;
    transition: color 0.25s linear, transform 0.2s linear;
  }

  .tributton:hover {
    color: gray;
  }

  .tributton img {
    width: 1.5rem;
    filter: invert(50%);
    transform: rotate(var(--rotate-deg));
  }

  li img {
    width: 2rem;
  }

  li p {
    font-family: "Roboto", sans-serif;
    font-size: 1.5rem;
  }
</style>
