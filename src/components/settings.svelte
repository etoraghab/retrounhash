<script>
  import { user } from "../lib/gun";
  import { reveal } from "svelte-reveal";
  let toxic_filter, dark_mode;
  let settings = user.get("settings");

  settings.get("toxic_filter").on((val) => {
    toxic_filter = val;
  });

  settings.get("dark_mode").once((val) => {
    dark_mode = val;
    if (dark_mode) {
      document.querySelector("html").setAttribute("data-theme", "dark");
    } else {
      document.querySelector("html").setAttribute("data-theme", "light");
    }
  });
</script>

<div use:reveal>
  <div class="p-2">
    <div class="p-2">
      <div class="text-md capitalize">settings</div>
      <div class="flex flex-col gap-2">
        <div class="h-5 flex">
          <span class="m-auto ml-1"> censor profanity (slow) </span>
          <input
            type="checkbox"
            bind:checked={toxic_filter}
            class="toggle toggle-xs m-auto mr-1"
            on:change={() => {
              settings.get("toxic_filter").put(toxic_filter);
            }}
          />
        </div>
        <div class="h-5 flex">
          <span class="m-auto ml-1"> dark mode </span>
          <input
            type="checkbox"
            bind:checked={dark_mode}
            class="toggle toggle-xs m-auto mr-1"
            on:change={() => {
              settings.get("dark_mode").put(dark_mode);
            }}
          />
        </div>
      </div>
    </div>
  </div>
</div>
