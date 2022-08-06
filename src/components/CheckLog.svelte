<script>
  import { useNavigate } from "svelte-navigator";
  const navigate = useNavigate();
  import NotLogged from "./NotLogged.svelte";
  import Profile from "./Profile.svelte";
  import Shared from "./Shared.svelte";
  import Home from "./Home.svelte";
  export let profile;
  export let shared;

  let isLogged = false;
  let userData;
  const r = document.querySelector(":root");

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
    fetch(`/userData?cred=${getCookie("G_VAR2")}`)
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
    if (JSON.parse(userData.usersProfile).theme === "dark") {
      r.style.setProperty("--folder-color", "#0070a3");
      r.style.setProperty("--folder-hover-color", "#004b6e");
      r.style.setProperty("--folder-selected-color", "#002638");
      r.style.setProperty("--file-color", "rgb(146, 146, 146)");
      r.style.setProperty("--file-hover-color", "rgb(124, 124, 124)");
      r.style.setProperty("--file-section-color", "rgb(23, 28, 34)");
      r.style.setProperty("--folder-section-color", "rgb(28, 41, 56)");
      r.style.setProperty("--name-section-color", "rgb(34, 35, 37)");
      r.style.setProperty("--name-font-color", "rgb(172, 172, 172)");
      r.style.setProperty("--side-folder-color", "rgb(14, 18, 24)");
      r.style.setProperty("--side-folder-text-color", "rgb(223, 223, 223)");
    } else {
      r.style.setProperty("--folder-color", "#214657");
      r.style.setProperty("--folder-hover-color", "#357592");
      r.style.setProperty("--folder-selected-color", "#7fa3b4");
      r.style.setProperty("--file-color", "#516c7a");
      r.style.setProperty("--file-hover-color", "#364750");
      r.style.setProperty("--file-section-color", "#cacaca");
      r.style.setProperty("--folder-section-color", "#6e6e6e");
      r.style.setProperty("--name-section-color", "rgb(34, 35, 37)");
      r.style.setProperty("--name-font-color", "rgb(224, 224, 224)");
      r.style.setProperty("--side-folder-color", "#2b2b2b");
      r.style.setProperty("--side-folder-text-color", "rgb(165, 165, 165)");
    }
  };
</script>

{#if isLogged}
  {#if profile}
    <Profile {userData} />
  {:else if shared}
    <Shared {userData} {profile} />
  {:else}
    <Home {userData} />
  {/if}
{:else}
  <NotLogged on:userLoggedIn={loggedIn} />
{/if}
