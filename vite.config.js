import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index-prod.html',
      },
      output: {
        entryFileNames: 'script.js',
        assetFileNames: assetInfo => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'styles.css';
          }
          return assetInfo.name;
        },
      },
    },
  },
  plugins: [
    {
      name: 'copy-locales-and-rename',
      generateBundle() {
        // Create dist directory if it doesn't exist
        if (!existsSync('dist')) {
          mkdirSync('dist', { recursive: true });
        }

        // Copy locales directory
        if (!existsSync('dist/locales')) {
          mkdirSync('dist/locales', { recursive: true });
        }
        copyFileSync('locales/en.json', 'dist/locales/en.json');
        copyFileSync('locales/ja.json', 'dist/locales/ja.json');
      },
      writeBundle() {
        // Rename index-prod.html to index.html
        if (existsSync('dist/index-prod.html')) {
          copyFileSync('dist/index-prod.html', 'dist/index.html');
        }
      },
    },
  ],
});
