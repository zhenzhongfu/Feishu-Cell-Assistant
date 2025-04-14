import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// 确保_redirects文件存在
const writeRedirects = () => {
  try {
    fs.writeFileSync('public/_redirects', '/* /index.html 200');
    console.log('Created _redirects file for Cloudflare Pages');
  } catch (error) {
    console.error('Failed to create _redirects file:', error);
  }
};

// 在构建前创建_redirects文件
writeRedirects();

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    })
  ],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  esbuild: {
    jsx: 'automatic'
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production'
      }
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        worker: path.resolve(__dirname, 'src/worker.js')
      },
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'markdown-vendor': ['marked', 'dompurify']
        },
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'worker' ? 'worker.js' : 'assets/[name]-[hash].js';
        }
      }
    }
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
}); 