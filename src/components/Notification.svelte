<script>
  import { createEventDispatcher } from "svelte";
  export let type;

  const dispatch = createEventDispatcher();
  const handleClose = () => {
    dispatch("close-notification", false);
  };
</script>

<div
  class="notification"
  style="background-color:{type == 'alert'
    ? 'red'
    : type == 'success'
    ? 'rgb(27, 207, 27)'
    : 'rgb(2, 109, 170)'}"
>
  <p><slot /></p>
  <button on:click={handleClose}>&#10006;</button>
</div>

<style>
  .notification {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2rem;
    background-color: rgb(2, 109, 170);
  }

  .notification p {
    font-size: 2rem;
    font-family: "Roboto", sans-serif;
  }

  .notification button {
    color: black;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 2rem;
    transition: color 0.25s linear;
  }

  .notification button:hover {
    color: gray;
  }
</style>
