<script>
  import "./style.css";
  import Router, { location, link } from "svelte-spa-router";
  import Main from "./pages/main.svelte";
  import Home from "./pages/home.svelte";
  import Header from "./components/header.svelte";
  import Explore from "./pages/explore.svelte";
  import AccountRender from "./pages/accountRender.svelte";
  import SearchRenderer from "./pages/searchRenderer.svelte";
  import { user } from "./lib/gun";
  import { onMount } from "svelte";
  /**
   * theme management
   */
  let settings = user.get("settings");

  onMount(() => {
    settings.get("dark_mode").on((val) => {
      if (val) {
        document.querySelector("html").setAttribute("data-theme", "dark");
      } else {
        document.querySelector("html").setAttribute("data-theme", "light");
      }
    });
  });
</script>

<div>
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
</div>
