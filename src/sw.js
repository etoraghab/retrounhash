// Add any other logic here as needed.

import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { CacheFirst } from "workbox-strategies";
import { createHandlerForURL } from "workbox-precaching";
import { ExpirationPlugin } from "workbox-expiration";
import { NavigationRoute } from "workbox-routing";
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  /\/build\/bundle.js/,
  new CacheFirst({
    cacheName: "js__v1.1.10",
    matchOptions: {
      ignoreVary: true,
    },
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 63072e3,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

registerRoute(
  /\/build\/bundle.js/,
  new CacheFirst({
    cacheName: "css__v1.1.10",
    matchOptions: {
      ignoreVary: true,
    },
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 63072e3,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

registerRoute(
  /\/public\/images\/*.(png|jpg|jpeg)/,
  new CacheFirst({
    cacheName: "images__v1.1.10",
    matchOptions: {
      ignoreVary: true,
    },
    plugins: [
      new ExpirationPlugin({
        maxEntries: 5000,
        maxAgeSeconds: 63072e3,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
