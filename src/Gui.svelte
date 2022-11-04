<script>
  import { db, user } from "./lib/gun";
  import { v1 as uuid } from "uuid";
  import { Router, Route, Link, navigate } from "svelte-navigator";
  import { toast, alert } from "./lib/alert";
  import copy from "copy-to-clipboard";

  /**
   * importing components
   */
  import Back from "./components/back.svelte";

  /**
   * importing icons
   */
  import SendIcon from "@svicons/boxicons-regular/send.svelte";
  import CopyIcon from "@svicons/boxicons-regular/copy-alt.svelte";
  import FollowIcon from "@svicons/boxicons-regular/user-plus.svelte";
  import FollowingIcon from "@svicons/boxicons-regular/user.svelte";
  import LogoutIcon from "@svicons/boxicons-regular/log-out.svelte";
  import UnfollowedUsers from "@svicons/boxicons-regular/user-x.svelte";
  import Settings from "@svicons/boxicons-regular/cog.svelte";
  import Swal from "sweetalert2";

  //inittialisation of vars
  let post;
  let posts = [];
  let username;
  let following = [];
  let unfollowed = [];
  let themeSelect;
  let availableThemes = [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
  ];

  //the following listener as well as operator
  const user_followings_graph = user.get("following");

  user
    .get("following")
    .map()
    .once(async function (pub) {
      var the__user = pub;
      await db
        .user(pub)
        .get("alias")
        .once(async (name) => {
          await db
            .user(pub)
            .get("posts")
            .map()
            .on(async (text, uuid) => {
              if (text !== null) {
                posts = [
                  {
                    text: text,
                    uuid: uuid,
                    pub: the__user,
                    name: name,
                  },
                  ...posts,
                ];
              }
            });
        });
    });

  //the following calc function
  async function getFollowing() {
    following = [];
    await user
      .get("following")
      .map()
      .once(async (isBlocked, pub) => {
        if (isBlocked !== "blocked") {
          if (pub !== user._.sea.pub) {
            await db
              .user(pub)
              .get("alias")
              .once((name) => {
                following = [
                  {
                    name: name,
                    pub: pub,
                  },
                  ...following,
                ];
              });
          }
        }
      });
  }

  // the unfollowing calc function
  async function getUnfollowed() {
    unfollowed = [];
    await user
      .get("following")
      .map()
      .once(async (isBlocked, pub) => {
        if (isBlocked == "blocked") {
          if (pub !== user._.sea.pub) {
            await db
              .user(pub)
              .get("alias")
              .once((name) => {
                unfollowed = [
                  {
                    name: name,
                    pub: pub,
                  },
                  ...unfollowed,
                ];
              });
          }
        }
      });
  }

  //following change event listeners
  user.get("following").on(async () => {
    getFollowing();
    getUnfollowed();
  });

  // user alias init
  user.get("alias").once((name) => {
    username = name;
  });
</script>

<div class="w-full flex fixed gap-2 backdrop-blur-sm bg-white bg-opacity-10">
  <button
    class="font-mono text-2xl mt-auto ml-3 mb-auto cursor-pointer"
    on:click={() => {
      navigate("/");
    }}
  >
    verse
  </button>
  <div class="font-mono mt-auto mb-auto ml-3">@{username}</div>
  <button
    on:click={() => {
      navigate("/settings");
    }}
    class="ml-auto m-3 p-1 cursor-pointer"
  >
    <Settings width="2em" />
  </button>
</div>
<Router>
  <Route path="/">
    <!--


  MAIN PAGE


  -->
    <br />
    <br />
    <br />
    <div class="flex flex-col items-center gap-4 min-h-screen">
      <div class="m-2 flex flex-wrap gap-2">
        <button
          on:click={() => {
            toast.fire({
              title: "copied public key",
              timer: 2500,
              icon: "success",
              showCloseButton: true,
            });
            copy(user._.sea.pub);
          }}
          class="btn btn-sm btn-ghost border-zinc-600"
        >
          <CopyIcon width="1.3em" />
        </button>
        <button
          on:click={() => {
            let pub = prompt("enter their pub key:");
            db.user(pub)
              .get("alias")
              .once((name) => {
                if (confirm("follow " + name + "?")) {
                  user_followings_graph.get(pub).put(pub);
                  toast.fire({
                    title: "followed",
                    timer: 2500,
                    icon: "success",
                    showCloseButton: true,
                  });
                } else {
                  toast.fire({
                    title: "cancelled",
                    timer: 2500,
                    icon: "warning",
                    showCloseButton: true,
                  });
                }
              });
          }}
          class="btn btn-sm flex gap-2 btn-ghost border-zinc-600"
        >
          follow someone
          <FollowIcon width="1.5em" />
        </button>
        <Link to="/following">
          <button class="btn btn-sm flex gap-2 btn-ghost border-zinc-600">
            following
            <FollowingIcon width="1.4em" />
          </button>
        </Link>
        <button
          on:click={() => {
            user.leave();
            location.reload();
          }}
          class="btn btn-sm btn-ghost flex gap-2 border-zinc-600"
        >
          log out
          <LogoutIcon width="1.4em" />
        </button>
      </div>
      <div class="flex justify-center rounded-lg shadow-lg p-1 w-fit">
        <div class="m-4">
          <div class="text-2xl w-1/2 font-mono">write</div>
          <div class="flex justify-center items-center ">
            <div class="m-auto">
              <textarea
                bind:value={post}
                class="textarea textarea-ghost border-blue-300 p-2 m-3 w-max"
              />
              <button
                on:click={() => {
                  if (post == ("" || undefined || null)) {
                    toast.fire({
                      title: "no content",
                      timer: 2500,
                      icon: "warning",
                      showCloseButton: true,
                    });
                  } else {
                    user
                      .get("posts")
                      .get(uuid())
                      .put(post, function ({ err }) {
                        toast.fire({
                          title: "published",
                          timer: 2500,
                          icon: "success",
                          showCloseButton: true,
                        });
                      });
                  }
                  post = null;
                }}
                class="btn btn-sm btn-ghost block"
              >
                <SendIcon width="1.5em" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div
          class="flex max-w-md justify-center rounded-lg shadow-lg p-1 w-fit"
        >
          <div class="md:m-4">
            <div class="text-2xl w-1/2 font-mono ml-3">posts</div>
            {#each posts as p}
              <div
                class="rounded-lg break-all shadow-md m-1 md:w-96 sm:w-full p-4"
              >
                <span class="text-xl flex gap-2">
                  <span>{p.name}</span>
                  {#if p.pub !== user.is.pub}
                    <button
                      class="btn btn-xs btn-error rounded-full mt-auto mb-auto"
                      on:click={() => {
                        if (confirm("unfollow " + p.name + " ?")) {
                          user_followings_graph.get(p.pub).put("blocked");
                        }
                      }}
                    >
                      <UnfollowedUsers width="1.3em" />
                    </button>
                  {:else}
                    <button
                      on:click={() => {
                        toast.fire({
                          title: "self",
                          timer: 2500,
                          icon: "info",
                          showCloseButton: true,
                        });
                      }}
                      class="btn btn-xs btn-info rounded-full mt-auto mb-auto"
                    >
                      u
                    </button>
                  {/if}
                </span>
                <br />
                <div class="text-sm font-mono">{p.text}</div>
              </div>
            {/each}
            {#if posts.length == 0}
              <div class="m-2">
                empty, follow
                <span class="font-mono">people</span>
                or write them yoself
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </Route>
  <Route path="/settings">
    <div class="w-full h-screen flex justify-center items-center">
      <div class=" lg:w-1/2 md:2/3 m-3">
        <div class="text-2xl font-mono">settings</div>
        <div class="mt-4 text-lg">themes:</div>
        <select
          class="select select-ghost"
          bind:value={themeSelect}
          on:change={(event) => {
            localStorage.setItem("theme", themeSelect);
            document
              .querySelector("html")
              .setAttribute(
                "data-theme",
                localStorage.getItem("theme") || "light"
              );
          }}
        >
          {#each availableThemes as theme}
            <option value={theme}>{theme}</option>
          {/each}
        </select>

        <!--
          account actions
        -->

        <div class="p-2 mt-4 card-bordered card border-rose-300">
          <div class="text-lg">danger zone:</div>
          <div class="flex justify-center items-center flex-wrap">
            <div class="m-2">
              <button
                class="btn btn-warning btn-sm"
                on:click={() => {
                  Swal.fire({
                    icon: "warning",
                    title: "delete all posts ?",
                    text: "the action is irreversible!",
                    confirmButtonText: "delete",
                    showCancelButton: true,
                    preConfirm: async (e) => {
                      if (e == true) {
                        user
                          .get("posts")
                          .map()
                          .once(async (txt, uid) => {
                            await user.get("posts").get(uid).put(null);
                          })
                          .then(() => {
                            alert(
                              "done!",
                              "all your posts were deleted and are no longer available!",
                              "thanks"
                            );
                          });
                      }
                    },
                  });
                }}
              >
                delete all posts
              </button>
            </div>
            <div class="m-2">
              <button
                class="btn btn-error btn-sm"
                on:click={() => {
                  Swal.fire({
                    icon: "warning",
                    title: "really?",
                    text: "your account will no longer be accessible anymore, this is the last warning!",
                    confirmButtonText: "finish it",
                    showCancelButton: true,
                    preConfirm: async (e) => {
                      if (e == true) {
                        user
                          .get("posts")
                          .map()
                          .once(async (_txt, uid) => {
                            await user.get("posts").get(uid).put(null);
                          })
                          .then(async () => {
                            await user.auth(user._.sea, null, {
                              change: uuid(),
                            });
                            await user.auth(user._.sea, async () => {
                              await user.auth(user._.sea, async () => {
                                await user.delete();
                                await user.leave();
                                location.href = "/";
                              });
                            });
                          });
                      }
                    },
                  });
                }}
              >
                delete my account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Route>
  <Route path="/following/*">
    <!--


  FOLLOWING PAGE


  -->
    <Route path="/unfollowed">
      <!--


        UNFOLLOWED PEOPLE


      -->
      <div
        class="flex {getUnfollowed()} flex-col gap-4 justify-center items-center
        min-h-screen"
      >
        <div class="font-mono text-3xl flex">
          <Back />
          @{username}
        </div>
        {#if unfollowed.length == 0}
          <div class="text-xl m-2 p-3 font-extralight">
            you haven't unfollowed anyone recently
          </div>
        {:else}
          <div class="text-2xl">unfollowed:</div>
        {/if}
        {#each unfollowed as p}
          <div
            class="rounded-lg shadow-md border-fuchsia-500 p-2 text-xl flex gap-3"
          >
            <div>{p.name}</div>
            <button
              on:click={() => {
                toast.fire({
                  title: "copied public key",
                  timer: 2500,
                  icon: "success",
                  showCloseButton: true,
                });
                copy(p.pub);
              }}
              class="m-auto cursor-pointer text-sm"
            >
              <CopyIcon width="1.3em" />
            </button>
            <button
              on:click={() => {
                user_followings_graph.get(p.pub).put(p.pub);
              }}
              class="cursor-pointer m-auto text-sm"
            >
              <FollowIcon width="1.4em" />
            </button>
          </div>
        {/each}
      </div>
    </Route>
    <Route path="/">
      <div
        class="flex {getFollowing()} flex-col gap-4 justify-center items-center
        min-h-screen"
      >
        <div class="font-mono text-3xl flex">
          <Back />
          @{username}
        </div>
        <Link to="/following/unfollowed">
          <button class="btn flex gap-2 btn-sm btn-ghost border-zinc-600">
            <UnfollowedUsers width="1.4em" />
            unfollowed users
          </button>
        </Link>
        {#if following.length == 0}
          <div class="text-xl font-extralight">
            you're not following anyone rn
          </div>
        {:else}
          <div class="text-2xl">follows:</div>
        {/if}
        {#each following as p}
          <div
            class="rounded-lg shadow-md border-fuchsia-500 p-2 text-xl flex gap-3"
          >
            <div>{p.name}</div>
            <button
              on:click={() => {
                toast.fire({
                  title: "copied public key",
                  timer: 2500,
                  icon: "success",
                  showCloseButton: true,
                });
                copy(p.pub);
              }}
              class="m-auto cursor-pointer text-sm"
            >
              <CopyIcon width="1.3em" />
            </button>
            <button
              on:click={() => {
                user_followings_graph.get(p.pub).put("blocked");
              }}
              class="cursor-pointer m-auto text-sm"
            >
              <UnfollowedUsers width="1.4em" />
            </button>
          </div>
        {/each}
      </div>
    </Route>
  </Route>
</Router>
