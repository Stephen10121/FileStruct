<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let sharing;
</script>

<div class="imgPart">
  <div class="text">
    <h1>Allow Sharing</h1>
  </div>
  <div class="buttonGrid">
    <input
      type="checkbox"
      name="sharing"
      id="sharing"
      class="checkbox"
      checked={sharing ? true : false}
      on:change={(e) => {
        dispatch("set-sharing", e.target.checked);
      }}
    />
  </div>
</div>

<style>
  .imgPart {
    width: 100%;
    height: 200px;
    border: 5px solid var(--file-hover-color);
    display: grid;
    grid-template-columns: 3fr 2fr;
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
  :root {
    --checkbox-timing: 0.25s;
  }

  .checkbox::before {
    content: "";
    position: absolute;
    width: 60px;
    height: 30px;
    border-radius: 100vw;
    animation-fill-mode: forwards;
    animation: boxUnChecked2 var(--checkbox-timing) forwards;
    visibility: visible !important;
  }

  .checkbox {
    position: relative;
    width: 60px;
    height: 30px;
    cursor: pointer;
    border-radius: 100vw;
    visibility: hidden;
  }

  .checkbox:checked.checkbox::after {
    animation: boxChecked var(--checkbox-timing) forwards;
  }

  .checkbox:checked.checkbox::before {
    animation: boxChecked2 var(--checkbox-timing) forwards;
  }

  .checkbox::after {
    content: "";
    visibility: visible !important;
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
