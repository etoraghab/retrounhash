<script>
  import Post from "../components/post.svelte";
  import { db, keys, user, username as username_ } from "../lib/gun";
  import { location, push } from "svelte-spa-router";
  import { DotsVerticalRounded } from "@svicons/boxicons-regular";
  import Highlight from "../components/highlight.svelte";
  import { getUserData } from "../lib/utils";
  require("@tensorflow/tfjs");
  const toxicity = require("@tensorflow-models/toxicity");
  import { parse } from "../lib/utils";

  export let params;
  const pub = params.pub;

  const user_graph = db.user(pub);
  let username;

  let user_img, user_bio, user_displayName;
  async function refresuserdata() {
    await getUserData(pub).then((data) => {
      username = data.name;
      user_img = data.img;
      user_bio = data.bio;
      user_displayName = data.displayName;
    });
  }
  refresuserdata();

  document.addEventListener("userdataupdated", refresuserdata);

  let posts = [];
  let toxicity_state;
  user
    .get("settings")
    .get("toxic_filter")
    .once((val) => {
      toxicity_state = val;
    });
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
                      user_img ||
                      `https://avatars.dicebear.com/api/initials/${username}.svg`,
                    content: post.content,
                    date: new Date(post.date).toDateString(),
                    username: username,
                    pub: pub,
                    img: post.img,
                    thumb: post.thumb,
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
                user_img ||
                `https://avatars.dicebear.com/api/initials/${username}.svg`,
              content: post.content,
              date: Gun.state.is(post, "content"),
              username: username,
              img: post.img,
              thumb: post.thumb,
              pub: pub,
              uid: key,
              self: self,
            },
            ...posts,
          ];
        }
      }
    });

  let isFollowed;
  let following_graph = user_graph.get("following").get(pub);
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
  let followers_graph = user_graph.get("followers");
  followers_graph.on(() => {
    followers = 0;
    followers_graph.map().once((val) => {
      if (val === true) {
        followers += 1;
      }
    });
  });

  let certificate;
  user_graph.get("followersCert").once((cert) => {
    certificate = cert;
  });

  let isFollowingUser;
  user_graph
    .get("following")
    .get($keys.pub)
    .once((isFollowingUser_) => {
      isFollowingUser = isFollowingUser_;
    });

  function call() {
    var event = new CustomEvent("call", {
      detail: {
        pub: pub,
        name: username,
        img:
          user_img ||
          `https://avatars.dicebear.com/api/initials/${username}.svg`,
      },
    });

    document.dispatchEvent(event);
  }
</script>

<div class="flex justify-center items-center">
  <div class="break-all w-full md:w-1/2 lg:w-1/3">
    <div class="m-2 p-2 flex items-center">
      <div class="h-16 w-16 aspect-square object-cover rounded-full">
        <Highlight
          person={{
            name: username,
            pub: pub,
          }}
          forAccount={true}
        />
      </div>
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
      {#if isFollowingUser && $location !== `/u/${$keys.pub}`}
        <div class="dropdown dropdown-left">
          <div tabindex="-1" class="btn btn-xs btn-ghost m-1">
            <DotsVerticalRounded width="1.5em" />
          </div>
          <div
            tabindex="-1"
            class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <button on:click={call}> call </button>
            </li>
          </div>
        </div>
      {/if}
    </div>
    <div class="flex flex-col justify-center items-center">
      {#if $location !== `/u/${$keys.pub}`}
        {#if !isFollowed}
          <button
            on:click={async () => {
              await user.get("following").get(pub).put(true);
              user_graph
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
              user_graph
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
    <div class="text-xs m-3 p-4 pt-0 pb-0 flex gap-0.5 flex-wrap">
      {@html parse(user_bio)}
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
