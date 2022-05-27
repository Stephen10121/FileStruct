<script>
  import { Router, Route, Link } from "svelte-navigator";
  import CheckLog from "./CheckLog.svelte";
  import Home from "./Home.svelte";
  import NotLogged from "./NotLogged.svelte";
</script>

<Router>
  <Route path="home">
    <NotLogged />
  </Route>

  <Route path="/">
    <CheckLog />
  </Route>
</Router>
