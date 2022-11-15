<script>
  import { link, push } from "svelte-spa-router";
  import DOMPurify from "dompurify";
  import { reveal } from "svelte-reveal";
  import moment from "moment";
  export let data;
  export let bold;
  import { parse as parseEm } from "twemoji-parser";
  import { TrashAlt, X } from "@svicons/boxicons-regular";
  import { user } from "../lib/gun";

  function parseEmoji(str) {
    const entities = parseEm(str);
    let text = str;
    entities.forEach((e) => {
      text = text.replace(
        new RegExp(e.text, "g"),
        `<img src="${e.url}" draggable="false" class="h-3 mt-auto mb-auto selector" alt="" />`
      );
    });

    return text;
  }

  if (!bold) {
    bold = "the meaning of life is 69";
  }

  function parse(t) {
    return DOMPurify.sanitize(
      parseEmoji(
        t
          .replace(
            /#+([a-zA-Z0-9_]+)/gi,
            '<a class="text-blue-500" href="#/search/#$1">#$1</a>'
          )
          .replace(/\n/g, "<br>")
      )
    );
  }

  let overlay;
  let deleted = "";
</script>

<div
  use:reveal={{
    duration: 500,
    easing: "easeInBack",
    blur: 2,
    transition: "fade",
  }}
  style="display: {deleted};"
  class="bg-base-100 flex-col border border-blue-600 border-opacity-10 bg-opacity-6 p-2 w-full md:w-1/2 lg:w-1/3 rounded-xl flex gap-2"
>
  <div class="flex gap-2">
    <img
      on:keypress={() => {
        push(`/u/${data.pub}`);
      }}
      on:click={() => {
        push(`/u/${data.pub}`);
      }}
      src={data.avatar}
      class="rounded-full w-10 h-10 aspect-square object-cover cursor-pointer"
      alt=""
    />
    <div class="text-xs break-all w-full flex flex-col">
      <div class="flex w-full">
        <div class="text-md truncate">@{data.username}</div>
        <div class="m-auto mr-1" style="font-size: .7em;">
          {moment(new Date(data.date)).calendar()}
        </div>
      </div>
      <span class="flex gap-1 flex-wrap">
        {@html parse(data.content)}
      </span>
      {#if data.img}
        <div class="mt-0.5" />
        <button
          on:click={() => {
            overlay = true;
          }}
        >
          <img
            src={data.img}
            class="w-full h-32 aspect-square rounded-md object-cover"
            alt=""
          />
        </button>
      {/if}
    </div>
  </div>
  <div class="flex">
    {#if data.self}
      <div class="m-auto mr-1 text-red-600">
        <button
          on:click={async () => {
            await user
              .get("posts")
              .get(data.uid)
              .put(null)
              .then(() => {
                deleted = "none";
              });
          }}
        >
          <TrashAlt width="1.2em" />
        </button>
      </div>
    {/if}
  </div>
</div>
<!-- OVERLAY -->
{#if overlay}
  <div
    use:reveal={{
      transition: "fade",
      duration: 200,
    }}
    class="bg-base-100 flex justify-center items-center bg-opacity-50 backdrop-blur-md"
    id="overlay"
  >
    <div class="indicator m-3">
      <button
        on:click={() => {
          overlay = false;
        }}
        class="indicator-item badge badge-ghost p-1"
      >
        <X width="1em" />
      </button>
      <div class="grid bg-base-100 place-items-center rounded-md">
        <img src={data.img} class="rounded-md md:max-w-96 max-h-96" alt="" />
      </div>
    </div>
  </div>
{/if}

<style>
  #overlay {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    cursor: pointer;
  }
</style>
