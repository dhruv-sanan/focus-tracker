// public/custom-sw.js

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.__WB_MANIFEST; // ← This line is required!
