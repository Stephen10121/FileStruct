<script>
  import { Router, Route } from "svelte-navigator";
  import CheckLog from "./components/CheckLog.svelte";
  import NotLogged from "./components/NotLogged.svelte";
  import Logout from "./components/Logout.svelte";

  const PROXY = "http://192.168.0.24:5700/";
  //const PROXY = location.href;
</script>

<Router>
  <Route path="/home" primary={false}>
    <NotLogged {PROXY} />
  </Route>

  <Route path="/" primary={false}>
    <CheckLog {PROXY} />
  </Route>

  <Route path="/logout" primary={false}>
    <Logout />
  </Route>
</Router>
