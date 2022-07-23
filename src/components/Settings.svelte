<script>
  import { createEventDispatcher } from "svelte";
  import { fileExtension } from "../../scripts/stores";
  const dispatch = createEventDispatcher();
  export let usedSize;
  let fileExtensionValue;
  const sendClose = () => {
    dispatch("close-settings", true);
  };

  const close = (e) => {
    if (e.target.id === "boxDetect") {
      sendClose();
    }
  };

  fileExtension.subscribe((value) => {
    fileExtensionValue = value;
  });

  const changeFileExt = () => {
    fileExtension.update((n) => !n);
    window.localStorage.setItem("fileExtension", String(fileExtensionValue));
  };
</script>

<div class="box" id="boxDetect" on:click={close}>
  <div class="contents">
    <button class="close-button" on:click={sendClose}>&#10006;</button>
    <div class="section">
      <label for="showExt">Show file extentions.</label>
      <input
        type="checkbox"
        id="showExt"
        class="checkbox"
        checked={fileExtensionValue}
        on:change={changeFileExt}
      />
    </div>
    <p class="size">
      <span>Size:</span>
      {usedSize}
    </p>
  </div>
</div>

<style>
  .box {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 120;
  }

  .contents {
    width: 40%;
    height: 60%;
    background-color: var(--side-folder-color);
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    padding: 30px 19px 10px 10px;
    font-size: 2rem;
    cursor: auto;
    position: relative;
  }

  .close-button {
    position: absolute;
    top: 4px;
    right: 6px;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--side-folder-text-color);
    font-size: 1.5rem;
    transition: color 0.25s linear;
  }

  .close-button:hover {
    color: gray;
  }

  .section {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--side-folder-text-color);
    padding-bottom: 10px;
  }

  .section label {
    font-size: 2rem;
    font-family: "Poppins", sans-serif;
    color: var(--side-folder-text-color);
  }

  .size {
    font-size: 2rem;
    font-family: "Poppins", sans-serif;
    padding-top: 10px;
    color: var(--side-folder-text-color);
  }

  .size span {
    font-weight: bold;
    font-family: "Roboto", sans-serif !important;
  }

  .checkbox::before {
    content: "";
    position: absolute;
    width: 60px;
    height: 30px;
    border-radius: 100vw;
    animation-fill-mode: forwards;
    animation: boxUnChecked2 var(--checkbox-timing) forwards;
  }

  .checkbox {
    position: relative;
    width: 60px;
    height: 30px;
    cursor: pointer;
    border-radius: 100vw;
  }

  .checkbox:checked.checkbox::after {
    animation: boxChecked var(--checkbox-timing) forwards;
  }

  .checkbox:checked.checkbox::before {
    animation: boxChecked2 var(--checkbox-timing) forwards;
  }

  .checkbox::after {
    content: "";
    position: absolute;
    width: 26px;
    height: 26px;
    border-radius: 100vw;
    background-color: white;
    animation-fill-mode: forwards;
    animation: boxUnChecked var(--checkbox-timing) forwards;
    top: 2px;
    left: 2px;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px,
      rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px,
      rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
  }

  @keyframes boxChecked {
    from {
      top: 2px;
    }
    to {
      left: 32px;
    }
  }

  @keyframes boxChecked2 {
    from {
      background-color: gray;
    }
    to {
      background-color: rgb(2, 245, 2);
    }
  }

  @keyframes boxUnChecked {
    from {
      top: 2px;
      left: 32px;
    }
    to {
      left: 2px;
    }
  }

  @keyframes boxUnChecked2 {
    from {
      background-color: rgb(2, 245, 2);
    }
    to {
      background-color: gray;
    }
  }
</style>
