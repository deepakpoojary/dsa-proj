You cancel a `fetch` request with an **`AbortController`**: pass its `signal` to `fetch`, then call `controller.abort()` when you want to cancel. For timeouts, the simplest option is **`AbortSignal.timeout(ms)`**, which creates a signal that aborts automatically.

## Basic cancellation

```js
const ctrl = new AbortController();

fetch('/api', { signal: ctrl.signal })
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((e) => {
    if (e.name === 'AbortError') console.log('cancelled');
    else throw e;
  });

ctrl.abort(); // Output: cancelled
```

When aborted, the `fetch` promise rejects with a `DOMException` whose `name` is **`'AbortError'`**. Aborting also stops reading the response body if it has already started.

## Adding a timeout

### Modern way: `AbortSignal.timeout`

```js
try {
  const res = await fetch('/api', { signal: AbortSignal.timeout(5000) });
  const data = await res.json();
} catch (e) {
  if (e.name === 'TimeoutError') console.log('Request took longer than 5s');
  else if (e.name === 'AbortError') console.log('Request was cancelled');
  else throw e; // network error, etc.
}
```

Note the error name is **`'TimeoutError'`**, not `'AbortError'`, which lets you tell the two cases apart.

### Manual timeout (older environments)

```js
async function fetchWithTimeout(url, ms, options = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(timer); // always clean up
  }
}
```

### Cancel manually *and* time out: `AbortSignal.any`

```js
const userCtrl = new AbortController();

const signal = AbortSignal.any([
  userCtrl.signal,            // user clicks "Cancel"
  AbortSignal.timeout(8000),  // or 8 seconds pass
]);

fetch('/api/report', { signal });
cancelButton.onclick = () => userCtrl.abort();
```

## Real-world use: avoiding race conditions

In search-as-you-type, older slow responses can overwrite newer ones. Cancel the previous request on each keystroke:

```js
let current;

input.addEventListener('input', async (e) => {
  current?.abort();                 // cancel the stale request
  current = new AbortController();
  try {
    const res = await fetch(`/search?q=${encodeURIComponent(e.target.value)}`, {
      signal: current.signal,
    });
    render(await res.json());
  } catch (err) {
    if (err.name !== 'AbortError') console.error(err);
  }
});
```

In React, abort in the `useEffect` cleanup:

```js
useEffect(() => {
  const ctrl = new AbortController();
  fetch(`/api/user/${id}`, { signal: ctrl.signal })
    .then((r) => r.json())
    .then(setUser)
    .catch((e) => e.name !== 'AbortError' && setError(e));
  return () => ctrl.abort(); // runs on unmount or when id changes
}, [id]);
```

## Signals beyond fetch

`AbortSignal` is a general cancellation primitive:

```js
const ctrl = new AbortController();

// Remove several listeners at once
window.addEventListener('resize', onResize, { signal: ctrl.signal });
window.addEventListener('scroll', onScroll, { signal: ctrl.signal });
ctrl.abort(); // both listeners removed

// Node.js APIs accept it too
import { setTimeout as sleep } from 'node:timers/promises';
await sleep(1000, null, { signal: ctrl.signal });
```

You can also pass a reason: `ctrl.abort(new Error('User left'))`, available as `signal.reason`.

## Key APIs

| API | Purpose | Error name |
| --- | --- | --- |
| `new AbortController()` + `abort()` | Manual cancel | `AbortError` |
| `AbortSignal.timeout(ms)` | Auto-abort after a delay | `TimeoutError` |
| `AbortSignal.any([...])` | Abort when any signal aborts | Depends on source |
| `signal.throwIfAborted()` | Check inside your own async code | Signal's reason |

## Common pitfalls

- A controller can only abort **once**; create a new one per request.
- Aborting doesn't undo server-side work — the request may already have been processed.
- Always distinguish `AbortError` from real errors so you don't show error UI on intentional cancels.

## Summary

- Cancel with `AbortController`: pass `signal` to `fetch`, call `abort()`.
- Time out with `AbortSignal.timeout(ms)`; combine with `AbortSignal.any`.
- Use it to cancel stale requests and clean up on unmount.
