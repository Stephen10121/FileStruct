<script>
  const get_cookie = (name) => {
    return document.cookie.split(";").some((c) => {
      return c.trim().startsWith(name + "=");
    });
  };
  const delete_cookie = (name, path) => {
    if (get_cookie(name)) {
      document.cookie =
        name +
        "=" +
        (path ? ";path=" + path : "") +
        ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
  };
  delete_cookie("G_VAR", "/");
  import { useNavigate } from "svelte-navigator";
  const navigate = useNavigate();
  navigate("/");
</script>
