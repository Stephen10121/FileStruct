<script>
  import ToastNotification from "./ToastNotification.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  import axios from "axios";
  import { getCookie } from "../cookie";
  export let selected;
  let notification = null;

  const sendFile = (e) => {
    var data = new FormData();
    data.append("file", e.target.files[0]);
    data.append(
      "user",
      JSON.stringify({ cred: getCookie("G_VAR2"), where: selected })
    );
    axios
      .request({
        method: "post",
        url: `/upload`,
        data,
        onUploadProgress: (p) => {
          notification = {};
          notification["status"] = " ";
          notification["msg"] = `${Math.ceil((p.loaded / p.total) * 100)}%`;
        },
      })
      .then((data) => {
        console.log(data);
        if (data.data.status) {
          dispatch("update-file-struct", true);
          notification["status"] = "success";
          notification["msg"] = `File Uploaded`;
        } else {
          notification["status"] = "alert";
          notification["msg"] = `Error uploading file.`;
        }
      });
  };
</script>

{#if notification !== null}
  <ToastNotification
    type={notification.status}
    on:close={() => {
      notification = null;
    }}>{notification.msg}</ToastNotification
  >
{/if}
<label for="file"><img src="/icons/cloud-upload-fill.svg" alt="Upload" /></label
>
<input type="file" name="file" id="file" on:change={sendFile} />

<style>
  #file {
    opacity: 0;
    position: absolute;
    z-index: -1;
  }

  label {
    width: 100%;
    cursor: pointer;
  }

  label img {
    width: 100%;
    transition: filter 0.25s linear;
  }

  label img:hover {
    filter: invert(0.5);
  }
</style>
