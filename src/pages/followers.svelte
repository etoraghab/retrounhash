<script>
  import { reveal } from "svelte-reveal";
  import { push } from "svelte-spa-router";
  import Loading from "../components/loading.svelte";
  import { db, user } from "../lib/gun";
  import { getUserData, parse } from "../lib/utils";

  let followers = [];
  export let params;
  const pub = params.pub;
  let loading = true;

  let user_graph = db.user(pub);
  let followers_graph = user_graph.get("followers");
  followers_graph
    .map()
    .once(async (val, pub_f) => {
      if (val == true && pub_f !== pub) {
        let user_image, user_bio, user_name;

        await getUserData(pub_f).then((data) => {
          user_image = data.img;
          user_name = data.name;
          user_bio = data.bio;

          followers = [
            {
              name: user_name,
              pub: pub_f,
              username: user_name,
              avatar: user_image,
              bio: user_bio,
            },
            ...followers,
          ];
        });
      }
    })
    .then(() => {
      loading = false;
    });

  let user_main_name;
  user_graph.get("alias").once((name) => {
    user_main_name = name;
  });
</script>

<div class="p-3">
  <div class="flex justify-center items-center flex-col gap-3">
    {#if loading}
      <Loading />
    {:else}
      <div class="capitalize text-xl">
        {"@" + user_main_name} is being followed by
      </div>
      {#each followers as f}
        <div
          use:reveal={{
            duration: 200,
            easing: "easeInBack",
            transition: "fade",
          }}
          class="bg-base-100 border border-blue-600 border-opacity-10 bg-opacity-6 p-2 w-full md:w-1/2 lg:w-1/3 rounded-xl flex gap-2"
        >
          <button
            class="rounded-full w-10 h-10 aspect-square object-cover cursor-pointer"
            on:click={() => {
              push(`/u/${f.pub}`);
            }}
          >
            <img
              src={f.avatar}
              class="rounded-full w-10 h-10 aspect-square object-cover cursor-pointer"
              alt=""
            />
          </button>
          <div class="text-xs break-all w-full flex flex-col">
            <div class="flex w-full">
              <div class="text-md truncate">@{f.username}</div>
            </div>
            <div
              class="text-xs flex gap-0.5 max-h-11 overflow-scroll flex-wrap"
            >
              {@html parse(f.bio)}
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
