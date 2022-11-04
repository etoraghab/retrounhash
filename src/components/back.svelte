<script>
  import BackIcon from "@svicons/boxicons-regular/arrow-back.svelte";
</script>

<button
  on:click={() => {
    history.back();
  }}
  class="btn m-auto btn-ghost btn-sm font-sans"
>
  <BackIcon width="1.2em" />
</button>
