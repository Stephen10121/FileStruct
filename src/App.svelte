<script>
  import { Router, Route } from "svelte-navigator";
  import CheckLog from "./components/CheckLog.svelte";
  import NotLogged from "./components/NotLogged.svelte";
  import Logout from "./components/Logout.svelte";
</script>

<Router>
  <Route path="/profile" primary={false}>
    <CheckLog profile={true} shared={false} />
  </Route>

  <Route path="/shared" primary={false}>
    <CheckLog profile={false} shared={true} />
  </Route>

  <Route path="/" primary={false}>
    <CheckLog profile={false} shared={false} />
  </Route>

  <Route path="/logout" primary={false}>
    <Logout />
  </Route>
</Router>
