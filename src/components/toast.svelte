<script>
  let showToast = false;
  let toastDetail;
  document.addEventListener("toast", function (e) {
    showToast = true;
    toastDetail = e.detail;
    setTimeout(() => {
      showToast = false;
    }, 2000);
  });
</script>

{#if showToast}
  <div class="flex toast h-auto justify-end items-end">
    {#if toastDetail.icon == "success"}
      <div
        class="bg-success backdrop-blur-md bg-opacity-10 text-success inline-flex flex-shrink-0
          justify-center items-center min-w-8 h-8 rounded-md"
      >
        <svg
          aria-hidden="true"
          class="w-5 m-2 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0
              011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        {#if toastDetail.text !== ""}
          <div class="ml-0 m-2 justify-center items-center flex">
            {toastDetail.text}
          </div>
        {/if}
      </div>
    {:else if toastDetail.icon == "error"}
      <div
        class="inline-flex backdrop-blur-md flex-shrink-0 justify-center items-center min-w-8 h-8
          bg-error bg-opacity-10 text-error rounded-md"
      >
        <svg
          aria-hidden="true"
          class="w-5 m-2 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414
              1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293
              4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
        {#if toastDetail.text !== ""}
          <div class="ml-0 m-2 justify-center items-center flex">
            {toastDetail.text}
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    width: 100%;
    z-index: 99999999999999999999999999999999999999999999999999;
    cursor: pointer;
  }
</style>
