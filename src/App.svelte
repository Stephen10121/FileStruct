<script>
  import { Router, Route, Link } from "svelte-navigator";
  import CheckLog from "./CheckLog.svelte";
  import Home from "./Home.svelte";
  import NotLogged from "./NotLogged.svelte";
</script>

<Router>
  <Route path="/home" primary={false}>
    <NotLogged />
  </Route>

  <Route path="/" primary={false}>
    <CheckLog />
  </Route>
</Router>
