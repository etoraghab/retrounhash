<script>
  import Post from "../components/post.svelte";
  import { db } from "../lib/gun";

  export let params;
  let query = params.query;
  let posts = [];

  query.split(" ").forEach((query) => {
    db.get("search")
      .get("query")
      .get("#" + query)
      .map()
      .once((post) => {
        db.get(post).once(async (a) => {
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
  });

  function removeDUP() {
    let a = posts.filter(
      (v, i, a) =>
        a.findIndex((v2) => JSON.stringify(v2) === JSON.stringify(v)) === i
    );
    posts = a;
  }

  $: posts, removeDUP();
</script>

<div class="p-3">
  <div class="flex justify-center items-center flex-col gap-3">
    <div class="text-sm">
      {posts.length} results for "<i>{query}</i>"
    </div>
    {#each posts as p}
      <Post bold={params.query} data={p} />
    {/each}
  </div>
</div>
