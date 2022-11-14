<script>
  import { reveal } from "svelte-reveal";
  import { push } from "svelte-spa-router";
  import Loading from "../components/loading.svelte";
  import { db, user } from "../lib/gun";

  let following = [];
  let following_no = 0;
  export let params;
  const pub = params.pub;
  let loading = true;

  let following_graph = db.user(pub).get("following");
  following_graph
    .map()
    .once(async (val, pub_f) => {
      if (val == true && pub_f !== pub) {
        let user_posts = 0;
        let user_name;
        let user_image;

        let user_graph = db.user(pub_f);
        await user_graph.get("alias").once((name) => {
          user_name = name;
        });

        await user_graph
          .get("posts")
          .map()
          .once(() => {
            user_posts += 1;
          });

        await user_graph.get("displayImage").once((pic) => {
          user_image = pic;
        });

        following_no += 1;
        following = [
          {
            name: user_name,
            pub: pub_f,
            username: user_name,
            posts: user_posts,
            avatar:
              user_image ||
              `https://avatars.dicebear.com/api/initials/${user_name}.svg`,
          },
          ...following,
        ];
      }
    })
    .then(() => {
      loading = false;
    });

  let user_main_name;
  db.user(pub)
    .get("alias")
    .once((name) => {
      user_main_name = name;
    });
</script>

<div class="p-3">
  <div class="flex justify-center items-center flex-col gap-3">
    {#if loading}
      <Loading />
    {:else}
      <div class="capitalize text-xl">
        {"@" + user_main_name} is following {following_no}
        {#if following_no > 1}
          users
        {:else}
          user
        {/if}
      </div>
      {#each following as f}
        <div
          use:reveal={{
            duration: 450,
            easing: "easeInBack",
            transition: "fade",
          }}
          class="bg-base-100 border border-blue-600 border-opacity-10 bg-opacity-6 p-2 w-full md:w-1/2 lg:w-1/3 rounded-xl flex gap-2"
        >
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <img
            on:click={() => {
              push(`/u/${f.pub}`);
            }}
            src={f.avatar}
            class="rounded-lg w-10 h-10 aspect-square object-cover cursor-pointer"
            alt=""
          />
          <div class="text-xs break-all w-full flex flex-col">
            <div class="flex w-full">
              <div class="text-md truncate">@{f.username}</div>
            </div>
            <span class="flex gap-1 flex-wrap">
              <div
                class="badge badge-sm badge-ghost flex gap-1 justify-center items-center"
              >
                {f.posts}
                {#if f.posts > 1}
                  posts
                {:else}
                  post
                {/if}
              </div>
            </span>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
