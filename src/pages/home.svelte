<script>
  import Loading from "../components/loading.svelte";
  import Post from "../components/post.svelte";
  import { db, keys, user, username } from "../lib/gun";
  require("@tensorflow/tfjs");
  const toxicity = require("@tensorflow-models/toxicity");

  const threshold = 0.9;
  let loading = false;

  let posts = [];

  user.get("following").get($keys.pub).put(true);
  let toxicity_state;
  user
    .get("settings")
    .get("toxic_filter")
    .once((val) => {
      toxicity_state = val;
    });

  user
    .get("following")
    .map()
    .once(async (ifTrue, pub) => {
      loading = true;
      if (ifTrue) {
        let user_graph = db.user(pub);
        await user_graph.get("alias").once(async (name) => {
          user_graph.get("displayImage").once(async (useAvatar) => {
            await user_graph
              .get("posts")
              .map()
              .once(async (post, key) => {
                if (toxicity_state) {
                  toxicity.load(threshold).then((model) => {
                    const sentences = [post.content];
                    model.classify(sentences).then((predictions) => {
                      if (predictions[6].results[0].match !== true) {
                        if (typeof post !== undefined && post) {
                          let self;
                          if ($username === name) {
                            self = true;
                          } else {
                            self = false;
                          }
                          posts = [
                            {
                              avatar:
                                useAvatar ||
                                `https://avatars.dicebear.com/api/initials/${name}.svg`,
                              content: post.content,
                              date: Gun.state.is(post, "content"),
                              username: name,
                              img: post.img,
                              pub: pub,
                              thumb: post.thumb,
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
                    if ($username === name) {
                      self = true;
                    } else {
                      self = false;
                    }
                    posts = [
                      {
                        avatar:
                          useAvatar ||
                          `https://avatars.dicebear.com/api/initials/${name}.svg`,
                        content: post.content || "",
                        date: Gun.state.is(post, "content"),
                        username: name,
                        pub: pub,
                        img: post.img,
                        thumb: post.thumb,
                        self: self,
                        uid: key,
                      },
                      ...posts,
                    ];
                  }
                }
              });
          });
        });
      }
      loading = false;
    });

  function sortEm() {
    posts.sort(
      (d1, d2) => new Date(d2.date).getTime() - new Date(d1.date).getTime()
    );
  }

  $: posts, sortEm();

  //user.get("posts").put(null)
</script>

<div class="p-3">
  <div class="flex justify-center items-center flex-col gap-3">
    {#if loading}
      <Loading />
    {:else}
      {#each posts as p}
        <Post data={p} />
      {/each}
    {/if}
    {#if posts.length == 0}
      <div class="text-center text-md">no feed!</div>
      <div class="text-center text-xs capitalize">
        follow people or write posts to make them apear here.
      </div>
    {/if}
  </div>
</div>

<div class="flex justify-center items-center">
  <div class="divider w-full md:w-1/2 lg:w-1/3" />
</div>
<br />
<br />
<br />
