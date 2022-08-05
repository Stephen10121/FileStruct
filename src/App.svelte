<script>
  import { Router, Route } from "svelte-navigator";
  import CheckLog from "./components/CheckLog.svelte";
  import NotLogged from "./components/NotLogged.svelte";
  import Logout from "./components/Logout.svelte";

  const PROXY = "http://192.168.0.24:5700/";
  // const PROXY = "/";
</script>

<Router>
  <Route path="/profile" primary={false}>
    <CheckLog {PROXY} profile={true} shared={false} />
  </Route>

  <Route path="/shared" primary={false}>
    <CheckLog {PROXY} profile={false} shared={true} />
  </Route>

  <Route path="/" primary={false}>
    <CheckLog {PROXY} profile={false} shared={false} />
  </Route>

  <Route path="/logout" primary={false}>
    <Logout />
  </Route>
</Router>
