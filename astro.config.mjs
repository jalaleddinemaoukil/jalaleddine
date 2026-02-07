import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [vue()],

  build: {
    // Inline small stylesheets automatically
    inlineStylesheets: 'auto',
    
    // Enable code splitting for better caching
    splitting: true,
  },

  vite: {
    plugins: [tailwindcss()],
    
    build: {
      // Enable CSS code splitting
      cssCodeSplit: true,
      
      // Minify with terser for better compression
      minify: 'terser',
      
      terserOptions: {
        compress: {
          // Remove console.log in production
          drop_console: true,
          drop_debugger: true,
        },
      },
      
      rollupOptions: {
        output: {
          // Separate vendor chunks for better caching
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
  },
});