<script>
  import "./style.css";
  import Router, { location, link } from "svelte-spa-router";
  import Main from "./pages/main.svelte";
  import Home from "./pages/home.svelte";
  import Header from "./components/header.svelte";
  import Explore from "./pages/explore.svelte";
  import AccountRender from "./pages/accountRender.svelte";
  import SearchRenderer from "./pages/searchRenderer.svelte";
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
    "/u/:pub": AccountRender,
    "/search/:query": SearchRenderer,
    "/explore/:tag": Explore,
  }}
/>
