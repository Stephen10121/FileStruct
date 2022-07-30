<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  import Option from "./Option.svelte";
  export let selected;
  export let shared;

  const newFolder = (e) => {
    dispatch("new-folder", { selected, det: e.detail });
    dispatch("close-right", true);
  };

  const renameFolder = () => {
    dispatch("rename-folder", selected);
    dispatch("close-right", true);
  };

  const deleteFolder = () => {
    dispatch("delete-folder", selected);
    dispatch("close-right", true);
  };

  const moveFolder = () => {
    dispatch("move-folder", selected);
    dispatch("close-right", true);
  };

  const shareFolder = () => {
    dispatch("share-folder", selected);
    dispatch("close-right", true);
  };

  const settings = () => {
    dispatch("settings", true);
    dispatch("close-right", true);
  };
</script>

{#if shared}
  <section class="right-click">
    <Option
      icon="/icons/folder-plus.svg"
      alt="New folder icon"
      nonSelectable={!selected ? true : false}
      on:clicked={() => {
        dispatch("addToDrive", true);
        dispatch("close-right", true);
      }}
      ident="newFolder"
    >
      Add to drive
    </Option>
    <Option
      ident="delete"
      icon="/icons/trash.svg"
      alt="Delete"
      nonSelectable={!selected ? true : false}
      on:clicked={deleteFolder}
    >
      Delete
    </Option>
  </section>
{:else}
  <section class="right-click">
    <Option
      icon="/icons/folder-plus.svg"
      alt="New folder icon"
      on:clicked={newFolder}
      nonSelectable={false}
      ident="newFolder"
    >
      New Folder
    </Option>
    <Option
      icon="/icons/share.svg"
      alt="Share icon"
      on:clicked={shareFolder}
      nonSelectable={!selected ? true : false}
      ident="share">Share</Option
    >
    <Option
      icon="/icons/move.svg"
      nonSelectable={!selected ? true : false}
      alt="Move icon"
      on:clicked={moveFolder}
      ident="move">Move</Option
    >
    <Option
      ident="rename"
      icon="/icons/input-cursor-text.svg"
      alt="Rename icon"
      nonSelectable={!selected ? true : false}
      on:clicked={renameFolder}>Rename</Option
    >
    <Option
      ident="delete"
      icon="/icons/trash.svg"
      alt="Delete"
      nonSelectable={!selected ? true : false}
      on:clicked={deleteFolder}
    >
      Delete
    </Option>
    <div class="break" />
    <Option
      ident="settings"
      icon="/icons/gear.svg"
      alt="Settings"
      nonSelectable={false}
      on:clicked={settings}
    >
      Settings
    </Option>
  </section>
{/if}

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
