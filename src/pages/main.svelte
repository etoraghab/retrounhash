<script>
  import { db, keys, user } from "../lib/gun";
  import { toast } from "../lib/alert";
  import { reveal } from "svelte-reveal";
  import { push } from "svelte-spa-router";

  let username;
  let password;

  let user_ = user.is;
  console.log(user_);
  if (user_) {
    push("/home");
  }
  if (localStorage.getItem("$keys") && !user_) {
    user.auth(JSON.parse(localStorage.getItem("$keys")), function (res) {
      console.log("loggedin auto");
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
      class="input input-sm border-blue-400"
    />
    <div class="flex flex-col gap-3">
      <input
        use:reveal={{ transition: "fade", delay: 450 }}
        placeholder="password"
        type="password"
        bind:value={password}
        class="input input-sm border-blue-400"
      />
      <button
        use:reveal={{ transition: "blur", delay: 1000 }}
        on:click={() => {
          user.create(username, password, function (res) {
            if (res.err == "User already created!") {
              user.auth(username, password, function (res) {
                if (res.err == "Wrong user or password.") {
                  toast.fire({
                    title: "wrong username or password",
                    timer: 3000,
                    icon: "error",
                    showCloseButton: true,
                  });
                } else {
                  user_ = db.user()._.sea;
                  console.log(user_);
                }
              });
            } else {
              user.auth(username, password, function (res) {
                localStorage.setItem("$keys", JSON.stringify(user._.sea));
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
