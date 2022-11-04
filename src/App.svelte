<script>
  import "./style.css";
  import { db, user } from "./lib/gun";
  import Gui from "./Gui.svelte";
  import { toast } from "./lib/alert";

  let username;
  let password;

  let user_ = db.user().is;

  /**
   * theme management
   */

  document
    .querySelector("html")
    .setAttribute("data-theme", localStorage.getItem("theme"));
</script>

{#if user_}
  <Gui />
{:else}
  <div class="flex justify-center items-center">
    <div class="w-1/3 flex flex-col gap-2 justify-center items-center h-screen">
      <div class="text-center text-4xl font-mono">verse</div>
      <input
        placeholder="username"
        type="text"
        bind:value={username}
        class="input input-sm border-blue-400" />
      <div class="flex flex-col gap-3">
        <input
          placeholder="password"
          type="password"
          bind:value={password}
          class="input input-sm border-blue-400" />
        <button
          on:click={() => {
            user.create(username, password, function (res) {
              if (res.err == 'User already created!') {
                user.auth(username, password, function (res) {
                  if (res.err == 'Wrong user or password.') {
                    toast.fire({
                      title: 'wrong username or password',
                      timer: 3000,
                      icon: 'error',
                      showCloseButton: true,
                    });
                  } else {
                    user_ = db.user()._.sea;
                  }
                });
              } else {
                user.auth(username, password, function (res) {
                  user_ = db.user()._.sea;
                  db.user().get('following').get(user_.pub).put(user_.pub);
                });
              }
            });
          }}
          class="btn w-fit btn-sm">
          go
        </button>
      </div>
    </div>
  </div>
{/if}
