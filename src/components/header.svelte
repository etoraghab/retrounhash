<script>
  import moment from "moment";
  moment().format();
  import { push, link, location } from "svelte-spa-router";
  import { db, keys, user } from "../lib/gun";
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
    Camera,
    PhoneCall,
    VideoRecording,
  } from "@svicons/boxicons-regular";
  import { reveal } from "svelte-reveal";
  import { v4 } from "uuid";
  import { SEA } from "gun";
  import Settings from "./settings.svelte";
  import { toast } from "./toast";
  import { peer } from "../lib/peer";

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
        img: postImage || "",
        sign: await SEA.sign(postContent, $keys),
        pub: $keys.pub,
      })
      .once(async (data) => {
        // hashtags.forEach(async (tag) => {
        //   let soul = Gun.node.soul(data);
        //   let hash = await SEA.work(soul, null, null, { name: "SHA-256" });
        //   await db.get(tag).get(hash).put(soul);
        // });

        postContent = postContent.replace(/(\,|\.)/g, "");
        let array1 = postContent.split(" ");
        array1.forEach(async (element) => {
          if (element.length > 2) {
            let soul = Gun.node.soul(data);
            let hash = await SEA.work(soul, null, null, { name: "SHA-256" });
            await db
              .get("search")
              .get("query")
              .get(`#${String(element).toLowerCase()}`)
              .get(hash)
              .put(soul);
          }
        });

        postContent = undefined;
        postImage = undefined;
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
      settingsOpen = false;
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
      profileEditMode = false;
      writeMode = false; //open settings after closing writeMode
      border_header = 10;
      height_header = 30;
      settingsOpen = true;
    }
  }

  let displayNameGraph = user.get("displayName");
  let userBioInputGraph = user.get("bio");
  let userProfileImageGraph = user.get("displayImage");

  let user_bio_input, user_display_input, user_display_image;
  async function saveUserInfo() {
    await displayNameGraph.put(user_display_input);
    await userBioInputGraph.put(user_bio_input);
    await userProfileImageGraph.put(imgProfile);
    editProfile();
  }

  let imgProfile;
  userProfileImageGraph.on((img) => {
    imgProfile = img;
  });

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

  let postImage;

  var filePostUploadedType;
  function imageUploaded() {
    var file = document.querySelector("#avatar-chooser").files[0];

    if (String(file.type).includes("video")) {
      filePostUploadedType = "video";
    } else {
      filePostUploadedType = "photo";
    }

    var reader = new FileReader();
    reader.onload = async function () {
      postImage = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function imageUploadedProfile() {
    var file = document.querySelector("#profilePicChoser").files[0];

    var reader = new FileReader();
    reader.onload = async function () {
      imgProfile = reader.result;
    };
    reader.readAsDataURL(file);
  }

  let callingUserData = {};
  let calling;
  let callAnswered;
  let call__;
  let selfvideo;
  let othervideo;
  peer.on("call", async (e) => {
    let userIsFollowed;
    user
      .get("following")
      .get(e.metadata.pub)
      .once((isNot) => {
        userIsFollowed = isNot;
      });
    if (userIsFollowed) {
      let callerData = e.metadata;
      var secret = await SEA.secret(callerData.epub, $keys);
      let publicKey = await SEA.decrypt(callerData.sign, secret);
      if (publicKey == callerData.pub) {
        calling = true;
        let graph = db.user(publicKey);
        graph.get("alias").once((name) => {
          callingUserData["name"] = name;
        });
        graph.get("displayImage").once((img) => {
          callingUserData["img"] =
            img ||
            `https://avatars.dicebear.com/api/initials/${callingUserData.name}.svg`;
        });
        call__ = e;
        e.on("stream", (s) => {
          setTimeout(() => {
            othervideo.srcObject = s;
          }, 2000);
        });
      }
    }
  });

  document.addEventListener("call", (e) => {
    let pub = e.detail.pub;
    let userID;
    db.user(pub)
      .get("call")
      .get("id")
      .once((id) => {
        userID = id;
      });
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: 256,
          height: 144,
        },
        audio: true,
      })
      .then(async (stream) => {
        setTimeout(() => {
          selfvideo.srcObject = stream;
        }, 2000);
        await db
          .user(pub)
          .get("epub")
          .once(async (epub) => {
            let secret = await SEA.secret(epub, $keys);
            let item = await SEA.encrypt($keys.pub, secret);
            let call = peer.call(userID, stream, {
              metadata: {
                pub: $keys.pub,
                sign: item,
                epub: $keys.epub,
              },
            });

            call.on("stream", (s) => {
              callingUserData.name = e.detail.name;
              callingUserData.img = e.detail.img;
              callAnswered = true;
              calling = true;
              setTimeout(() => {
                othervideo.srcObject = s;
              }, 2000);
            });
          });
      });
  });
</script>

<div class="flex justify-center items-center w-full header__">
  <div class="w-full md:w-1/2 lg:w-1/3 m-auto h-0 fixed gap-2 header__">
    <div
      class={writeMode || profileEditMode || settingsOpen == true
        ? "bg-base-100 header__ bg-opacity-90 backdrop-blur-sm"
        : ""}
      style="transition:all .5s;height: {height_header}rem;display: flex;flex-direction: column;margin: 0.75rem;border-radius: {border_header}px;"
    >
      <div
        class=" p-2 flex header__ border border-blue-600 border-opacity-40 transition-all duration-400 backdrop-blur-sm rounded-full 
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
            <button
              class="m-auto"
              on:click={openSettings}
              aria-label="Settings"
            >
              <Cog width="1.2em" />
            </button>
          </div>
          <button
            class="font-mono text-xl m-auto ml-3 mr-0 mb-auto cursor-pointer"
            on:click={() => {
              push("/");
            }}
          >
            retrounhash
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
            <button
              on:click={copy}
              class="m-auto mr-1 p-1 rounded-full bg-base-100 bg-opacity-10"
            >
              <ShareAlt width="1.2em" />
            </button>
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
                class="w-full border border-blue-600 border-opacity-30 focus:border-opacity-70 transition-all duration-500 bg-base-100 bg-opacity-0 rounded-lg p-2"
                placeholder="place your thoughts.."
                bind:value={postContent}
              />
              <div>
                {#if postImage !== undefined}
                  <button
                    on:click={() => {
                      postImage = undefined;
                    }}
                  >
                    <label for="avatar-chooser">
                      {#if filePostUploadedType == "photo"}
                        <img
                          class="rounded-md object-cover h-14 w-14"
                          src={postImage}
                          alt=""
                        />
                        <!-- svelte-ignore a11y-media-has-caption -->
                      {:else}
                        <video
                          class="rounded-md object-cover h-14 w-14"
                          loop
                          src={postImage}
                          autoplay
                          muted
                        />
                      {/if}
                    </label>
                  </button>
                {:else}
                  <button
                    class="p-3 mt-1 btn-ghost h-14 w-auto flex justify-center items-center rounded-md border transition-all duration-300 border-blue-600 hover:bg-blue-600 hover:bg-opacity-90 hover:text-white hover:text-opacity-90 border-opacity-30 focus:border-opacity-90"
                  >
                    <label for="avatar-chooser" class="flex gap-3">
                      <VideoRecording width="1.5em" />
                      <span class="font-extralight text-xl"> / </span>
                      <Camera width="1.5em" />
                    </label>
                  </button>
                {/if}

                <input
                  type="file"
                  name="avatar-chooser"
                  id="avatar-chooser"
                  on:change={imageUploaded}
                  accept=".png, .jpg, .jpeg, .mp4, .webm, .mpg, .ogg, .mov, .avi, .gif, .raw"
                  class="hidden"
                />
              </div>
              <button
                on:click={postThoughts}
                class="btn mt-1 btn-xs btn-ghost border transition-all duration-300 border-blue-600 hover:bg-blue-600 hover:bg-opacity-90 hover:text-white hover:text-opacity-90 border-opacity-30 focus:border-opacity-90"
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
              <div class="flex justify-center items-center">
                {#if imgProfile !== undefined && imgProfile !== null}
                  <button
                    on:click={async () => {
                      imgProfile = undefined;
                      await userProfileImageGraph.put(null);
                    }}
                  >
                    <label for="profilePicChoser">
                      <img
                        class="rounded-md object-cover h-14 w-14"
                        src={imgProfile}
                        alt=""
                      />
                    </label>
                  </button>
                {:else}
                  <button
                    class="p-3 mt-1 btn-ghost h-14 w-14 flex justify-center items-center rounded-md border transition-all duration-300 border-blue-600 hover:bg-blue-600 hover:bg-opacity-90 hover:text-white hover:text-opacity-90 border-opacity-30 focus:border-opacity-90"
                  >
                    <label for="profilePicChoser">
                      <Camera width="1.5em" />
                    </label>
                  </button>
                {/if}
                <input
                  type="file"
                  name="profilePicChoser"
                  id="profilePicChoser"
                  on:change={imageUploadedProfile}
                  accept="image/*"
                  class="hidden"
                />
              </div>
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
                class="btn mt-1 btn-xs btn-ghost border transition-all duration-300 border-blue-600 hover:bg-blue-600 hover:bg-opacity-90 hover:text-white hover:text-opacity-90 border-opacity-30 focus:border-opacity-90"
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
  {#if calling}
    <div
      class="w-4/5 md:w-1/2 lg:w-2/5 h-auto fixed bottom-0 gap-2"
      style="z-index: 51;"
    >
      <div
        class="m-2 border border-blue-700 border-opacity-40 p-1 flex flex-col backdrop-blur-sm bg-base-100 bg-opacity-80 {callAnswered
          ? 'rounded-md'
          : 'rounded-full'}"
      >
        <!-- svelte-ignore a11y-media-has-caption -->
        {#if callAnswered}
          <div class="flex flex-col justify-center items-center mb-2">
            <video
              class="max-h-96 rounded-md"
              bind:this={othervideo}
              autoplay
            />
            <video
              style="right: 10px;bottom: 3.7rem;"
              class="h-14 fixed object-cover rounded-md"
              bind:this={selfvideo}
              autoplay
              muted
            />
          </div>
        {/if}
        <div
          class="m-auto justify-center items-center w-full p-1 flex gap-2 rounded-full bg-base-100 bg-opacity-10"
        >
          <img
            src={callingUserData.img}
            class="w-10 h-10 rounded-full object-cover"
            alt=""
          />
          {callingUserData.name}
          <div class="m-auto mr-1 flex gap-1">
            {#if !callAnswered}
              <button
                class="btn btn-xs btn-success"
                on:click={() => {
                  navigator.mediaDevices
                    .getUserMedia({
                      video: {
                        width: 256,
                        height: 144,
                      },
                      audio: true,
                    })
                    .then(async (stream) => {
                      callAnswered = true;
                      setTimeout(() => {
                        selfvideo.srcObject = stream;
                      }, 2000);
                      call__.answer(stream);
                    });
                }}
              >
                <PhoneCall width="1.2em" />
              </button>
            {/if}
            <div class="m-auto mr-1">
              <button
                class="btn btn-xs btn-error"
                on:click={() => {
                  calling = false;
                  call__.close();

                  callingUserData = {};
                  calling = false;
                  callAnswered = false;
                  call__ = null;
                  selfvideo = null;
                  othervideo = null;
                }}
              >
                end
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="w-2/3 md:w-1/4 lg:w-1/5 h-auto fixed bottom-0 gap-2 ">
      <div
        class="m-2 border border-blue-700 border-opacity-40 p-1 flex backdrop-blur-sm rounded-full bg-base-100 bg-opacity-80"
      >
        <div class="m-auto p-1 rounded-full bg-base-100 bg-opacity-10">
          <a use:link href="/home" aria-label="Home">
            <Home width="1.4em" />
          </a>
        </div>
        <div class="m-auto p-1 rounded-full bg-base-100 bg-opacity-10">
          <a use:link href="/explore" aria-label="Explore">
            <Compass width="1.4em" />
          </a>
        </div>
        <div class="m-auto p-1 rounded-full bg-base-100 bg-opacity-10">
          <a use:link href="/friends" aria-label="Friends">
            <Group width="1.4em" />
          </a>
        </div>
        <div class="m-auto p-1 rounded-full bg-base-100 bg-opacity-10">
          <a use:link href={`/u/${$keys.pub}`} aria-label="Account">
            <User width="1.4em" />
          </a>
        </div>
      </div>
    </div>
  {/if}
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

  .bottom-0,
  .header__ {
    z-index: 51;
  }
</style>
