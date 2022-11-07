<script>
  import GUN from "gun";
  import Post from "../components/post.svelte";
  import { db, keys, user } from "../lib/gun";

  let posts = [];

  user.get("following").get($keys.pub).put(true);

  user
    .get("following")
    .map()
    .once(async (ifTrue, pub) => {
      console.log(pub);
      if (ifTrue) {
        let user_graph = db.user(pub);
        await user_graph.get("alias").once(async (name) => {
          await user_graph
            .get("posts")
            .map()
            .once(async (post, key) => {
              if (typeof post.content == "string") {
                console.log(post, key);
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
      }
    });
</script>

<div class="p-3">
  <div class="flex justify-center items-center flex-col gap-3">
    {#each posts as p}
      <Post data={p} />
    {/each}
  </div>
</div>
