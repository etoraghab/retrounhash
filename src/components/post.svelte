<script>
  import { link, push } from "svelte-spa-router";
  import DOMPurify from "dompurify";
  import { reveal } from "svelte-reveal";
  export let data;
  export let bold;

  if (!bold) {
    bold = "asdasdorywcpqw8tayhilus";
  }

  function parse(t) {
    return DOMPurify.sanitize(
      t
        .replace(
          /#+([a-zA-Z0-9_]+)/gi,
          '<a class="text-blue-600" href="#/search/#$1">#$1</a>'
        )
        .replace(new RegExp(bold, "gi"), "<b>" + bold + "</b>")
    );
  }
</script>

<div
  use:reveal={{
    duration: 500,
    transition: 'blur',
    blur: 5
  }}
  class="bg-white bg-opacity-6 p-2 w-full md:w-1/2 lg:w-1/3 rounded-xl flex gap-2"
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <img
    on:click={() => {
      push(`/u/${data.pub}`);
    }}
    src={data.avatar}
    class="rounded-lg w-10 h-10 aspect-square object-cover cursor-pointer"
    alt=""
  />
  <div class="text-xs break-all flex flex-col">
    <div class="flex gap-2">
      <div class="text-md truncate">@{data.username}</div>
      <div class="text-gray-700 text-xs">
        {new Date(data.date).toLocaleTimeString()}
      </div>
    </div>
    <span class="block">
      {@html parse(data.content)}
    </span>
  </div>
</div>
