<script>
  import { Link } from "svelte-navigator";
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
  <Link to="logout">Logout</Link>
</section>

<style>
  .sideFolder {
    width: 80px;
    height: 100vh;
    background-color: var(--side-folder-color);
    z-index: 150;
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
