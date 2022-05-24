<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let file;
  let filterWords = "";
  let friends = {
    1: {
      fName: "Larry",
      lName: "Bobbins",
      uName: "lbobbins123",
    },
    2: {
      fName: "Jeff",
      lName: "Robinson",
      uName: "robinj2",
    },
    3: {
      fName: "Howard",
      lName: "Ward",
      uName: "hward101",
    },
    4: {
      fName: "Gary",
      lName: "Anderson",
      uName: "attackhelicopter",
    },
    5: {
      fName: "Susan",
      lName: "Wojisk",
      uName: "tubeyou",
    },
    6: {
      fName: "Larry",
      lName: "Bobbins",
      uName: "lbobbins123",
    },
    7: {
      fName: "Jeff",
      lName: "Robinson",
      uName: "robinj2",
    },
    8: {
      fName: "Howard",
      lName: "Ward",
      uName: "hward101",
    },
    9: {
      fName: "Gary",
      lName: "Anderson",
      uName: "attackhelicopter",
    },
    10: {
      fName: "Susan",
      lName: "Wojisk",
      uName: "tubeyou",
    },
    11: {
      fName: "Jeff",
      lName: "Jeffins",
      uName: "efwiojio",
    },
  };

  const filterSearch = (e) => {
    filterWords = e.target.value;
    var filter, ul, li, a, i, txtValue;
    filter = filterWords.toUpperCase();
    ul = document.getElementById("friend-grid");
    li = ul.getElementsByTagName("button");
    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName("p")[0];
      let a2 = li[i].getElementsByTagName("p")[1];
      let txtValue2 = a2.textContent || a2.innerText;
      txtValue = a.textContent || a.innerText;
      if (
        txtValue.toUpperCase().indexOf(filter) > -1 ||
        txtValue2.toUpperCase().indexOf(filter) > -1
      ) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  };
</script>

<div class="sharePeople">
  <div class="info">
    Share <span class="bold">{file}</span> to
  </div>
  <div class="top-row">
    <input
      type="text"
      placeholder="Search Friends"
      on:keyup={(e) => {
        filterSearch(e);
      }}
    />
    <button class="close-button" on:click={() => dispatch("hideShare", true)}
      >&#10006;</button
    >
  </div>
  <div class="friend-grid" id="friend-grid">
    {#each Object.keys(friends) as friend (friend)}
      <button
        class="friend"
        on:click={() => {
          dispatch("hideShare", true);
          dispatch("shareTo", friends[friend].uName);
        }}
      >
        <p>{friends[friend].fName} {friends[friend].lName}</p>
        <p class="bold">@{friends[friend].uName}</p>
      </button>
    {/each}
  </div>
</div>

<style>
  .sharePeople {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(223, 223, 223, 0.6);
    width: fit-content;
    min-width: 32%;
    height: fit-content;
    border-radius: 10px;
    padding: 5px 10px;
    display: grid;
    grid-template-rows: 40px auto;
  }

  .top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px;
    width: 100%;
  }

  .top-row input {
    width: 60%;
    height: 30px;
    border-radius: 10px;
    border: 1px solid black;
    padding: 0 7px;
  }

  .top-row input:focus {
    outline: 1px solid black;
  }

  .close-button {
    border: none;
    background: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: black;
    transition: color 0.25s linear;
  }

  .close-button:hover {
    color: gray;
  }

  .friend-grid {
    width: 100%;
    overflow-y: auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    background: none;
    max-height: 425px;
  }

  .friend {
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
    gap: 2px;
    height: 35px;
    padding: 2px 5px;
    background-color: #dfdfdf;
    border: none;
    border-radius: 2px;
  }

  .friend:hover {
    background-color: #cfcfcf;
  }

  .friend p {
    font-family: "Roboto", sans-serif;
    font-size: 1.3rem;
    color: black;
  }

  .bold {
    font-weight: bold;
  }

  .info {
    position: absolute;
    top: -60px;
    font-size: 1.5rem;
    font-family: "Poppins", sans-serif;
    left: 50%;
    background-color: white;
    padding: 10px;
    transform: translateX(-50%);
    border-radius: 100vw;
    width: fit-content;
  }
</style>
