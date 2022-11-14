<script>
  import Post from "../components/post.svelte";
  import { db } from "../lib/gun";

  export let params;
  let query = params.query;
  let posts = [];

  query.split(" ").forEach((query) => {
    db.get("search")
      .get("query")
      .get("#" + String(query).toLowerCase())
      .map()
      .once((post) => {
        db.get(post).once(async (a) => {
          if (Object.hasOwn(a || {}, "pub") && Object.hasOwn(a || {}, "sign")) {
            let signed = await SEA.verify(a.sign, a.pub);
            if (signed === a.content) {
              let user_graph = db.user(a.pub);
              user_graph.get("alias").once((name) => {
                user_graph.get("displayImage").once(async (useAvatar) => {
                  if (typeof a !== undefined) {
                    posts = [
                      {
                        avatar:
                          useAvatar ||
                          `https://avatars.dicebear.com/api/initials/${name}.svg`,
                        content: a.content,
                        date: Gun.state.is(a, "content"),
                        username: name,
                        img: a.img,
                        pub: a.pub,
                      },
                      ...posts,
                    ];
                  }
                });
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
    posts.sort(
      (d1, d2) => new Date(d2.date).getTime() - new Date(d1.date).getTime()
    );
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
<div class="flex justify-center items-center">
  <div class="divider w-full md:w-1/2 lg:w-1/3" />
</div>
<br />
<br />
<br />
