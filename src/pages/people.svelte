<script>
  import { v4 } from "uuid";
  import Highlight from "../components/highlight.svelte";
  import { db, keys, user, username } from "../lib/gun";

  let pub = $keys.pub;
  let user_graph = db.user(pub);
  let person = [];
  let following_graph = user_graph.get("following");
  following_graph.map().once(async (val, pub_f) => {
    if (val == true && pub_f !== pub) {
      let highlight_user_graph = db.user(pub_f);
      highlight_user_graph.get("alias").once((name) => {
        person = [
          {
            pub: pub_f,
            name: name,
          },
          ...person,
        ];
      });
    }
  });
</script>

<div class="p-3">
  <div class="flex justify-center flex-col gap-3">
    <div class="flex overflow-x-scroll">
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
