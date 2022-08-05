<script>
  import SideFolder from "./SideFolder.svelte";
  import ImgChoose from "./ImgChoose.svelte";
  import Sharing from "./Sharing.svelte";
  import Theme from "./Theme.svelte";
  import { getCookie } from "../cookie";

  export let userData;
  let profileSettings = JSON.parse(userData.usersProfile);
  console.log(profileSettings);

  const changeProfile = (newSettings) => {
    fetch(
      `/changeProfileSettings?cred=${getCookie(
        "G_VAR2"
      )}&settings=${JSON.stringify(newSettings)}`,
      { method: "POST" }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  };
</script>

<svelte:head>
  <title>Profile | GCloud</title>
</svelte:head>

<main>
  <SideFolder profile={true} {userData} shared={false} selected={null} />
  <div class="therest">
    <div class="imgPart">
      <div class="text">
        <h1>Notice</h1>
      </div>
      <div class="buttonGrid">
        <p
          >The profile page is not functional. This is all just asthetic stuff
          to get everything working. The backend has not been hooked up yet.</p
        >
      </div>
    </div>
    <ImgChoose
      profilePic={profileSettings.profile}
      on:profileClick={({ detail }) => {
        let settings2 = profileSettings;
        settings2.profile = detail;
        profileSettings = settings2;
        changeProfile(profileSettings);
      }}
    />
    <div class="double">
      <Sharing
        sharing={profileSettings.sharing}
        on:set-sharing={({ detail }) => {
          let settings2 = profileSettings;
          settings2.sharing = detail;
          profileSettings = settings2;
          changeProfile(profileSettings);
        }}
      />
      <Theme
        theme={profileSettings.theme}
        on:set-theme={({ detail }) => {
          let settings2 = profileSettings;
          settings2.theme = detail;
          profileSettings = settings2;
          changeProfile(profileSettings);
        }}
      />
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

  .imgPart {
    width: 100%;
    height: 200px;
    border: 5px solid var(--file-hover-color);
    display: grid;
    grid-template-columns: 2fr 3fr;
    border-radius: 10px;
    padding: 10px;
  }

  .buttonGrid {
    width: 100%;
    height: 100%;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
    padding: 10px;
  }

  .buttonGrid p {
    font-family: "Roboto", sans-serif;
    font-size: 2rem;
    color: var(--file-hover-color);
  }

  .text {
    border-right: 2px solid var(--file-hover-color);
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .text h1 {
    font-family: "Roboto", sans-serif;
    font-size: 3rem;
    color: var(--file-hover-color);
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
