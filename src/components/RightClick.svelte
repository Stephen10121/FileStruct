<script>
  import Option from "./Option.svelte";
  const click = (e) => {
    console.log(e.detail);
  };
</script>

<section class="right-click">
  <Option
    icon="/icons/folder-plus.svg"
    alt="New folder icon"
    on:clicked={click}
    ident="newFolder"
  >
    New Folder
  </Option>
  <Option
    icon="/icons/share.svg"
    alt="Share icon"
    on:clicked={click}
    ident="share">Share</Option
  >
  <Option icon="/icons/move.svg" alt="Move icon" on:clicked={click} ident="move"
    >Move</Option
  >
  <Option
    ident="rename"
    icon="/icons/input-cursor-text.svg"
    alt="Rename icon"
    on:clicked={click}>Rename</Option
  >
  <Option
    ident="delete"
    icon="/icons/trash.svg"
    alt="Delete"
    nonSelectable={true}
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
