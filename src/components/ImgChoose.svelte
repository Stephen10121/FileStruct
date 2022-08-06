<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let profilePic;
</script>

<div class="imgPart">
  <div class="text">
    <h1>Choose Picture</h1>
  </div>
  <div class="buttonGridBox">
    <div class="buttonGrid">
      <button
        on:click={() => {
          dispatch("profileClick", "profilePics/profile1.jpg");
        }}
        class={profilePic === "profilePics/profile1.jpg" ? "checked" : ""}
      >
        <img src="profilePics/profile1.jpg" alt="Profile Pic" />
      </button>
      <button
        on:click={() => {
          dispatch("profileClick", "profilePics/profile2.jpg");
        }}
        class={profilePic === "profilePics/profile2.jpg" ? "checked" : ""}
      >
        <img src="profilePics/profile2.jpg" alt="Profile Pic" />
      </button>
      <button
        on:click={() => {
          dispatch("profileClick", "profilePics/profile3.jpg");
        }}
        class={profilePic === "profilePics/profile3.jpg" ? "checked" : ""}
      >
        <img src="profilePics/profile3.jpg" alt="Profile Pic" />
      </button>
      <button
        on:click={() => {
          dispatch("profileClick", "profilePics/profile4.jpg");
        }}
        class={profilePic === "profilePics/profile4.jpg" ? "checked" : ""}
      >
        <img src="profilePics/profile4.jpg" alt="Profile Pic" />
      </button>
      <button
        on:click={() => {
          dispatch("profileClick", "profilePics/profile5.jpg");
        }}
        class={profilePic === "profilePics/profile5.jpg" ? "checked" : ""}
      >
        <img src="profilePics/profile5.jpg" alt="Profile Pic" />
      </button>
    </div>
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

  .buttonGrid {
    width: fit-content;
    height: 100%;
    display: flex;
    gap: 10px;
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
    width: 70px;
    height: 70px;
    border-radius: 50%;
    overflow: hidden;
    border: none;
    background-color: gray;
    cursor: pointer;
  }

  button:hover {
    outline: 3px solid gray;
  }

  button.checked {
    outline: 3px solid gray;
  }

  button img {
    width: 100%;
    user-select: none;
    -webkit-user-drag: none;
  }

  @media only screen and (max-width: 800px) {
    .imgPart {
      grid-template-columns: 3fr 2fr;
    }
    .buttonGrid {
      width: 100%;
      height: fit-content;
      display: flex;
      overflow-y: auto;
      gap: 10px;
      padding-top: 80px;
      padding-bottom: 10px;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
  }
</style>
