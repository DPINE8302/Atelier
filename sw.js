const CACHE_NAME = 'atelier-cache-v1';

// App Shell: The minimal set of files needed to run the app
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/hooks/useLocalStorage.ts',
  '/hooks/useMediaQuery.ts',
  '/hooks/useSpeechRecognition.ts',
  '/hooks/useTheme.ts',
  '/components/LibraryPane.tsx',
  '/components/NotebookPane.tsx',
  '/components/CanvasPane.tsx',
  '/components/PlaygroundPane.tsx',
  '/components/blocks/CodeBlock.tsx',
  '/components/blocks/HeadingBlock.tsx',
  '/components/blocks/ImageBlock.tsx',
  '/components/blocks/PdfBlock.tsx',
  '/components/blocks/TextBlock.tsx',
  '/components/blocks/TodoBlock.tsx',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@^19.1.1',
  'https://esm.sh/react-dom@^19.1.1/client',
  'https://esm.sh/lucide-react@^0.536.0',
  'https://esm.sh/react-syntax-highlighter@^15.6.1',
  'https://esm.sh/react-markdown@^9.0.1'
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened Atelier cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              if (event.request.url.startsWith('https://esm.sh/')) {
                 // For esm.sh, which needs CORS, response type will be 'cors'
                 if (response && response.status === 200 && response.type === 'cors') {
                    // Clone the response and cache it
                    let responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                      .then(cache => {
                        cache.put(event.request, responseToCache);
                      });
                 }
              }
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            let responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});