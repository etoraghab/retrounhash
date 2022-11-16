<script>
  import DOMPurify, { sanitize } from "dompurify";
  import Post from "../components/post.svelte";
  import { db, keys, user, username as username_ } from "../lib/gun";
  import { location, push } from "svelte-spa-router";
  import Peer from "peerjs";
  import { peer } from "../lib/peer";
  import { DotsVerticalRounded } from "@svicons/boxicons-regular";
  import { SEA } from "gun";
  require("@tensorflow/tfjs");
  const toxicity = require("@tensorflow-models/toxicity");

  export let params;
  const pub = params.pub;

  const user_graph = db.user(pub);
  let username;
  user_graph.get("alias").once((name) => {
    username = name;
  });

  let user_img;
  user_graph.get("displayImage").on((img) => {
    user_img = img;
  });

  let user_bio;
  user_graph.get("bio").on((bio) => {
    user_bio = bio.replace(/\n/g, "<br>") || "404 no bio";
  });

  let user_displayName;
  user_graph.get("displayName").on((displayName) => {
    user_displayName = displayName || username;
  });

  let posts = [];
  let toxicity_state;
  user
    .get("settings")
    .get("toxic_filter")
    .once((val) => {
      toxicity_state = val;
    });
  user_graph.get("displayImage").once(async (useAvatar) => {
    user_graph.get("alias").once(async (name) => {
      user_graph
        .get("posts")
        .map()
        .once(async (post, key) => {
          if (toxicity_state) {
            toxicity.load(0.9).then((model) => {
              const sentences = [post.content];
              model.classify(sentences).then((predictions) => {
                if (predictions[6].results[0].match !== true) {
                  if (typeof post !== undefined && post) {
                    let self;
                    if ($username_ === name) {
                      self = true;
                    } else {
                      self = false;
                    }
                    posts = [
                      {
                        avatar:
                          useAvatar ||
                          `https://avatars.dicebear.com/api/initials/${name}.svg`,
                        content: post.content,
                        date: new Date(post.date).toDateString(),
                        username: name,
                        pub: pub,
                        img: post.img,
                        uid: key,
                        self: self,
                      },
                      ...posts,
                    ];
                  }
                }
              });
            });
          } else {
            if (typeof post !== undefined && post) {
              let self;
              if ($username_ === name) {
                self = true;
              } else {
                self = false;
              }
              posts = [
                {
                  avatar:
                    useAvatar ||
                    `https://avatars.dicebear.com/api/initials/${name}.svg`,
                  content: post.content,
                  date: Gun.state.is(post, "content"),
                  username: name,
                  img: post.img,
                  pub: pub,
                  uid: key,
                  self: self,
                },
                ...posts,
              ];
            }
          }
        });
    });
  });

  let isFollowed;
  let following_graph = db.user(pub).get("following").get(pub);
  user
    .get("following")
    .get(pub)
    .on((val) => {
      isFollowed = val;
    });

  function sortEm() {
    posts.sort(
      (d1, d2) => new Date(d2.date).getTime() - new Date(d1.date).getTime()
    );
  }

  $: posts, sortEm();

  let following = 0;
  following_graph
    .back()
    .map()
    .once((val, pub_f) => {
      if (val == true && pub_f !== pub) {
        following += 1;
      }
    });

  let followers = 0;
  let followers_graph = db.user(pub).get("followers");
  followers_graph.on(() => {
    followers = 0;
    followers_graph.map().once((val) => {
      if (val === true) {
        followers += 1;
      }
    });
  });

  let certificate;
  db.user(pub)
    .get("followersCert")
    .once((cert) => {
      certificate = cert;
    });

  let userID;
  db.user(pub)
    .get("call")
    .get("id")
    .on((id) => {
      userID = id;
    });

  function call() {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: 480,
          height: 360,
        },
        audio: true,
      })
      .then(async (stream) => {
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

            call.on("stream", (stream) => {
              console.log(stream);
            });
          });
      });
  }
</script>

<div class="flex justify-center items-center">
  <div class="break-all w-full md:w-1/2 lg:w-1/3">
    <div class="m-2 p-2 flex items-center">
      <img
        class="h-16 w-16 aspect-square object-cover rounded-full"
        src={user_img ||
          `https://avatars.dicebear.com/api/initials/${username}.svg`}
        alt=""
      />
      <div class="flex w-full flex-col justify-center items-center">
        <div class="flex flex-col">
          <span class="text-md">
            {user_displayName || username}
          </span>
          <span class="text-xs">
            @{username}
          </span>
        </div>
      </div>
      <div class="dropdown dropdown-left">
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label tabindex="0" class="btn btn-xs btn-ghost m-1">
          <DotsVerticalRounded width="1.5em" />
        </label>
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <ul
          tabindex="0"
          class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <!-- svelte-ignore a11y-missing-attribute -->
          <li>
            <button on:click={call}> call </button>
          </li>
        </ul>
      </div>
    </div>
    <div class="flex flex-col justify-center items-center">
      {#if $location !== `/u/${$keys.pub}`}
        {#if !isFollowed}
          <button
            on:click={async () => {
              await user.get("following").get(pub).put(true);
              await db
                .user(pub)
                .get("followers")
                .get($keys.pub)
                .put(true, null, {
                  opt: {
                    cert: certificate,
                  },
                });
            }}
            class="btn btn-wide btn-xs bg-blue-600 hover:bg-blue-500 text-white border"
          >
            follow
          </button>
        {:else}
          <button
            on:click={async () => {
              await user.get("following").get(pub).put(false);
              await db
                .user(pub)
                .get("followers")
                .get($keys.pub)
                .put(false, null, {
                  opt: {
                    cert: certificate,
                  },
                });
            }}
            class="btn btn-wide btn-xs btn-ghost"
          >
            unfollow
          </button>
        {/if}
      {/if}
    </div>
    <div class="text-xs m-2 p-2">
      {@html DOMPurify.sanitize(user_bio) || "404 bio not found"}
    </div>
    <div class="flex justify-center items-center flex-col">
      <div class="divider m-auto w-full md:w-1/2 lg:w-1/3" />
      <div class="flex gap-2">
        <button
          on:click={() => {
            push(`/following/${pub}`);
          }}
        >
          {following} following
        </button>
        <button
          on:click={() => {
            push(`/followers/${pub}`);
          }}
        >
          {followers} followers
        </button>
      </div>
      <div class="divider m-auto w-full md:w-1/2 lg:w-1/3" />
    </div>
    <div class="text-xl ml-2 md:ml-3">
      {posts.length}
      {#if posts.length !== 1}
        posts
      {:else}
        post
      {/if}
    </div>
  </div>
</div>
<div class="p-3">
  <div class="flex justify-center items-center flex-col gap-3">
    {#each posts as p}
      <Post data={p} />
    {/each}
    {#if posts.length == 0}
      {username} has not yet posted anything
    {/if}
  </div>
</div>
<div class="flex justify-center items-center">
  <div class="divider w-full md:w-1/2 lg:w-1/3" />
</div>
<br />
<br />
<br />
