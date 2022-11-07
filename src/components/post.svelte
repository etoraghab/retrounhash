<script>
  import { link, push } from "svelte-spa-router";
  export let data;
</script>

<div class="bg-white bg-opacity-6 p-2 w-full md:w-1/2 lg:w-1/3 rounded-xl flex gap-2">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <img
    on:click={() => {
      push(`/u/${data.pub}`);
    }}
    src={data.avatar}
    class="rounded-lg w-10 h-10 aspect-square object-cover"
    alt=""
  />
  <div class="text-xs break-all flex flex-col">
    <div class="flex gap-2">
      <div class="text-md truncate">@{data.username}</div>
      <div class="text-gray-700 text-xs">{data.date}</div>
    </div>
    {data.content}
  </div>
</div>
