<script>
  import moment from "moment";
  moment().format();
  import { push, link, location } from "svelte-spa-router";
  import { db, keys, user, username } from "../lib/gun";
  import Clipboard from "svelte-clipboard";

  import Home from "@svicons/boxicons-regular/home.svelte";
  import {
    Compass,
    Group,
    User,
    Pencil,
    Edit,
    ShareAlt,
    Search,
    Cog,
  } from "@svicons/boxicons-regular";
  import { reveal } from "svelte-reveal";
  import { v4 } from "uuid";
  import { SEA } from "gun";
  import Settings from "./settings.svelte";
  import { toast } from "./toast";

  if (!user.is) {
    push("/");
  }

  let border_header = 50,
    height_header = "0",
    writeMode = false;
  function writePost() {
    if (writeMode) {
      writeMode = false;
      border_header = 50;
      height_header = 0;
    } else {
      settingsOpen = false;
      border_header = 10;
      height_header = 24;
      writeMode = true;
    }
  }

  let postContent;
  async function postThoughts() {
    if (!postContent) {
      return;
    }
    let hashtags = postContent.match(/#[a-z0-9_]+/g) || [];
    user
      .get("posts")
      .get(v4())
      .put({
        date: String(moment().toString()),
        content: postContent,
        sign: await SEA.sign(postContent, $keys),
        pub: $keys.pub,
      })
      .once(async (data) => {
        hashtags.forEach(async (tag) => {
          let soul = Gun.node.soul(data);
          let hash = await SEA.work(soul, null, null, { name: "SHA-256" });
          await db.get(tag).get(hash).put(soul);
        });

        let array1 = Array(postContent.split(" "));
        for (let index = 0; index < array1[0].length; index++) {
          const element = array1[0][index];
          if (String(element).length < 2) {
            return;
          }
          let soul = Gun.node.soul(data);
          let hash = await SEA.work(soul, null, null, { name: "SHA-256" });
          await db
            .get("search")
            .get("query")
            .get(`#${element}`)
            .get(hash)
            .put(soul);
        }

        postContent = null;
      });

    writePost();
  }

  let pub = "";
  if (user.is) {
    pub = db.user()._.sea.pub;
  }

  let profileEditMode = false;
  function editProfile() {
    if (profileEditMode) {
      profileEditMode = false;
      border_header = 50;
      height_header = 0;
    } else {
      border_header = 10;
      height_header = 24;
      profileEditMode = true;
    }
  }

  let settingsOpen = false;
  function openSettings(action) {
    if (settingsOpen) {
      settingsOpen = false;
      border_header = 50;
      height_header = 0;
    } else {
      writeMode = false; //open settings after closing writeMode
      border_header = 10;
      height_header = 30;
      settingsOpen = true;
    }
  }

  let displayNameGraph = user.get("displayName");
  let userBioInputGraph = user.get("bio");

  let user_bio_input, user_display_input;
  async function saveUserInfo() {
    await displayNameGraph.put(user_display_input);
    await userBioInputGraph.put(user_bio_input);
    editProfile();
  }

  displayNameGraph.on((name) => {
    user_display_input = name;
  });

  userBioInputGraph.on((name) => {
    user_bio_input = name;
  });

  function closeEverything() {
    profileEditMode = false;
    border_header = 50;
    height_header = 0;

    writeMode = false;
    settingsOpen = false;
  }

  location.subscribe(() => {
    closeEverything();
  });

  let searchQuery;
  let searchElm;

  document.addEventListener("keydown", (e) => {
    if (e.key == "Escape") {
      closeEverything();
    } else if (e.ctrlKey == true && e.key == "/") {
      e.preventDefault();
      push("/search");
      searchQuery = null;
      setTimeout(() => {
        searchElm.focus();
      }, 1000);
    }
  });
</script>

<div class="flex justify-center items-center w-full">
  <div class="w-full md:w-1/2 lg:w-1/3 m-auto h-0 fixed gap-2 z-3">
    <div
      class={writeMode || profileEditMode || settingsOpen == true
        ? "bg-base-100 bg-opacity-90 backdrop-blur-sm"
        : ""}
      style="transition:all .5s;height: {height_header}rem;display: flex;flex-direction: column;margin: 0.75rem;border-radius: {border_header}px;"
    >
      <div
        class=" p-2 flex border border-blue-600 border-opacity-40 transition-all duration-400 backdrop-blur-sm rounded-full 
        {writeMode || profileEditMode || settingsOpen == false
          ? 'bg-base-100'
          : ''} bg-opacity-80"
      >
        {#if $location.includes("/search") || $location.includes("/explore")}
          <input
            type="text"
            id="search"
            bind:this={searchElm}
            class="w-full bg-transparent pl-3 text-sm rounded-full p-1"
            placeholder="search among hashtags, posts"
            bind:value={searchQuery}
          />
          <button
            on:click={() => {
              push(`/search/${searchQuery}`);
            }}
            class="m-auto mr-1 p-0.5 rounded-full bg-base-100 bg-opacity-10"
          >
            <Search width="1.2em" />
          </button>
        {:else}
          <div
            class="m-auto flex ml-1 p-1 rounded-full bg-base-100 bg-opacity-10"
          >
            <button class="m-auto" on:click={openSettings}>
              <Cog width="1.2em" />
            </button>
          </div>
          <button
            class="font-mono text-xl m-auto ml-3 mr-0 mb-auto cursor-pointer"
            on:click={() => {
              push("/");
            }}
          >
            verse
          </button>
        {/if}

        {#if $location == `/u/${$keys.pub}`}
          <div
            on:keypress={editProfile}
            on:click={editProfile}
            class="m-auto mr-1 p-1 rounded-full bg-base-100 bg-opacity-10"
          >
            <Edit width="1.2em" />
          </div>
        {:else if $location.includes("/u/")}
          <Clipboard
            text={window.location.href}
            let:copy
            on:copy={() => {
              toast("success", "copied");
            }}
          >
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              on:click={copy}
              class="m-auto mr-1 p-1 rounded-full bg-base-100 bg-opacity-10"
            >
              <ShareAlt width="1.2em" />
            </div>
          </Clipboard>
        {:else if $location !== "/explore" && !$location.includes("/search")}
          <div
            on:keypress={writePost}
            on:click={writePost}
            class="m-auto mr-1 p-1 rounded-full bg-base-100 bg-opacity-10"
          >
            <Pencil width="1.2em" />
          </div>
        {/if}
      </div>
      {#if writeMode}
        <div use:reveal>
          <div class="p-2">
            <div class="p-2">
              <textarea
                class="w-full border border-blue-600 border-opacity-30 focus:border-opacity-70 transition-all duration-500 bg-base-100 bg-opacity-80 rounded-lg p-2"
                placeholder="place your thoughts.."
                bind:value={postContent}
              />
              <button
                on:click={postThoughts}
                class="btn btn-xs btn-ghost border transition-all duration-300 border-blue-600 hover:bg-blue-600 hover:bg-opacity-40 hover:text-white hover:text-opacity-60 border-opacity-30 focus:border-opacity-60"
              >
                post
              </button>
            </div>
          </div>
        </div>
      {/if}

      {#if settingsOpen}
        <Settings />
      {/if}
      {#if profileEditMode}
        <div use:reveal>
          <div class="p-2">
            <div class="p-2">
              <div class="capitalize text-sm">display name</div>
              <div class="pb-2">
                <input
                  type="text"
                  placeholder="display name"
                  bind:value={user_display_input}
                  class="w-full border border-blue-600 border-opacity-30 focus:border-opacity-70 transition-all duration-500 bg-base-100 bg-opacity-80 rounded-lg p-2"
                />
              </div>
              <div class="capitalize text-sm">bio</div>
              <div>
                <textarea
                  class="w-full h-20 border border-blue-600 border-opacity-30 focus:border-opacity-70 transition-all duration-500 bg-base-100 bg-opacity-80 rounded-lg p-2"
                  placeholder="your bio goes here.."
                  bind:value={user_bio_input}
                />
              </div>
              <button
                on:click={saveUserInfo}
                class="btn btn-xs btn-ghost border transition-all duration-300 border-blue-600 hover:bg-blue-600 hover:bg-opacity-40 hover:text-white hover:text-opacity-60 border-opacity-30 focus:border-opacity-60"
              >
                save
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<div class="flex justify-center items-center w-full">
  <div class="w-full md:w-1/4 h-auto fixed bottom-0 gap-2 ">
    <div
      class="m-2 border border-blue-600 border-opacity-40 p-1 flex backdrop-blur-sm rounded-full bg-base-100 bg-opacity-80"
    >
      <div class="m-auto p-1 rounded-full bg-base-100 bg-opacity-10">
        <a use:link href="/home">
          <Home width="1.5em" />
        </a>
      </div>
      <div class="m-auto p-1 rounded-full bg-base-100 bg-opacity-10">
        <a use:link href="/explore">
          <Compass width="1.5em" />
        </a>
      </div>
      <div class="m-auto p-1 rounded-full bg-base-100 bg-opacity-10">
        <a use:link href="/friends">
          <Group width="1.5em" />
        </a>
      </div>
      <div class="m-auto p-1 rounded-full bg-base-100 bg-opacity-10">
        <a use:link href={`/u/${$keys.pub}`}>
          <User width="1.5em" />
        </a>
      </div>
    </div>
  </div>
</div>
<div class="h-14" />

<style>
  textarea,
  input {
    overflow: auto;
    outline: none;

    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    box-shadow: none;

    resize: none; /*remove the resize handle on the bottom right*/
  }
</style>
