<script>
  import Post from "../components/post.svelte";
  import { db, keys, user } from "../lib/gun";
  require("@tensorflow/tfjs");
  const toxicity = require("@tensorflow-models/toxicity");

  const threshold = 0.9;

  // Load the model. Users optionally pass in a threshold and an array of
  // labels to include

  let posts = [];

  user.get("following").get($keys.pub).put(true);

  user
    .get("following")
    .map()
    .once(async (ifTrue, pub) => {
      if (ifTrue) {
        let user_graph = db.user(pub);
        await user_graph.get("alias").once(async (name) => {
          await user_graph
            .get("posts")
            .map()
            .once(async (post, key) => {
              if (typeof post.content == "string") {
                if (localStorage.getItem("toxic_filter") == "true") {
                  toxicity.load(threshold).then((model) => {
                    const sentences = [post.content];
                    model.classify(sentences).then((predictions) => {
                      if (predictions[6].results[0].match !== true) {
                        if (Object.hasOwn(post, "content")) {
                          posts = [
                            {
                              avatar: `https://avatars.dicebear.com/api/initials/${name}.svg`,
                              content: post.content,
                              date: post.date,
                              username: name,
                              pub: pub,
                              time: post.time,
                            },
                            ...posts,
                          ];
                        }
                      }
                    });
                  });
                } else {
                  if (Object.hasOwn(post, "content")) {
                    posts = [
                      {
                        avatar: `https://avatars.dicebear.com/api/initials/${name}.svg`,
                        content: post.content,
                        date: post.date,
                        username: name,
                        pub: pub,
                        time: post.time,
                      },
                      ...posts,
                    ];
                  }
                }
              }
            });
        });
      }
    });

  function sortEm() {
    posts.forEach((p) => {
      console.log(p.time);
    });
    posts.sort(
      (d1, d2) => new Date(d2.date).getTime() - new Date(d1.date).getTime()
    );
    console.log(posts);
  }

  $: posts, sortEm();

  //user.get("posts").put(null)
</script>

<div class="p-3">
  <div class="flex justify-center items-center flex-col gap-3">
    {#each posts as p}
      <Post data={p} />
    {/each}
  </div>
</div>
