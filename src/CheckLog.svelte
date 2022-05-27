<script>
  import { useNavigate } from "svelte-navigator";
  const navigate = useNavigate();
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }
  const cookie = getCookie("G_VAR");

  if (cookie === undefined || cookie === null) {
    navigate("/home");
  }
</script>

<p>wow</p>
