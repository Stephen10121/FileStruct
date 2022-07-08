<script>
  import { Link } from "svelte-navigator";
  import FileUpload from "./FileUpload.svelte";
</script>

<button
  class="slide-folder-button"
  id="slide-button"
  on:click={() => {
    if (document.getElementById("slide-button").style.left === "85px") {
      document.getElementById("slide-button").style.left = "5px";
      document.getElementById("sideFolder").style.left = "-80px";
      return;
    }
    document.getElementById("slide-button").style.left = "85px";
    document.getElementById("sideFolder").style.left = 0;
  }}><img src="/icons/grid.svg" alt="Menu" /></button
>

<section class="sideFolder" id="sideFolder">
  <Link to="about">About page</Link>
  <FileUpload />
  <div class="logoutbox">
    <Link to="logout" class="logout"><p class="logout">Logout</p></Link>
  </div>
</section>

<style>
  .sideFolder {
    width: 80px;
    height: 100vh;
    background-color: var(--side-folder-color);
    z-index: 150;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    flex-direction: column;
    padding: 10px;
  }
  .slide-folder-button {
    position: fixed;
    bottom: 5px;
    left: 5px;
    border: none;
    cursor: pointer;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    background-color: var(--side-folder-color);
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    transition: left 0.25s linear;
    display: none;
  }

  .slide-folder-button img {
    width: 50%;
  }

  .logoutbox {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logout {
    color: var(--file-color);
    background-color: var(--folder-section-color);
    padding: 10px;
    width: 100%;
    font-size: 1.25rem;
    font-family: "Poppins", sans-serif;
    border-radius: 5px;
    transition: background-color 0.25s linear;
  }

  .logout:hover {
    background-color: var(--file-section-color);
  }

  @media only screen and (max-width: 850px) {
    .sideFolder {
      position: fixed;
      top: 0;
      left: -80px;
      transition: left 0.25s linear;
    }

    .slide-folder-button {
      display: block;
    }
  }
</style>
