<script>
  import { db, keys, user } from "../lib/gun";
  import { reveal } from "svelte-reveal";
  import { push } from "svelte-spa-router";
  import { toast } from "../components/toast";

  let username;
  let password;

  let user_ = user.is;
  if (user_) {
    push("/home");
  }
  if (localStorage.getItem("keys") && Object.hasOwn(!user_, "pub")) {
    user.auth(JSON.parse(localStorage.getItem("keys")), function (res) {
      push("/home");
    });
  }
</script>

<div class="flex justify-center items-center">
  <div class="w-1/3 flex flex-col gap-2 justify-center items-center h-screen">
    <div
      class="text-center text-4xl font-mono"
      use:reveal={{ transition: "fade", delay: 50 }}
    >
      verse
    </div>
    <input
      use:reveal={{ transition: "fade", delay: 150 }}
      placeholder="username"
      type="text"
      bind:value={username}
      class="input input-sm border-blue-700 border-opacity-80"
    />
    <div class="flex flex-col gap-3">
      <input
        use:reveal={{ transition: "fade", delay: 450 }}
        placeholder="password"
        type="password"
        bind:value={password}
        class="input input-sm border-blue-700 border-opacity-80"
      />
      <button
        use:reveal={{ transition: "blur", delay: 1000 }}
        on:click={() => {
          user.create(username, password, function (res) {
            if (res.err == "User already created!") {
              user.auth(username, password, function (res) {
                if (res.err == "Wrong user or password.") {
                  toast("error", "wrong username/pass");
                } else {
                  user_ = db.user()._.sea;
                }
              });
            } else {
              user.auth(username, password, function (res) {
                toast("success");
                localStorage.setItem("keys", JSON.stringify(user._.sea));
                push("/home");
              });
            }
          });
        }}
        class="btn w-fit btn-sm"
      >
        go
      </button>
    </div>
  </div>
</div>
