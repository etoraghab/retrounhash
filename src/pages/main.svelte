<script>
  import { db, keys, user } from "../lib/gun";
  import { reveal } from "svelte-reveal";
  import { push } from "svelte-spa-router";
  import { toast } from "../components/toast";
  import Loading from "../components/loading.svelte";
  import { SEA } from "gun";

  let username;
  let password;
  let loading = false;

  let user_ = user.is;
  if (user_) {
    push("/home");
  }
  if (localStorage.getItem("keys")) {
    user.auth(JSON.parse(localStorage.getItem("keys")), function (res) {
      push("/home");
    });
  }

  keys.subscribe(() => {
    if ($keys.pub !== "") {
      push("/home");
    }
  });
</script>

<div class="flex justify-center items-center">
  <div class="w-1/3 flex flex-col gap-2 justify-center items-center h-screen">
    <div
      class="text-center text-4xl font-mono"
      use:reveal={{ transition: "fade", delay: 50 }}
    >
      retrounhash
    </div>
    {#if loading}
      <Loading />
    {:else}
      <input
        use:reveal={{ transition: "fade", delay: 0 }}
        placeholder="username"
        type="text"
        bind:value={username}
        class="input input-sm border-blue-700 border-opacity-80"
      />
      <div class="flex flex-col gap-3">
        <input
          use:reveal={{ transition: "fade", delay: 150 }}
          placeholder="password"
          type="password"
          bind:value={password}
          class="input input-sm border-blue-700 border-opacity-80"
        />

        <div>
          <button
            use:reveal={{ transition: "blur", delay: 300 }}
            on:click={async () => {
              loading = true;
              await user.auth(username, password, (e) => {
                if (e.err == "Wrong user or password.") {
                  user.create(username, password, (e) => {
                    if (e.ok == 0) {
                      user.auth(username, password, async (e) => {
                        const cert = await SEA.certify(
                          "*",
                          { "*": "followers", "+": "*" },
                          user._.sea,
                          null,
                          {}
                        );
                        await user.get("followersCert").put(cert);
                        toast("success");
                      });
                    } else if (e.err == "User already created!") {
                      toast("error", "wrong username/pass");
                    } else if (e.err == undefined) {
                      toast("success", "user created");
                    } else {
                      toast("error", e.err);
                    }
                  });
                } else if (e.err == "User already created!") {
                  toast("error", "wrong username/pass");
                }
                loading = false;
              });
            }}
            class="btn btn-xs btn-ghost bg-blue-700 border transition-all duration-300 border-blue-600 hover:bg-blue-600 hover:bg-opacity-40 text-white hover:text-opacity-60 border-opacity-30"
          >
            go
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
