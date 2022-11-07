<script>
  import "./style.css";
  import Router, { location, link } from "svelte-spa-router";
  import Main from "./pages/main.svelte";
  import Home from "./pages/home.svelte";
  import Header from "./components/header.svelte";
  import Account from "./pages/account.svelte";
  import Explore from "./pages/explore.svelte";
  /**
   * theme management
   */

  document
    .querySelector("html")
    .setAttribute("data-theme", localStorage.getItem("theme"));
</script>

{#if $location !== "/"}
  <Header />
{/if}
<Router
  routes={{
    "/": Main,
    "/home": Home,
    "/u/:pub": Account,
    "/explore": Explore,
  }}
/>
