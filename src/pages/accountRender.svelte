<script>
  import Account from "./account.svelte";

  export let params;
</script>

{#key params.pub}
  <Account {params} />
{/key}
