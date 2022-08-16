<script>
  import { createEventDispatcher } from "svelte";
  import useSocket from "../useSocket";

  const dispatch = createEventDispatcher();

  const socket = useSocket();

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

  const wind = window.location.href.split("//");
  const loginIt = () => {
    socket.on("auth", (data) => {
      socket.off("auth");
      document.cookie = `G_VAR2=${data.token}`;
      dispatch("userLoggedIn", data.userData);
    });
    popupCenter({
      postServer: `${wind[0] + "//" + wind[1].split("/")[0]}/auth`,
      key: socket.id,
      title: "Authenticate",
      w: 520,
      h: 570,
    });
  };

  let main;
  let disrupt = true;
  let headerSmall = "";

  const scrollMain = (event) => {
    if (event.target.scrollTop > 50 && disrupt) {
      headerSmall = "headerSmall";
    }
  };

  const home = () => {
    disrupt = false;
    main.scrollTop = 0;
    headerSmall = "";
    setTimeout(() => {
      disrupt = true;
    }, 500);
  };
</script>

<main on:scroll={scrollMain} bind:this={main}>
  <header class={headerSmall}>
    <h1>GCloud</h1>
    <div class="right-buttons">
      <div class="pageLocations">
        <button on:click={home}>Home</button>
        <a href="#preview">Preview</a>
        <a href="#sharing">Sharing</a>
      </div>
      <button id="sauth-login" on:click={loginIt}>
        Login with Gruzservices
        <span>
          <img src="https://auth.gruzservices.com/icons/lock.svg" alt="Lock" />
        </span>
      </button>
    </div>
  </header>
  <section class="about">
    <div class="someText">
      <div class="textbox">
        <h1>A Storage bucket</h1>
        <p>This is where you can share and store files in the Cloud.</p>
      </div>
    </div>
    <div class="imgContain">
      <div class="box">
        <img src="storage.jpg" alt="" />
      </div>
    </div>
  </section>
  <section class="about preview" id="preview">
    <div class="imgContain">
      <div class="box">
        <!-- svelte-ignore a11y-media-has-caption -->
        <video
          src={`${
            wind[0] + "//" + wind[1].split("/")[0]
          }/getExampleVideoStream`}
          controls
        />
        <!-- <img src="previewvid.png" alt="Preview video picture"> -->
      </div>
    </div>
    <div class="someText">
      <div class="textbox">
        <h1>File Preview.</h1>
        <p>Access content without downloading it. This video is streaming.</p>
      </div>
    </div>
  </section>
  <section class="about sharing" id="sharing">
    <div class="imgContain">
      <div class="box">
        <img src="sharing.jpg" alt="" />
      </div>
    </div>
    <div class="someText">
      <div class="textbox">
        <h1>Sharing</h1>
        <p
          >Easily let other people view your files. File sharing is disabled by
          default.</p
        >
      </div>
    </div>
  </section>
</main>

<style>
  @font-face {
    font-family: "George-Italic";
    src: url(https://auth.gruzservices.com/fonts/Louis-George-Cafe-Italic.ttf);
  }

  header {
    width: 100vw;
    height: 100vh;
    background-color: #f3f3f3;
    border-bottom: 1px solid gray;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    flex-direction: column;
    padding: 10px;
    transition: height 0.25s linear, background-color 0.25s linear;
    overflow-x: hidden;
    position: relative;
  }

  .headerSmall {
    height: 70px;
    width: 100vw;
    justify-content: space-between;
    flex-direction: row;
    position: fixed;
    overflow: hidden;
    background-color: rgba(243, 243, 243, 0.5);
    top: 0;
    left: 0;
  }

  .headerSmall .pageLocations a,
  .headerSmall .pageLocations button {
    display: block;
  }

  .headerSmall h1 {
    font-size: 4rem;
  }

  .headerSmall .right-buttons {
    flex-direction: row;
    gap: 20px;
  }

  header h1 {
    font-family: "Poppins", sans-serif;
    font-weight: 900;
    font-size: 6rem;
    background: hsla(212, 33%, 16%, 1);
    background-image: linear-gradient(
      90deg,
      hsla(212, 33%, 16%, 1) 0%,
      hsla(199, 100%, 22%, 1) 94%
    );
    background-size: 100%;
    -webkit-background-clip: text;
    -moz-background-clip: text;
    -webkit-text-fill-color: transparent;
    -moz-text-fill-color: transparent;
  }

  .right-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 30px;
  }

  .pageLocations {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .pageLocations a,
  .pageLocations button {
    border: none;
    display: none;
    background: none;
    font-size: 1.5rem;
    color: black;
    padding: 3px;
    font-family: "Poppins", sans-serif;
    border-bottom: 1px solid gray;
    cursor: pointer;
  }

  .pageLocations button:hover,
  .pageLocations button:focus,
  .pageLocations a:hover,
  .pageLocations a:focus {
    border-bottom: 2px solid black;
    outline: none;
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

  main {
    width: 100vw;
    height: 100vh;
    overflow-x: hidden;
    background-image: url(background.svg);
    background-size: cover;
    overflow-y: scroll;
    scroll-behavior: smooth;
  }

  section {
    height: 100vh;
    width: 100vw;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .preview {
    background-image: linear-gradient(
      90deg,
      hsla(212, 33%, 16%, 1) 0%,
      hsla(199, 100%, 22%, 1) 94%
    );
    background-size: cover;
  }

  .preview .textbox {
    background-color: hsla(212, 33%, 16%, 1);
    color: rgb(216, 216, 216);
  }

  .about .someText,
  .about .imgContain {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .box {
    width: 70%;
    max-width: fit-content;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }

  .box video {
    width: 100%;
  }

  .box img {
    height: 100%;
  }

  .textbox {
    width: 60%;
    height: 50%;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 20px;
    padding: 30px;
    background-color: #d8d8d8;
  }

  .textbox h1 {
    font-family: "Roboto", sans-serif;
    font-size: 5rem;
  }

  .textbox p {
    font-family: "Roboto", sans-serif;
    font-size: 2rem;
  }

  @media screen and (max-width: 1000px) {
    section {
      height: 100vh;
      width: 100vw;
      display: grid;
      grid-template-rows: 1fr 1fr;
      grid-template-columns: 1fr;
    }
  }

  @media screen and (max-width: 700px) {
    .headerSmall .pageLocations a,
    .headerSmall .pageLocations button {
      display: none;
    }

    .textbox {
      width: 100%;
      height: 100%;
      padding: 10px;
    }

    .box {
      width: 100%;
      max-width: 100%;
    }

    .box img {
      width: 100%;
    }
  }

  @media screen and (max-width: 500px) {
    .headerSmall {
      height: 140px;
      flex-direction: column;
    }
  }
</style>
