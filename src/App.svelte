<script>
  import { Router, Route, Link } from "svelte-navigator";
  import CheckLog from "./CheckLog.svelte";
  import Home from "./Home.svelte";
  import NotLogged from "./NotLogged.svelte";

  const PROXY = "http://192.168.0.24:5500";
</script>

<Router>
  <Route path="/home" primary={false}>
    <NotLogged {PROXY} />
  </Route>

  <Route path="/" primary={false}>
    <CheckLog {PROXY} />
  </Route>
</Router>
