<script>
  import ToastNotification from "./ToastNotification.svelte";
  import SideFolder from "./SideFolder.svelte";

  export let userData;
  export let PROXY;

  let selected = "none";
  $: selected;
  let notification = null;
</script>

{#if notification !== null}
  <ToastNotification
    type={notification.status}
    on:close={() => {
      notification = null;
    }}>{notification.msg}</ToastNotification
  >
{/if}
<main>
  <SideFolder profile={true} />
  <div class="therest">profile</div>
</main>

<style>
  main {
    display: grid;
    grid-template-columns: 80px auto;
    width: 100vw;
    height: 100vh;
    overflow-y: auto;
  }

  /* @media only screen and (max-width: 850px) {
      main {
        grid-template-columns: 300px auto;
      }
    }
  
    @media only screen and (max-width: 600px) {
      main {
        grid-template-columns: 1fr;
      }
    } */
</style>
