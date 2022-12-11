<script>
  import { ChevronRight } from "@svicons/boxicons-regular";
  import { link, push } from "svelte-spa-router";
  import Highlight from "../components/highlight.svelte";
  import { db, keys, user, username } from "../lib/gun";
  import { getUserData } from "../lib/utils";

  let pub = $keys.pub;
  let user_graph = db.user(pub);
  let person = [];
  let following_graph = user_graph.get("following");
  following_graph.map().once(async (val, pub_f) => {
    if (val == true && pub_f !== pub) {
      // let highlight_user_graph = db.user(pub_f);
      await getUserData(pub_f).then((data) => {
        person = [
          {
            pub: pub_f,
            name: data.name,
            avatar: data.img,
            displayName: data.displayName,
          },
          ...person,
        ];
      });
      // highlight_user_graph.get("alias").once((name) => {});
    }
  });
</script>

<div class="p-3">
  <div class="flex justify-center flex-col gap-3">
    <div class="flex overflow-x-scroll w-full md:w-1/2 lg:w-1/3 m-auto">
      <Highlight
        person={{
          name: username,
          pub: $keys.pub,
        }}
        self={true}
      />
      {#each person as p}
        <Highlight person={p} />
      {/each}
    </div>
  </div>
</div>

<div class="p-3 w-full md:w-1/2 lg:w-1/3 m-auto">
  <div class="text-xl mb-2">chats <sub class="text-xs">(beta)</sub></div>
  {#if person.length == 0}
    <button
      class="text-xs text-opacity-50 p-2 underline"
      on:click={() => {
        let pub = prompt("enter user pubkey, or follow the user manually");
        if (pub) {
          push(`/friends/${pub}`);
        }
      }}
    >
      start a convo
    </button>
  {/if}
  {#each person as p}
    <div
      class="rounded-full h-10 mb-2 border hover:shadow cursor-pointer transition-all duration-300 border-gray-600 border-opacity-40 flex p-1 items-center"
    >
      <a href="/friends/{p.pub}" use:link class="flex items-center w-full">
        <img
          src={p.avatar || "/favicon.ico"}
          class="object-cover h-7 w-7 rounded-full"
          alt=""
        />
        <div class="h-auto pl-1 flex flex-col items-start">
          <span class="text-sm">{p.displayName || p.name}</span>
          <span class="text-xs">@{p.name}</span>
        </div>
        <div class="m-auto" />
      </a>
      <div class="btn btn-xs rounded-full btn-ghost w-9 h-9">
        <ChevronRight width="1.7em" />
      </div>
    </div>
  {/each}
</div>
