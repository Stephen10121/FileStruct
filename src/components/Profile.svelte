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
  const r = document.querySelector(":root");

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
          if (detail === "dark") {
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
            r.style.setProperty(
              "--side-folder-text-color",
              "rgb(223, 223, 223)"
            );
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
            r.style.setProperty(
              "--side-folder-text-color",
              "rgb(165, 165, 165)"
            );
          }
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
    background-color: var(--file-section-color);
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
