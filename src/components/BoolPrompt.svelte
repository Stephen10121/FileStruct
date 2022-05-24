<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
</script>

<div class="boolPrompt">
  <p><slot /></p>
  <div class="buttons">
    <button
      class="yes"
      on:click={() => {
        dispatch("boolChoose", true);
      }}>Yes</button
    >
    <button
      class="no"
      on:click={() => {
        dispatch("boolChoose", false);
      }}>No</button
    >
  </div>
</div>

<style>
  .boolPrompt {
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    gap: 10px;
    background-color: azure;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    flex-direction: column;
    border-radius: 10px;
  }

  .boolPrompt p {
    font-family: "Roboto", sans-serif;
    font-size: 2rem;
  }

  .buttons {
    display: flex;
    gap: 5px;
  }

  .buttons button {
    border: none;
    cursor: pointer;
    padding: 10px;
    border-radius: 5px;
    font-family: "Poppins", sans-serif;
    transition: background-color 0.25s linear;
  }

  .yes {
    background-color: #adff2f;
  }

  .yes:hover {
    background-color: rgb(141, 221, 22);
  }

  .no {
    background-color: rgb(255, 0, 0);
  }

  .no:hover {
    background-color: rgb(206, 21, 21);
  }
</style>
