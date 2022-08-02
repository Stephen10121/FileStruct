<script>
  import { Link } from "svelte-navigator";
  import FileUpload from "./FileUpload.svelte";
  export let profile;
  export let shared;
  export let PROXY;
  export let selected;
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
  {#if profile}
    <Link to="/">
      <div class="div-img" title="Home">
        <img src="icons/house-fill.svg" alt="Home" />
      </div>
    </Link>
  {:else}
    <Link to="/profile"><div title="Profile" class="profile" /></Link>
  {/if}
  {#if !shared && !profile}
    <FileUpload {PROXY} {selected} on:update-file-struct />
  {/if}
  {#if shared}
    <Link to="/">
      <div class="div-img" title="Home">
        <img src="icons/house-fill.svg" alt="Home" />
      </div>
    </Link>
  {:else}
    <Link to="/shared">
      <div class="div-img" title="Shared">
        <img src="icons/people-fill.svg" alt="Shared" />
      </div>
    </Link>
  {/if}
  <div class="logoutbox">
    <Link to="/logout" class="logout"><p class="logout">Logout</p></Link>
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
    padding: 100px 10px;
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

  .div-img {
    width: 80px;
    padding: 0 10px;
  }

  .div-img img {
    width: 100%;
    transition: filter 0.25s linear;
  }

  .div-img:hover img {
    filter: invert(0.5);
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

  .profile {
    width: 70px;
    height: 70px;
    background-color: red;
    border-radius: 50%;
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
      z-index: 101;
    }
  }
</style>
