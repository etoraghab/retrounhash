<script>
  import { Plus, TrashAlt, X } from "@svicons/boxicons-regular";
  import { reveal } from "svelte-reveal";
  import { v4 } from "uuid";
  import { db, user } from "../lib/gun";
  import { toast } from "./toast";
  export let person, self;
  let h = [];
  let overlay;

  let highlight_user_graph = db.user(person.pub);
  let name_user, avatar;
  highlight_user_graph.get("alias").once((name) => {
    highlight_user_graph.get("displayImage").once(async (useAvatar) => {
      avatar =
        useAvatar || `https://avatars.dicebear.com/api/initials/${name}.svg`;
      name_user = name;
      highlight_user_graph
        .get("highlights")
        .map()
        .once((a, b) => {
          if (a) {
            h = [
              {
                caption: a.caption,
                img: a.img,
                uid: b,
              },
              ...h,
            ];
          }
        });
    });
  });

  let counter = 0;

  async function uploadHighlight() {
    var file = document.querySelector("#highlight-chooser").files[0];

    var reader = new FileReader();
    reader.onload = async function () {
      user
        .get("highlights")
        .get(v4())
        .put({
          img: reader.result,
          caption: prompt("caption"),
        })
        .then((e) => {
          toast("success", "uploaded");
        });
    };
    reader.readAsDataURL(file);
  }

  function Timer(fn, t) {
    var timerObj = setInterval(fn, t);

    this.stop = function () {
      if (timerObj) {
        clearInterval(timerObj);
        timerObj = null;
      }
      return this;
    };

    // start timer using current settings (if it's not already running)
    this.start = function () {
      if (!timerObj) {
        this.stop();
        timerObj = setInterval(fn, t);
      }
      return this;
    };

    // start with new or original interval, stop current interval
    this.reset = function (newT = t) {
      t = newT;
      return this.stop().start();
    };
  }

  var timer = new Timer(function () {
    if (overlay) {
      counter += 1;
    }
  }, 5000);
  timer.start();

  function stopTimer() {
    if (overlay) {
      timer.reset(5000);
      timer.start();
    } else {
      timer.stop();
    }
  }

  $: overlay, stopTimer();
</script>

{#if self == true}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    on:click={() => {
      if (h.length !== 0) {
        overlay = true;
      }
    }}
    class="flex w-16 container m-2 flex-col justify-center items-center gap-2"
  >
    <div>
      <div class="indicator">
        <label
          for="highlight-chooser"
          class="indicator-item cursor-pointer indicator-bottom badge badge-ghost p-1"
        >
          <Plus width="1.2em" />
        </label>
        <input
          type="file"
          name="highlight-chooser"
          id="highlight-chooser"
          on:change={uploadHighlight}
          accept="image/*"
          class="hidden"
        />
        <div>
          <img
            src={avatar}
            class="h-14 w-14 object-cover rounded-full"
            alt=""
          />
        </div>
      </div>
    </div>
    <div class="truncate max-w-10 text-xs">
      {name_user}
    </div>
  </div>
{:else if h.length !== 0}
  <div
    class="flex w-16 container m-2 flex-col justify-center items-center gap-2"
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      on:click={() => {
        overlay = true;
      }}
    >
      <img
        src={avatar}
        class="h-14 w-14 object-cover rounded-full ring ring-blue-500"
        alt=""
      />
    </div>
    <div class="truncate max-w-10 text-xs">
      {name_user}
    </div>
  </div>
{/if}

{#if overlay}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    use:reveal={{
      transition: "slide",
      duration: 200,
    }}
    class="bg-base-100 z-20 flex justify-center items-center bg-opacity-50 backdrop-blur-md"
    id="overlay"
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="carousel h-full m-2 w-full md:w-1/2 lg:w-1/3">
      <div class="carousel-item relative w-full pt-2 pb-2">
        <div class="indicator h-full mb-3 w-full">
          <button
            on:click={() => {
              overlay = false;
            }}
            class="indicator-item badge badge-ghost mr-2"
          >
            <X width="1em" />
          </button>
          <img
            alt=""
            src={h[counter].img}
            class="w-full rounded-md object-cover"
          />
        </div>
        <div
          class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2"
        >
          {#if counter !== 0}
            <button
              class="btn btn-circle btn-ghost mr-auto"
              on:click={() => {
                if (counter !== 0) {
                  counter -= 1;
                  timer.reset(5000);
                }
              }}>❮</button
            >
          {/if}

          {#if counter !== h.length - 1}
            <button
              class="btn btn-circle btn-ghost ml-auto"
              on:click={() => {
                if (counter !== h.length - 1) {
                  counter += 1;
                  timer.reset(5000);
                }
              }}
            >
              ❯
            </button>
          {/if}
        </div>
        {#if self}
          <button
            on:click={() => {
              user
                .get("highlights")
                .get(h[counter].uid)
                .put(null)
                .then(() => {
                  toast("success", "deleted");
                });
            }}
            class="text-red-600 fixed bottom-4 right-4 btn btn-xs btn-ghost ml-auto mt-auto bg-white bg-opacity-70 backdrop-blur-sm"
          >
            <TrashAlt width="1.5em" />
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  #overlay {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 52;
  }
</style>
