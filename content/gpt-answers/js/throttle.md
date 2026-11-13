**Throttling** limits a function so it runs **at most once every N milliseconds**, no matter how often it's triggered. Unlike debouncing, which waits for activity to stop, throttling keeps firing at a **steady rate during** continuous activity.

## Typical use cases

- **Scroll handlers** (progress bars, sticky headers, infinite scroll checks)
- **Mouse move / drag** tracking
- **Window resize** when you want live updates
- **Rate-limiting** API calls or button clicks (e.g. a "fire" button in a game)

## Basic implementation (timestamp-based)

```js
function throttle(fn, interval = 200) {
  let lastTime = 0;

  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
```

This runs immediately on the first call (**leading edge**) and ignores calls until `interval` has passed. Downside: the **last** call in a burst may be dropped, so the final state (e.g. final scroll position) can be missed.

## Better implementation: leading + trailing

```js
function throttle(fn, interval = 200) {
  let lastTime = 0;
  let timerId = null;
  let lastArgs, lastThis;

  return function throttled(...args) {
    const now = Date.now();
    const remaining = interval - (now - lastTime);
    lastArgs = args;
    lastThis = this;

    if (remaining <= 0) {
      // Enough time passed: run now
      clearTimeout(timerId);
      timerId = null;
      lastTime = now;
      fn.apply(lastThis, lastArgs);
    } else if (!timerId) {
      // Schedule one trailing call with the latest arguments
      timerId = setTimeout(() => {
        lastTime = Date.now();
        timerId = null;
        fn.apply(lastThis, lastArgs);
      }, remaining);
    }
  };
}
```

## Example

```js
const onScroll = throttle(() => {
  const pct = (window.scrollY / (document.body.scrollHeight - innerHeight)) * 100;
  console.log(`Scrolled ${pct.toFixed(0)}%`);
}, 100);

window.addEventListener('scroll', onScroll, { passive: true });
// Scrolling for 1 second fires ~10 logs instead of ~60+
```

## Throttle vs debounce

Imagine events firing continuously for 1 second, with a 300 ms setting:

```
Events:    ||||||||||||||||||||||||||||||||||        (stop)
Throttle:  X         X         X         X           → runs every 300ms during activity
Debounce:                                      X     → runs once, 300ms after the last event
```

```js
const throttled = throttle((i) => console.log('throttle', i), 300);
const debounced = debounce((i) => console.log('debounce', i), 300);

let i = 0;
const id = setInterval(() => {
  throttled(i); debounced(i); i++;
  if (i === 10) clearInterval(id); // 10 calls, 100ms apart
}, 100);

// throttle 0
// throttle 2   ← roughly every 300ms while calls keep coming
// throttle 5     (exact indices vary slightly with timer jitter)
// throttle 8
// throttle 9   ← trailing call carries the latest argument
// debounce 9   ← once, 300ms after calls stop
```

| | Throttle | Debounce |
|---|---|---|
| Rule | At most once per interval | Only after N ms of silence |
| Runs during continuous activity? | Yes, periodically | No |
| Number of calls for a long burst | ~ duration / interval | 1 |
| Uses latest arguments | With trailing edge | Yes |
| Best for | Scroll, mousemove, drag, resize with live feedback | Search input, auto-save, validation, resize-end |
| Mental model | "Speed limit" | "Wait until they stop talking" |

## Alternatives and tips

- For visual updates tied to scrolling or animation, **`requestAnimationFrame`** is often a better throttle: it syncs with the display's refresh rate.

```js
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateHeader(window.scrollY);
    ticking = false;
  });
});
```

- For visibility detection, use **`IntersectionObserver`** instead of a throttled scroll listener.
- In production, `lodash.throttle` / `lodash.debounce` handle edge cases (`cancel`, `flush`, `maxWait`).
- Create the throttled function **once**, not on every render.

## Summary

- Throttle guarantees a function runs **no more than once per interval**, giving regular updates during activity.
- Debounce waits until activity **stops** and runs once.
- Use throttle for scroll/drag/mousemove; debounce for typing, auto-save and "after the user finishes" actions.
