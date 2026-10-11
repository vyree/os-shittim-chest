import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

function syncPublicIcons(): void {
  const rootDir = process.cwd();
  const publicDir = path.resolve(rootDir, 'public');
  const candidates = [
    path.resolve(rootDir, 'src/assets/images/webapp_icon_arona_1791637193126.jpg'),
    path.resolve(publicDir, 'icon-180.png'),
    path.resolve(publicDir, 'favicon.ico'),
  ];

  const sourceIcon = candidates.find((p) => fs.existsSync(p));
  if (!sourceIcon || !fs.existsSync(publicDir)) return;

  const targets = [
    'favicon.ico',
    'icon-180.png',
    'pwa-192x192.png',
    'pwa-512x512.png',
    'pwa-maskable-512x512.png',
  ];

  for (const name of targets) {
    const dest = path.join(publicDir, name);
    if (path.resolve(sourceIcon) === path.resolve(dest)) continue;
    try {
      fs.copyFileSync(sourceIcon, dest);
    } catch {
      // ignore copy errors in read-only environments
    }
  }
}

function publicIconsPlugin(): Plugin {
  return {
    name: 'arona-sync-public-icons',
    buildStart() {
      syncPublicIcons();
    },
    configureServer() {
      syncPublicIcons();
    },
  };
}

syncPublicIcons();

export default defineConfig({
  plugins: [
    publicIconsPlugin(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-180.png'],
      manifest: {
        id: '/',
        name: 'Arona OS',
        short_name: 'Arona OS',
        description: 'Arona - OS Shittim Chest',
        theme_color: '#36A4F8',
        background_color: '#060b14',
        display: 'standalone',
        orientation: 'landscape',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  server: { port: 3000, host: '0.0.0.0' },
});
