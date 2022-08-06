<script>
  import SideFolder from "./SideFolder.svelte";
  import ImgChoose from "./ImgChoose.svelte";
  import Sharing from "./Sharing.svelte";
  import Theme from "./Theme.svelte";
  import ToastNotification from "./ToastNotification.svelte";
  import { getCookie } from "../cookie";

  export let userData;
  let profileSettings = JSON.parse(userData.usersProfile);
  let notification = false;

  const changeProfile = (newSettings) => {
    fetch(
      `/changeProfileSettings?cred=${getCookie(
        "G_VAR2"
      )}&settings=${JSON.stringify(newSettings)}`,
      { method: "POST" }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data["msg"] === "Good") {
          notification = {
            status: "success",
            msg: "Saved the settings!",
          };
        } else {
          notification = {
            status: "alert",
            msg: "Error saving profile settings!",
          };
        }
      });
  };
</script>

<svelte:head>
  <title>Profile | GCloud</title>
</svelte:head>

{#if notification}
  <ToastNotification
    type={notification.status}
    on:close={() => {
      notification = false;
    }}>{notification.msg}</ToastNotification
  >
{/if}
<main>
  <SideFolder profile={true} {userData} shared={false} selected={null} />
  <div class="therest">
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
  @media only screen and (max-width: 850px) {
    main {
      grid-template-columns: 100vw;
    }
  }
  @media only screen and (max-width: 800px) {
    .double {
      display: flex;
      flex-direction: column;
    }
  }

  /* @media only screen and (max-width: 600px) {
      main {
        grid-template-columns: 1fr;
      }
    } */
</style>
