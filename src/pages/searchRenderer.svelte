<script>
  import Search from "./search.svelte";

  export let params;
</script>

{#key params.query}
  <Search {params} />
{/key}
