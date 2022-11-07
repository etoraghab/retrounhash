<script>
  import { SEA } from "gun";

  import Post from "../components/post.svelte";
  import { db } from "../lib/gun";
  let posts = [];
  db.get("#" + prompt("hashtag:"))
    .map()
    .once((soul, b) => {
      db.get(soul).once(async (a) => {
        if (Object.hasOwn(a || {}, "pub") && Object.hasOwn(a || {}, "sign")) {
          let signed = await SEA.verify(a.sign, a.pub);
          if (signed === a.content) {
            db.user(a.pub)
              .get("alias")
              .once((name) => {
                posts = [
                  {
                    avatar: `https://avatars.dicebear.com/api/initials/${name}.svg`,
                    content: a.content,
                    date: new Date(a.date).toDateString(),
                    username: name,
                    pub: a.pub,
                  },
                  ...posts,
                ];
              });
          }
        }
      });
    });
</script>

<div class="p-3">
  <div class="flex justify-center items-center flex-col gap-3">
    {#each posts as p}
      <Post data={p} />
    {/each}
  </div>
</div>
