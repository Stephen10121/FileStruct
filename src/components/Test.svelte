<script>
  import Notification from "./components/Notification.svelte";
  let alertType = "success";
  let notificationMessage = "";
  let notification;

  const setType = () => {
    alertType =
      alertType == "success"
        ? "alert"
        : alertType == "alert"
        ? "nuetral"
        : "success";
  };
</script>

<main>
  {#if notification}
    <Notification
      type={alertType}
      on:close-notification={(e) => {
        notification = e.detail;
      }}>{notificationMessage}</Notification
    >
  {/if}
  <input
    type="text"
    placeholder="Set Notification Message"
    bind:value={notificationMessage}
  />
  <button on:click={setType}>Set type</button>
  <button
    on:click={() => {
      notification = true;
    }}>Show Notification</button
  >
</main>

<style>
  main {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    flex-direction: column;
    gap: 2rem;
  }

  main input {
    width: 20rem;
    height: 4rem;
    border: 1px solid gray;
    border-radius: 10px;
    padding: 5px;
  }

  main input:focus {
    outline: 1px solid gray;
  }

  main button {
    cursor: pointer;
    padding: 2rem;
    font-family: "Poppins", sans-serif;
    border-radius: 10px;
    border: none;
    background-color: #dfdfdf;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    transition: box-shadow 0.25s linear;
  }

  main button:hover {
    box-shadow: rgb(0 0 0 / 24%) 2px 4px 8px;
  }

  main button:focus {
    outline: 1px solid gray;
  }
</style>
