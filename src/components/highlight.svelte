<script>
  import {
    ChevronLeft,
    ChevronRight,
    Plus,
    TrashAlt,
    X,
  } from "@svicons/boxicons-regular";
  import { reveal } from "svelte-reveal";
  import { v4 } from "uuid";
  import { db, keys, user } from "../lib/gun";
  import { toast } from "./toast";
  export let person, self, forAccount;
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

  function updatedCounter() {
    progress = 0;
  }

  $: counter, updatedCounter();

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
      if (counter + 1 !== h.length) {
        counter += 1;
        progress = 0;
      }
    }
  }, 10000);
  timer.start();

  let progress = 0;

  let timer_prog = new Timer(() => {
    if (overlay) {
      progress += 100;
    }
  }, 100);

  function stopTimer() {
    if (overlay) {
      timer_prog.reset(100);
      timer_prog.start();
      timer.reset(10000);
      timer.start();
    } else {
      timer_prog.stop();
      timer.stop();
      counter = 0;
      progress = 0;
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
    class="flex w-16 truncate container m-2 flex-col justify-center items-center gap-2"
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
            draggable="false"
            src={avatar}
            class="h-14 w-14 object-cover rounded-full 
            {h.length !== 0
              ? 'border-2 border-offset-2 border-blue-700 hover:border-sky-700 transition-all duration-500'
              : ''}"
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
    class="flex w-16 truncate container m-2 flex-col justify-center items-center gap-2"
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      on:click={() => {
        overlay = true;
      }}
    >
      <img
        src={avatar}
        class="h-14 w-14 object-cover rounded-full border-2 border-offset-2 border-blue-500 transition-all duration-500 hover:border-sky-700"
        alt=""
      />
    </div>
    {#if !forAccount}
      <div class="max-w-10 text-xs">
        {name_user}
      </div>
    {/if}
  </div>
{:else if forAccount == true}
  <div
    class="flex w-16 truncate container m-2 flex-col justify-center items-center gap-2"
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      on:click={() => {
        overlay = true;
      }}
    >
      <img
        src={avatar}
        class="h-14 w-14 object-cover rounded-full 
            {h.length !== 0
          ? 'border-2 border-offset-2 border-blue-700 hover:border-sky-700 transition-all duration-500'
          : ''}"
        alt=""
      />
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
          <img
            alt=""
            src={h[counter].img}
            class="w-full rounded-md object-cover"
          />
        </div>
        <!-- progress -->
        <div
          class="absolute flex flex-col justify-between transform -translate-y-1/2 w-full left-0 right-0 top-8"
        >
          <progress
            class="progress progress-accent w-full caret-blue-600 h-2"
            value={progress}
            max="10000"
          />
          <div class="ml-auto mr-3">
            <button
              on:click={() => {
                overlay = false;
              }}
              class="text-black btn btn-xs btn-ghost ml-auto mt-3 bg-white hover:bg-white bg-opacity-70 backdrop-blur-sm"
            >
              <X width="1.5em" />
            </button>
          </div>
        </div>
        <div
          class="absolute flex justify-between transform -translate-y-1/2 w-full bottom-1/4 bg-black bg-opacity-60 backdrop-blur-sm text-white text-opacity-80 text-center"
        >
          <div class="text-center w-full">
            {h[counter].caption}
          </div>
        </div>
        <div
          class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2"
        >
          {#if counter !== 0}
            <button
              class="btn p-2 btn-sm rounded-full h-10 w-10 btn-ghost bg-white bg-opacity-70 backdrop-blur-sm mr-auto"
              on:click={() => {
                if (counter !== 0) {
                  counter -= 1;
                  timer.reset(10000);
                }
              }}
            >
              <ChevronLeft width="2em" />
            </button>
          {/if}

          {#if counter !== h.length - 1}
            <button
              class="btn p-2 btn-sm rounded-full h-10 w-10 btn-ghost bg-white bg-opacity-70 backdrop-blur-sm ml-auto"
              on:click={() => {
                if (counter !== h.length - 1) {
                  counter += 1;
                  timer.reset(10000);
                }
              }}
            >
              <ChevronRight width="2em" />
            </button>
          {/if}
        </div>
        {#if self || person.pub == $keys.pub}
          <div
            class="absolute flex justify-between transform -translate-y-1/2 w-full left-0 right-0 bottom-3"
          >
            <button
              on:click={async () => {
                try {
                  await user.get("highlights").get(h[counter].uid).put(null);
                } catch (error) {
                  toast("error", "internal error");
                } finally {
                  counter = 0;
                  h = h.filter(function (obj) {
                    return obj.uid !== h[counter].uid;
                  });
                  if (h.length == 0) {
                    overlay = false;
                  }
                  progress = 0;
                  toast("success", "deleted");
                }
              }}
              class="text-red-600 fixed bottom-4 right-4 btn btn-xs btn-ghost ml-auto mt-auto bg-white bg-opacity-70 backdrop-blur-sm"
            >
              <TrashAlt width="1.5em" />
            </button>
          </div>
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

  .truncate {
    cursor: pointer;
  }
</style>
