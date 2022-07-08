<script>
  import axios from "axios";
  import { getCookie } from "../cookie";

  const sendFile = (e) => {
    var data = new FormData();
    data.append("file", e.target.files[0]);
    data.append("user", getCookie("G_VAR2"));
    axios
      .request({
        method: "post",
        url: "http://192.168.0.24:5700/upload",
        data,
        onUploadProgress: (p) => {
          console.log(Math.ceil((p.loaded / p.total) * 100));
        },
      })
      .then((data) => {
        console.log(data);
      });
  };
</script>

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
