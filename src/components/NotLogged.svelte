<script>
  import { useNavigate } from "svelte-navigator";
  import { createEventDispatcher } from "svelte";
  import useSocket from "../useSocket";
  export let PROXY;

  const dispatch = createEventDispatcher();
  const navigate = useNavigate();

  const socket = useSocket(PROXY);

  const popupCenter = ({ postServer, key, title, w, h }) => {
    // Fixes dual-screen position                             Most browsers      Firefox
    const dualScreenLeft =
      window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualScreenTop =
      window.screenTop !== undefined ? window.screenTop : window.screenY;
    const url = `https://auth.gruzservices.com/auth?website=${postServer}&key=${key}`;
    const width = window.innerWidth
      ? window.innerWidth
      : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : 100;
    const height = window.innerHeight
      ? window.innerHeight
      : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : 100;

    const systemZoom = width / window.screen.availWidth;
    const left = (width - w) / 2 / systemZoom + dualScreenLeft;
    const top = (height - h) / 2 / systemZoom + dualScreenTop;
    const newWindow = window.open(
      url,
      title,
      `
    scrollbars=yes,
    width=${w / systemZoom}, 
    height=${h / systemZoom}, 
    top=${top}, 
    left=${left}
    `
    );

    if (window.focus) {
      newWindow.focus();
    }
  };

  const loginIt = () => {
    socket.on("auth", (data) => {
      socket.off("auth");
      document.cookie = `G_VAR=${data.token}`;
      dispatch("userLoggedIn", data.userData);
    });
    popupCenter({
      postServer: `${PROXY}auth`,
      key: socket.id,
      title: "Authenticate",
      w: 520,
      h: 570,
    });
  };
</script>

<main>
  <button id="sauth-login" on:click={() => loginIt()}>
    Login with Gruzservices
    <span>
      <img src="https://auth.gruzservices.com/icons/lock.svg" alt="Lock" />
    </span>
  </button>
</main>

<style>
  @font-face {
    font-family: "George-Italic";
    src: url(https://auth.gruzservices.com/fonts/Louis-George-Cafe-Italic.ttf);
  }

  main {
    width: 100vw;
    height: 100vh;
  }

  #sauth-login {
    width: 220px;
    font-family: "George-Italic", sans-serif;
    border-radius: 100vw;
    border: none;
    background-color: white;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    height: 50px;
    cursor: pointer;
    transition: box-shadow 0.25s linear;
    display: flex;
    align-items: center;
    font-size: 1.5rem;
    justify-content: center;
  }

  #sauth-login span {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #sauth-login:hover {
    box-shadow: rgba(0, 0, 0, 0.24) 0px 8px 8px;
  }
</style>
