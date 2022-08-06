<script>
  import BoolPrompt from "./BoolPrompt.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  import { useNavigate } from "svelte-navigator";
  import { getCookie } from "../cookie";

  let boolPrompt = false;
  const navigate = useNavigate();
  const get_cookie = (name) => {
    return document.cookie.split(";").some((c) => {
      return c.trim().startsWith(name + "=");
    });
  };
  const delete_cookie = (name, path) => {
    if (get_cookie(name)) {
      document.cookie =
        name +
        "=" +
        (path ? ";path=" + path : "") +
        ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
  };

  const deleteAccount = ({ detail: { choose } }) => {
    boolPrompt = false;
    if (choose) {
      fetch(`/deleteAccount?cred=${getCookie("G_VAR2")}`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data["msg"] === "Good") {
            delete_cookie("G_VAR2", "/");
            navigate("/");
          } else {
            dispatch("error", true);
          }
        });
    }
  };
</script>

{#if boolPrompt}
  <BoolPrompt extra={boolPrompt.extra} on:boolChoose={boolPrompt.callback}
    >{boolPrompt.msg}</BoolPrompt
  >
{/if}
<div class="imgPart">
  <div class="text">
    <h1>Delete Account.</h1>
  </div>
  <div class="buttonGridBox">
    <button
      on:click={() => {
        boolPrompt = {
          msg: "Delete account? ",
          callback: deleteAccount,
        };
      }}>Delete</button
    >
  </div>
</div>

<style>
  .imgPart {
    width: 100%;
    height: 200px;
    border: 5px solid var(--file-hover-color);
    display: grid;
    grid-template-columns: 2fr 3fr;
    border-radius: 10px;
    padding: 10px;
  }

  .buttonGridBox {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .text {
    border-right: 2px solid var(--file-hover-color);
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 10px;
  }

  .text h1 {
    font-family: "Roboto", sans-serif;
    font-size: 3rem;
    color: var(--file-hover-color);
    /* white-space: nowrap; */
  }

  button {
    width: 100px;
    height: 50px;
    overflow: hidden;
    border: none;
    background-color: rgb(185, 0, 0);
    border-radius: 10px;
    cursor: pointer;
    font-family: "Roboto", sans-serif;
    font-size: 2rem;
  }

  button:hover {
    outline: 3px solid rgb(185, 0, 0);
  }
</style>
