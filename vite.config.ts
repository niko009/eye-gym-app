import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Eye Gym — упражнения для глаз',
        short_name: 'Eye Gym',
        description: 'Короткие комплексы упражнений для расслабления глаз.',
        theme_color: '#083f3b',
        background_color: '#f2f7f2',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        lang: 'ru',
        categories: ['health', 'fitness', 'lifestyle'],
        icons: [{src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable'}],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2,json}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({url}) => url.pathname.startsWith('/audio/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'eye-gym-audio-v1',
              expiration: {maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 365},
              cacheableResponse: {statuses: [0, 200]},
            },
          },
          {urlPattern: ({url}) => url.pathname.startsWith('/api/'), handler: 'NetworkOnly'},
        ],
      },
      devOptions: {enabled: true},
    }),
  ],
  base: '/',
  resolve: {alias: {'@': path.resolve(__dirname, '.')}},
  server: {hmr: process.env.DISABLE_HMR !== 'true'},
});
