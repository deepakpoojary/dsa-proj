**Web Workers** run JavaScript on a **background thread** so heavy computations don't block the main (UI) thread. **Service Workers** are a special kind of worker that sits **between your web app and the network**, acting as a programmable proxy for caching, offline support, and push notifications.

## Web Workers

JavaScript on the main thread is single-threaded: a long-running loop freezes clicks, scrolling and rendering. A Web Worker runs in a separate thread and communicates with the page via **message passing**.

```js
// main.js
const worker = new Worker(new URL('./prime-worker.js', import.meta.url), { type: 'module' });

worker.postMessage({ limit: 5_000_000 });

worker.onmessage = (e) => {
  console.log('Primes found:', e.data); // UI stayed responsive meanwhile
};

worker.onerror = (err) => console.error('Worker error:', err.message);
```

```js
// prime-worker.js
self.onmessage = (e) => {
  const { limit } = e.data;
  let count = 0;
  for (let n = 2; n < limit; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) { isPrime = false; break; }
    if (isPrime) count++;
  }
  self.postMessage(count);
};
```

### Key characteristics

- **No DOM access**: no `document`, `window`; the global is `self`.
- Has `fetch`, `setTimeout`, `IndexedDB`, `WebSocket`, `crypto`, etc.
- Data is **copied** via the structured clone algorithm; large buffers can be **transferred** with zero copy: `worker.postMessage(buf, [buf])`.
- Terminated with `worker.terminate()` or `self.close()`.
- Variants: **Dedicated** (one page), **Shared Workers** (multiple tabs of the same origin).

**Use cases:** image/video processing, parsing large JSON/CSV, compression, cryptography, syntax highlighting, running WASM, data crunching.

## Service Workers

A Service Worker is an **event-driven** worker registered for a scope of your site. It can intercept every network request from pages in that scope and decide how to respond.

```js
// main.js - register (requires HTTPS or localhost)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then((reg) => console.log('SW registered, scope:', reg.scope));
}
```

```js
// sw.js
const CACHE = 'app-v1';
const ASSETS = ['/', '/index.html', '/styles.css', '/app.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  // Remove old caches
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

// Cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached ?? fetch(event.request))
  );
});
```

### Key characteristics

- **Lifecycle**: `install` → `waiting` → `activate` → idle / `fetch` handling. A new version waits until old tabs close (unless `skipWaiting()` / `clients.claim()`).
- Runs **independently of any page**; the browser starts and stops it as needed, so don't rely on global state.
- **HTTPS only** (except localhost).
- No DOM access; communicates with pages via `postMessage` / `clients`.
- Powers **PWAs**: offline mode, caching strategies, background sync, push notifications.

## Web Worker vs Service Worker

| | Web Worker | Service Worker |
|---|---|---|
| Main purpose | Offload CPU-heavy work | Network proxy, offline, push |
| Lifetime | Tied to the page that created it | Independent; can run with no page open |
| Created with | `new Worker(url)` | `navigator.serviceWorker.register(url)` |
| Intercepts requests | No | Yes (`fetch` event) |
| Scope | One page (or shared across tabs) | A URL scope for the whole origin path |
| HTTPS required | No | Yes |
| DOM access | No | No |
| Communication | `postMessage` | `postMessage`, `clients`, events |

## Common pitfalls

- Spinning up a worker has overhead; don't use one for tiny tasks.
- Posting huge objects repeatedly is slow because of cloning; transfer `ArrayBuffer`s instead.
- Service worker caching bugs can serve stale assets for a long time; **version your caches** and handle updates.

## Summary

- **Web Workers**: background threads for heavy computation, keeping the UI responsive.
- **Service Workers**: a persistent network proxy enabling offline support, caching, and push.
- Neither can touch the DOM; both talk to the page through messages.
