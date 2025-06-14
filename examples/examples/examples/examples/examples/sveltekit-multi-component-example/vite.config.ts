import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['@plasmicapp/react-web', '@plasmicapp/react-web/skinny', 'react', 'react-dom'],
  },
  plugins: [sveltekit()]
});
