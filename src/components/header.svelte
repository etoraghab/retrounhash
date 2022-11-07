<script>
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
  } from "@svicons/boxicons-regular";
  import { reveal } from "svelte-reveal";
  import { v4 } from "uuid";
  import { SEA } from "gun";

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
      border_header = 10;
      height_header = 24;
      writeMode = true;
    }
  }

  let postContent;
  async function postThoughts() {
    let hashtags = postContent.match(/#[a-z0-9_]+/g) || [];
    user
      .get("posts")
      .get(v4())
      .put({
        date: new Date().toUTCString(),
        content: postContent,
        sign: await SEA.sign(postContent, $keys),
        pub: $keys.pub,
      })
      .on(async (data) => {
        Array(hashtags).forEach(async (tag) => {
          let soul = Gun.node.soul(data);
          let hash = await SEA.work(soul, null, null, { name: "SHA-256" });
          db.get(tag).get(hash).put(soul);
        });
      });
    postContent = null;
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

  location.subscribe(() => {
    profileEditMode = false;
    border_header = 50;
    height_header = 0;

    writeMode = false;
    border_header = 50;
    height_header = 0;
  });
</script>

<div class="flex justify-center items-center w-full">
  <div class="w-full md:w-1/2 lg:w-1/3 m-auto h-0 fixed gap-2 z-3">
    <div
      class={writeMode || profileEditMode == true
        ? "bg-white bg-opacity-80 backdrop-blur-sm"
        : ""}
      style="transition:all .5s;height: {height_header}rem;display: flex;flex-direction: column;margin: 0.75rem;border-radius: {border_header}px;backdrop-blur: blur(4px);"
    >
      <div
        class=" p-2 flex transition-all duration-400 backdrop-blur-sm rounded-full 
        {writeMode || profileEditMode == false ? 'bg-white' : ''} bg-opacity-80"
      >
        {#if $location !== `/explore`}
          <button
            class="font-mono text-xl m-auto ml-3 mr-0 mb-auto cursor-pointer"
            on:click={() => {
              push("/");
            }}
          >
            verse
          </button>
          <div class="font-mono text-sm mt-auto mb-auto ml-3">
            <!-- svelte-ignore missing-declaration -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <Clipboard text={pub} let:copy on:copy={() => {}}>
              <div on:click={copy} class="cursor-pointer m-auto">
                <span class="m-auto">
                  @{$username || "loading"}
                </span>
              </div>
            </Clipboard>
          </div>
        {:else}
          <input
            type="text"
            class="w-full bg-transparent pl-3 text-sm rounded-full p-1"
            placeholder="search"
          />
          <button class="m-auto mr-1 p-0.5 rounded-full bg-white bg-opacity-10">
            <Search width="1.2em" />
          </button>
        {/if}

        {#if $location == "/home"}
          <div
            on:keypress={writePost}
            on:click={writePost}
            class="m-auto mr-1 p-1 rounded-full bg-white bg-opacity-10"
          >
            <Pencil width="1.2em" />
          </div>
        {/if}
        {#if $location == `/u/${user.is.pub}`}
          <div
            on:keypress={editProfile}
            on:click={editProfile}
            class="m-auto mr-1 p-1 rounded-full bg-white bg-opacity-10"
          >
            <Edit width="1.2em" />
          </div>
        {:else if $location.includes("/u/")}
          <Clipboard text={window.location.href} let:copy on:copy={() => {}}>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              on:click={copy}
              class="m-auto mr-1 p-1 rounded-full bg-white bg-opacity-10"
            >
              <ShareAlt width="1.2em" />
            </div>
          </Clipboard>
        {/if}
      </div>
      {#if writeMode}
        <div use:reveal>
          <div class="p-2">
            <div class="p-2">
              <textarea
                class="w-full border border-gray-300 bg-white bg-opacity-80 rounded-lg border-opacity-75 p-2"
                placeholder="place your thoughts.."
                bind:value={postContent}
              />
              <button
                on:click={postThoughts}
                class="btn btn-xs btn-ghost border border-gray-300"
              >
                post
              </button>
            </div>
          </div>
        </div>
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
                  class="w-full border border-gray-300 bg-white bg-opacity-80 rounded-lg border-opacity-75 p-2"
                />
              </div>
              <div class="capitalize text-sm">bio</div>
              <div>
                <textarea
                  class="w-full border border-gray-300 bg-white bg-opacity-80 rounded-lg border-opacity-75 p-2"
                  placeholder="your bio goes here.."
                  bind:value={user_bio_input}
                />
              </div>
              <button
                on:click={saveUserInfo}
                class="btn btn-xs btn-ghost border border-gray-300"
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
      class="m-2 p-1 flex backdrop-blur-sm rounded-full bg-white bg-opacity-80 border-2 border-white border-opacity-25"
    >
      <div class="m-auto p-1 rounded-full bg-white bg-opacity-10">
        <a use:link href="/home">
          <Home width="1.5em" />
        </a>
      </div>
      <div class="m-auto p-1 rounded-full bg-white bg-opacity-10">
        <a use:link href="/explore">
          <Compass width="1.5em" />
        </a>
      </div>
      <div class="m-auto p-1 rounded-full bg-white bg-opacity-10">
        <a use:link href="/friends">
          <Group width="1.5em" />
        </a>
      </div>
      <div class="m-auto p-1 rounded-full bg-white bg-opacity-10">
        <a use:link href={`/u/${$keys.pub}`}>
          <User width="1.5em" />
        </a>
      </div>
    </div>
  </div>
</div>
<div class="h-14" />
