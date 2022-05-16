<script>
  import BuildFolderStruct from "./components/BuildFolderStruct.svelte";
  import { folderStruct } from "./directory";
  let selected = "none";
  let folderStruct2 = folderStruct;
  let currentFolderPath = "";

  const newLoc = ({ detail }) => {
    selected = detail;
    detail = detail.split("/");
    let files = folderStruct2[detail[0]];
    for (let i = 1; i < detail.length; i++) {
      files = files[detail[i]];
    }
    if (!files["G_files"]) {
      currentFolderPath = false;
      return;
    }
    currentFolderPath = !files["G_files"].length === 0 ? false : files.G_files;
  };

  const addVal = () => {
    folderStruct2.house["nancy"] = {
      G_files: [],
    };
    console.log("button");
  };

  const deleteSomething = () => {
    folderStruct2.vids.Date_2020 = {};
    console.log(folderStruct2);
  };
</script>

<main>
  <div class="sideFolder"> lol </div>
  <section class="folder-part">
    <p>Name</p>
    <BuildFolderStruct
      folders={folderStruct2}
      on:folderClicked={newLoc}
      {selected}
    />
  </section>
  <div class="restOfthepart">
    <button on:click={addVal}>Click</button>
    <button on:click={deleteSomething}>Delete A Tree</button>
  </div>
</main>

<style>
  main {
    display: grid;
    grid-template-columns: 80px 300px auto;
    width: 100vw;
    height: 100vh;
  }

  .folder-part {
    height: 100%;
    display: grid;
    grid-template-rows: 70px auto;
  }
</style>
