<script>
  export let promptPlaceholder;
  export let promptEvent;
  export let promptExtra;

  const divClick = (e) => {
    if (e.target.id === "coverPrompt") {
      promptEvent(false, promptExtra);
    }
  };
</script>

<div class="prompt" id="coverPrompt" on:click={divClick}>
  <form on:submit|preventDefault={(e) => promptEvent(e, promptExtra)}>
    <input type="text" placeholder={promptPlaceholder} />
    <button type="submit">Make Folder</button>
  </form>
  <button class="close" on:click={() => promptEvent(false, promptExtra)}
    >&#10006;</button
  >
</div>

<style>
  div {
    position: fixed;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 101;
  }

  form {
    width: 60%;
    height: 60px;
    background-color: white;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
    padding: 10px;
    display: grid;
    grid-template-columns: 5fr 2fr;
    gap: 10px;
  }
  input {
    width: 100%;
    height: 100%;
    border: 1px solid black;
    border-radius: 5px;
    padding-left: 5px;
    font-family: "Poppins", sans-serif;
  }

  form button {
    cursor: pointer;
    border: none;
    background-color: rgb(22, 207, 22);
    font-family: "Roboto", sans-serif;
    border-radius: 5px;
    transition: background-color 0.25s linear;
    font-size: 1.5rem;
  }

  form button:hover {
    background-color: rgb(0, 255, 0);
  }

  .close {
    width: 60px;
    height: 60px;
    border: none;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    font-size: 1.6rem;
    cursor: pointer;
    background-color: rgb(245, 184, 184);
    transition: background-color 0.25s linear;
  }

  .close:hover {
    background-color: rgb(255, 129, 129);
  }
</style>
