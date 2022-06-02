<script>
  import { useNavigate } from "svelte-navigator";
  import NotLogged from "./NotLogged.svelte";
  import Home from "./Home.svelte";

  let isLogged = false;
  let userData;
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  const cookie = getCookie("G_VAR");

  if (cookie === undefined || cookie === null) {
    // navigate("/");
    isLogged = false;
  } else {
    fetch(`http://localhost:5500/userData?cred=${getCookie("G_VAR")}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status !== 200) {
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
  <Home {userData} />
{:else}
  <NotLogged on:userLoggedIn={loggedIn} />
{/if}
