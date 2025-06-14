<script lang="ts">
  // If you have global styles or providers, import them here.
  // import '../app.css'; // Example: if you have a global stylesheet
</script>

<main>
  <slot />
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    line-height: 1.5;
  }
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
</style>
