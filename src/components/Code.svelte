<script>
  let textValue = "";
  let input;

  $: {
    console.log(input);
  }
</script>

<div class="cover">
  <input type="text" bind:value={textValue} bind:this={input} />
  <h1>{textValue}<div class="blinker" /></h1>
</div>

<style>
  .cover {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    background-color: #dfdfdf;
  }

  h1 {
    position: relative;
    display: flex;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
      sans-serif;
    color: rgb(14, 99, 14);
    font-weight: bold;
  }

  .blinker {
    width: 10px;
    height: 100px;
    background-color: black;
  }
</style>
