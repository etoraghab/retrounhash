<script>
  import { link, push } from "svelte-spa-router";
  import DOMPurify from "dompurify";
  import { reveal } from "svelte-reveal";
  import moment from "moment";
  export let data;
  export let bold;
  import { parse as parseEm } from "twemoji-parser";
  import { Play, PlayCircle, TrashAlt, X } from "@svicons/boxicons-regular";
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
          {#if data.img.split("data:")[1].split("/")[0] == "image"}
            <img
              src={data.thumb}
              class="w-full h-32 aspect-square rounded-md object-cover"
              alt=""
            />
          {:else}
            <div id="container" class="w-full h-32 object-cover">
              <div
                id="navi"
                class="flex z-10 justify-center rounded-md items-center bg-base-100 bg-opacity-25 backdrop-blur-sm"
              >
                <Play width="2.6em" />
              </div>
              <div id="infoi" class="flex z-0 justify-center items-center">
                <!-- svelte-ignore a11y-media-has-caption -->
                <video
                  class="rounded-md w-full object-cover h-32"
                  src={data.img}
                />
              </div>
            </div>
          {/if}
        </button>
      {/if}
    </div>
  </div>
  <div class="flex">
    {#if data.self}
      <div class="m-auto mr-1 text-red-600">
        <button
        class="btn btn-ghost btn-xs"
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
      transition: "slide",
      duration: 200,
    }}
    class="bg-base-100 z-20 flex justify-center items-center bg-opacity-50 backdrop-blur-md"
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
        {#if data.img.split("data:")[1].split("/")[0] == "image"}
          <img src={data.img} class="rounded-md md:max-w-96 max-h-96" alt="" />
        {:else}
          <!-- svelte-ignore a11y-media-has-caption -->
          <video
            src={data.img}
            class="rounded-md md:max-w-96 max-h-96"
            autoplay
            controls
          />
        {/if}
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
    z-index: 50;
    cursor: pointer;
  }

  #container {
    position: relative;
  }
  #navi,
  #infoi {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
