<script>
  import Post from "../components/post.svelte";
  import { db, keys, user } from "../lib/gun";
  import { location } from "svelte-spa-router";
  require("@tensorflow/tfjs");
  const toxicity = require("@tensorflow-models/toxicity");

  export let params;
  const pub = params.pub;

  const user_graph = db.user(pub);
  let username;
  user_graph.get("alias").once((name) => {
    username = name;
  });

  let user_bio;
  user_graph.get("bio").on((bio) => {
    user_bio = bio || "404 no bio";
  });

  let user_displayName;
  user_graph.get("displayName").on((displayName) => {
    user_displayName = displayName || username;
  });

  let posts = [];
  user_graph.get("alias").once(async (name) => {
    user_graph
      .get("posts")
      .map()
      .once(async (post, key) => {
        if (typeof post.content == "string") {
          if (localStorage.getItem("toxic_filter") == "true") {
            toxicity.load(0.9).then((model) => {
              const sentences = [post.content];
              model.classify(sentences).then((predictions) => {
                if (predictions[6].results[0].match !== true) {
                  posts = [
                    {
                      avatar: `https://avatars.dicebear.com/api/initials/${name}.svg`,
                      content: post.content,
                      date: new Date(post.date).toDateString(),
                      username: name,
                      pub: pub,
                    },
                    ...posts,
                  ];
                }
              });
            });
          } else {
            posts = [
              {
                avatar: `https://avatars.dicebear.com/api/initials/${name}.svg`,
                content: post.content,
                date: new Date(post.date).toDateString(),
                username: name,
                pub: pub,
              },
              ...posts,
            ];
          }
        }
      });
  });

  let isFollowed;
  let following_graph = user.get("following").get(pub);
  following_graph.on((val) => {
    isFollowed = val;
  });
</script>

<div class="flex justify-center items-center">
  <div class="break-all w-full md:w-1/2 lg:w-1/3">
    <div class="m-2 p-2 flex items-center">
      <img
        class="h-16 w-16 aspect-square object-cover rounded-full"
        src={`https://avatars.dicebear.com/api/initials/${username}.svg`}
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
    </div>
    <div class="flex flex-col justify-center items-center">
      {#if $location !== `/u/${$keys.pub}`}
        {#if !isFollowed}
          <button
            on:click={() => {
              following_graph.put(true);
            }}
            class="btn btn-wide btn-xs bg-blue-600 hover:bg-blue-500 text-white border border-gray-300"
          >
            follow
          </button>
        {:else}
          <button
            on:click={() => {
              following_graph.put(false);
            }}
            class="btn btn-wide btn-xs btn-ghost border border-gray-300"
          >
            unfollow
          </button>
        {/if}
      {/if}
    </div>
    <div class="text-xs m-2 p-2">
      {user_bio || "404 bio not found"}
    </div>
  </div>
  <hr />
</div>
<div class="p-3">
  <div class="flex justify-center items-center flex-col gap-3">
    {#each posts as p}
      <Post data={p} />
    {/each}
  </div>
</div>
