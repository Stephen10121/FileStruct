<script>
  import { useNavigate } from "svelte-navigator";
  const navigate = useNavigate();
  import NotLogged from "./NotLogged.svelte";
  import Profile from "./Profile.svelte";
  import Shared from "./Shared.svelte";
  import Home from "./Home.svelte";
  export let PROXY;
  export let profile;
  export let shared;

  let isLogged = false;
  let userData;
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  const cookie = getCookie("G_VAR2");

  if (cookie === undefined || cookie === null) {
    navigate("/");
    isLogged = false;
  } else {
    fetch(`${PROXY}userData?cred=${getCookie("G_VAR2")}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status !== 200) {
          navigate("/");
          isLogged = false;
        } else {
          loggedIn({ detail: data.userData });
        }
      });
  }

  const loggedIn = (e) => {
    userData = e.detail;
    isLogged = true;
  };
</script>

{#if isLogged}
  {#if profile}
    <Profile {userData} {PROXY} />
  {:else if shared}
    <Shared {userData} {PROXY} />
  {:else}
    <Home {userData} {PROXY} />
  {/if}
{:else}
  <NotLogged on:userLoggedIn={loggedIn} {PROXY} />
{/if}
