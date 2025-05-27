import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default {
  input: 'script.js',
  output: {
    file: 'dist/script.js',
    format: 'iife',
    name: 'MathApp'
  },
  external: [],
  plugins: [
    json({
      compact: true
    }),
    nodeResolve({
      preferBuiltins: false,
      browser: true,
      exportConditions: ['default', 'module', 'import']
    }),
    commonjs(),
    {
      name: 'copy-assets',
      generateBundle() {
        // Create dist directory if it doesn't exist
        if (!existsSync('dist')) {
          mkdirSync('dist', { recursive: true });
        }
        
        // Copy HTML, CSS, and other assets (use production HTML)
        copyFileSync('index-prod.html', 'dist/index.html');
        copyFileSync('styles.css', 'dist/styles.css');
        
        // Copy locales directory
        if (!existsSync('dist/locales')) {
          mkdirSync('dist/locales', { recursive: true });
        }
        copyFileSync('locales/en.json', 'dist/locales/en.json');
        copyFileSync('locales/ja.json', 'dist/locales/ja.json');
      }
    }
  ]
};