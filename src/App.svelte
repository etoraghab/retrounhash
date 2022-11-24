<script>
  import "./style.css";
  import Router, { location, link } from "svelte-spa-router";
  import { wrap } from "svelte-spa-router/wrap";
  import Header from "./components/header.svelte";
  import { db as database, db, keys, user } from "./lib/gun";
  import { onMount } from "svelte";
  import Toast from "./components/toast.svelte";

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

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").then(
      function (registration) {},
      function (err) {
        console.error(err);
      }
    );
  }
</script>

<Toast />
<div>
  {#if $location !== "/"}
    <Header />
  {/if}
  <Router
    routes={{
      "/": wrap({
        asyncComponent: () => import("./pages/main.svelte"),
      }),
      "/home": wrap({
        asyncComponent: () => import("./pages/home.svelte"),
      }),
      "/u/:pub": wrap({
        asyncComponent: () => import("./pages/accountRender.svelte"),
      }),
      "/search/:query": wrap({
        asyncComponent: () => import("./pages/searchRenderer.svelte"),
      }),
      "/explore/:tag": wrap({
        asyncComponent: () => import("./pages/explore.svelte"),
      }),
      "/friends": wrap({
        asyncComponent: () => import("./pages/people.svelte"),
      }),
      "/following/:pub": wrap({
        asyncComponent: () => import("./pages/following.svelte"),
      }),
      "/followers/:pub": wrap({
        asyncComponent: () => import("./pages/followers.svelte"),
      }),
    }}
  />
</div>
