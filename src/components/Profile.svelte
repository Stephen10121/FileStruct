<script>
  import ToastNotification from "./ToastNotification.svelte";
  import SideFolder from "./SideFolder.svelte";
  import ImgChoose from "./ImgChoose.svelte";
  import Sharing from "./Sharing.svelte";
  import Theme from "./Theme.svelte";

  export let userData;
  // export let PROXY;

  let selected = "none";
  $: selected;
  let notification = null;
</script>

<svelte:head>
  <title>Profile | GCloud</title>
</svelte:head>

{#if notification !== null}
  <ToastNotification
    type={notification.status}
    on:close={() => {
      notification = null;
    }}>{notification.msg}</ToastNotification
  >
{/if}
<main>
  <SideFolder profile={true} {userData} />
  <div class="therest">
    <ImgChoose
      {userData}
      on:profileClick={({ detail }) => {
        console.log(detail);
      }}
    />
    <div class="double">
      <Sharing />
      <Theme />
    </div>
  </div>
</main>

<style>
  main {
    display: grid;
    grid-template-columns: 80px auto;
    width: 100vw;
    height: 100vh;
    overflow-y: auto;
  }

  .therest {
    width: 100%;
    height: 100vh;
    overflow-y: auto;
    padding: 10px 30px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .double {
    width: 100%;
    height: 200px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
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
