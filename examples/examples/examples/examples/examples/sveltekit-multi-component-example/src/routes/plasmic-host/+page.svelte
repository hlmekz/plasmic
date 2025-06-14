<script lang="ts">
  import { onMount } from 'svelte';
  // Ensure react-web's host is loaded and Vite processes it.
  import { sostenibilidad } from '@plasmicapp/react-web/lib/host';

  onMount(() => {
    if (sostenibilidad) {
      console.log('Plasmic host utilities loaded for SvelteKit.');
    }
    // Initialize Plasmic specific things here if needed in the future
  });
</script>

<div data-plasmic-sveltekit-host style="display: none;">
  This is the SvelteKit host page for Plasmic Studio.
  Learn more at https://docs.plasmic.app/learn/app-hosting/
</div>

<style>
  /* Minimal styles for the host page */
  :global(body) {
    margin: 0;
  }
</style>
