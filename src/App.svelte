<script>
  import BuildFolderStruct from "./components/BuildFolderStruct.svelte";
  let selected = "none";
  const newLoc = ({ detail }) => {
    selected = detail;
    detail = detail.split("/");
    let files = folderStruct[detail[0]];
    for (let i = 1; i < detail.length; i++) {
      files = files[detail[i]];
    }
    console.log(
      !files["G_files"] | (files["G_files"].length === 0)
        ? "No Files"
        : files.G_files
    );
  };

  let folderStruct = {
    G_files: ["cool.txt"],
    house: {
      G_files: ["home.txt"],
    },
    vids: {
      G_files: [],
      Date_2020: {
        G_files: ["pic1.png", "pic2.png"],
        coolPics5: {
          G_files: ["pic100.png"],
          Gerry: {
            G_files: ["cool.txt"],
            house: {
              G_files: ["home.txt"],
            },
            vids: {
              G_files: [],
              Date_2020: {
                G_files: ["pic1.png", "pic2.png"],
                coolPics5: {
                  G_files: ["pic100.png"],
                },
              },
              Date_2021: {
                G_files: ["pic5.png", "pic6.png"],
              },
            },
          },
        },
      },
      Date_2021: {
        G_files: ["pic5.png", "pic6.png"],
      },
    },
  };
  const addVal = () => {
    folderStruct.house["nancy"] = {
      G_files: [],
    };
  };
</script>

<main>
  <BuildFolderStruct
    folders={folderStruct}
    on:folderClicked={newLoc}
    {selected}
  />
  <button on:click={addVal}>Click</button>
</main>

<style>
</style>
