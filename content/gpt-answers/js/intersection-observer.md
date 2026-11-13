`IntersectionObserver` is a browser API that **asynchronously tells you when an element enters or leaves the viewport** (or another scrollable ancestor), and by how much. It replaces expensive `scroll` event listeners combined with `getBoundingClientRect()` calls.

## Why it exists

The old way to detect visibility:

```js
// Old approach: runs on every scroll event, forces layout each time
window.addEventListener('scroll', () => {
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight) loadImage(el);
});
```

This fires dozens of times per second on the main thread and causes forced reflows. `IntersectionObserver` lets the browser do the calculation efficiently and only notifies you when visibility actually changes.

## Basic usage

```js
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    console.log(entry.target.id, entry.isIntersecting, entry.intersectionRatio);
    // e.g. "hero true 0.75"
  });
}, {
  root: null,          // null = the viewport
  rootMargin: '0px',   // grow/shrink the root box, like CSS margin
  threshold: 0.5,      // fire when 50% visible (can be an array: [0, 0.25, 0.5, 1])
});

observer.observe(document.querySelector('#hero'));

// Later
observer.unobserve(el);  // stop watching one element
observer.disconnect();   // stop watching everything
```

### Useful `entry` properties

- **`isIntersecting`**: whether the target is currently visible (per threshold)
- **`intersectionRatio`**: fraction visible, 0 to 1
- **`target`**: the observed element
- **`boundingClientRect`**, **`intersectionRect`**, **`rootBounds`**: geometry
- **`time`**: timestamp of the change

## Common use cases

### 1. Lazy-loading images

```js
const lazyObserver = new IntersectionObserver((entries, obs) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const img = entry.target;
    img.src = img.dataset.src;   // swap in the real image
    obs.unobserve(img);          // load once, then stop observing
  }
}, { rootMargin: '200px' });     // start loading 200px before it's visible

document.querySelectorAll('img[data-src]').forEach((img) => lazyObserver.observe(img));
```

(For plain images, native `<img loading="lazy">` is often enough; the observer gives you more control.)

### 2. Infinite scroll

```js
const sentinel = document.querySelector('#load-more-sentinel');

new IntersectionObserver(async ([entry]) => {
  if (entry.isIntersecting) {
    const items = await fetch(`/api/items?page=${++page}`).then((r) => r.json());
    renderItems(items);
  }
}).observe(sentinel);
```

### 3. Scroll-triggered animations

```js
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => e.target.classList.toggle('visible', e.isIntersecting));
}, { threshold: 0.2 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
```

### 4. Other uses

- **Ad / analytics impression tracking** ("was this seen for at least 50%?")
- **Pausing videos** or animations when off-screen
- **Highlighting the active section** in a table of contents
- **Sticky header** detection with a sentinel element

## IntersectionObserver vs scroll listener

| | Scroll + `getBoundingClientRect` | `IntersectionObserver` |
|---|---|---|
| Runs on | Every scroll event | Only when intersection changes |
| Forces layout | Yes | No |
| Throttling needed | Usually | No |
| Works inside iframes / custom scroll containers | Manual work | Built in (`root` option) |
| Code complexity | Higher | Lower |

## Pitfalls

- The callback fires **once immediately** after `observe()` with the initial state, so always check `isIntersecting`.
- It's **asynchronous**, not pixel-perfect for every frame; not suited to precise scroll-linked animations (use CSS scroll-driven animations or `requestAnimationFrame`).
- `rootMargin` only works on the root as-is; with `root: null` inside a cross-origin iframe it is ignored.
- Remember to `unobserve` / `disconnect` to avoid leaks in SPAs.

## Summary

- `IntersectionObserver` efficiently reports when elements become visible or hidden.
- Ideal for lazy loading, infinite scroll, reveal animations, and impression tracking.
- It replaces costly scroll handlers with browser-optimized, asynchronous callbacks.
