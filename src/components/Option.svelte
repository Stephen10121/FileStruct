<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let nonSelectable;
  export let icon;
  export let alt;
  export let ident;
</script>

<button
  class="option {nonSelectable ? 'non-selectable' : ''}"
  on:click={() => {
    if (!nonSelectable) {
      dispatch("clicked", ident);
    }
  }}
>
  <img src={icon} {alt} />
  <p><slot /></p>
</button>

<style>
  .option {
    width: 100%;
    height: 40px;
    background-color: rgba(0, 0, 0, 0);
    border-radius: 7px;
    padding: 5px;
    cursor: pointer;
    transition: background-color 0.25s linear;
    display: flex;
    align-items: center;
    gap: 10px;
    border: none;
  }

  .option:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .non-selectable {
    cursor: default;
    user-select: none;
    background-color: rgba(0, 0, 0, 0.1);
    outline: none;
  }

  .non-selectable:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .option img {
    width: 20px;
  }

  .option p {
    font-size: 1.5rem;
    font-family: "Poppins", sans-serif;
    font-weight: bold;
    font-stretch: semi-expanded;
  }
</style>
