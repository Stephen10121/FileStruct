<script>
  import Option from "./Option.svelte";
  export let selected;

  const click = (e) => {
    console.log(e.detail, selected);
  };

  const newFolder = (e) => {
    console.log(e.detail, selected, "New Folder");
  };
</script>

<section class="right-click">
  <Option
    icon="/icons/folder-plus.svg"
    alt="New folder icon"
    on:clicked={newFolder}
    ident="newFolder"
  >
    New Folder
  </Option>
  <Option
    icon="/icons/share.svg"
    alt="Share icon"
    on:clicked={click}
    nonSelectable={!selected ? true : false}
    ident="share">Share</Option
  >
  <Option
    icon="/icons/move.svg"
    nonSelectable={!selected ? true : false}
    alt="Move icon"
    on:clicked={click}
    ident="move">Move</Option
  >
  <Option
    ident="rename"
    icon="/icons/input-cursor-text.svg"
    alt="Rename icon"
    nonSelectable={!selected ? true : false}
    on:clicked={click}>Rename</Option
  >
  <Option
    ident="delete"
    icon="/icons/trash.svg"
    alt="Delete"
    nonSelectable={!selected ? true : false}
    on:clicked={click}
  >
    Delete
  </Option>
  <div class="break" />
  <Option
    ident="settings"
    icon="/icons/gear.svg"
    alt="Settings"
    nonSelectable={false}
    on:clicked={click}
  >
    Settings
  </Option>
</section>

<style>
  .right-click {
    width: 100%;
  }

  .break {
    margin-top: 5px;
    margin-bottom: 5px;
    width: 100%;
    height: 1px;
    background-color: rgb(161, 161, 161);
  }
</style>
