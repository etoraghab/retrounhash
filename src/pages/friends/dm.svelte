<script>
  import Message from "../../components/message.svelte";
  import { db, keys, user } from "../../lib/gun";

  export let params;
  let pub = params.pub;
  let messages = [];
  user
    .get("dm")
    .get(pub)
    .map()
    .once((a, b) => {
      messages = [
        {
          message: a.message,
          time: Gun.state.is(a, "message"),
          self: true,
        },
        ...messages,
      ];
    });

  db.user(pub)
    .get("dm")
    .get($keys.pub)
    .map()
    .once((a, b) => {

      messages = [
        {
          message: a.message,
          time: Gun.state.is(a, "message"),
          self: false,
        },
        ...messages,
      ];
    });

  function sortItUp() {
    let a = messages.filter(
      (v, i, a) =>
        a.findIndex((v2) => JSON.stringify(v2) === JSON.stringify(v)) === i
    );
    messages = a;
    messages.sort((d1, d2) => d1.time - d2.time);
  }

  $: messages, sortItUp();
</script>

<div class="w-full md:w-1/2 lg:w-1/3 m-auto flex justify-center items-center">
  <div class="w-full mt-4">
    <div class="flex flex-col gap-1 chat">
      {#each messages as m}
        <Message message={m.message} self={m.self} time={m.time} />
      {/each}
    </div>
    <div class="mb-10" />
  </div>
</div>
