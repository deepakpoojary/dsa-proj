`requestAnimationFrame(callback)` asks the browser to run your callback **right before the next repaint**, typically 60 times per second (or matching the display's refresh rate, like 120Hz). It's the right tool for animations because it's **synchronized with the screen**, pauses in background tabs, and avoids the jank and wasted work of `setInterval`.

## Basic usage

```js
const box = document.querySelector('.box');
let x = 0;

function step() {
  x += 2;
  box.style.transform = `translateX(${x}px)`;
  if (x < 400) {
    requestAnimationFrame(step); // schedule the next frame
  }
}

requestAnimationFrame(step);
```

- It runs **once** per call, so you re-request inside the callback to keep animating.
- It returns an ID you can pass to `cancelAnimationFrame(id)`.

## Time-based animation (the right way)

Frame rates vary (60Hz, 120Hz, dropped frames), so move things based on **elapsed time**, not frame count. The callback receives a high-resolution timestamp:

```js
const box = document.querySelector('.box');
const duration = 1000;   // ms
const distance = 400;    // px
let start = null;
let rafId;

function animate(timestamp) {
  start ??= timestamp;
  const progress = Math.min((timestamp - start) / duration, 1); // 0 → 1
  box.style.transform = `translateX(${progress * distance}px)`;

  if (progress < 1) {
    rafId = requestAnimationFrame(animate);
  } else {
    console.log('done'); // after ~1000ms, regardless of refresh rate
  }
}

rafId = requestAnimationFrame(animate);

// Stop early if needed:
// cancelAnimationFrame(rafId);
```

## Why not `setInterval`?

```js
// The old approach
setInterval(() => {
  x += 2;
  box.style.transform = `translateX(${x}px)`;
}, 16); // "about 60fps"... hopefully
```

Problems with this:

- **Not synced with repaint**: the timer can fire mid-frame or twice per frame, causing **dropped or doubled frames** (visible stutter/jank).
- **Fixed rate**: wrong for 120Hz/144Hz displays, and wasteful if the browser can't keep up.
- **Keeps running in background tabs** (only throttled to ~1/sec), wasting CPU and battery.
- **Timer drift**: delays are minimums, and callbacks queue behind other tasks.
- **Layout thrashing**: updates aren't batched with the browser's rendering work.

## Comparison

| | `requestAnimationFrame` | `setInterval` / `setTimeout` |
|---|---|---|
| Timing | Right before the next paint | After a minimum delay, whenever the task queue allows |
| Rate | Matches display refresh (60/120/144Hz) | Fixed by you, not synced |
| Background tabs | Paused | Throttled but still running |
| Smoothness | Smooth, no tearing between frames | Prone to jank |
| Timestamp argument | Yes (`DOMHighResTimeStamp`) | No |
| Battery/CPU | Efficient | Wasteful for visuals |
| Use for | Visual updates, animation, canvas/game loops | Non-visual delays, polling, timeouts |

## Other great uses

### Throttling scroll/resize work to once per frame

```js
let scheduled = false;
window.addEventListener('scroll', () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    header.classList.toggle('compact', window.scrollY > 50);
    scheduled = false;
  });
}, { passive: true });
```

### Game / canvas loops

```js
const ctx = canvas.getContext('2d');
let last = performance.now();

function loop(now) {
  const dt = (now - last) / 1000; // seconds since last frame
  last = now;
  update(dt);   // physics scaled by dt
  draw(ctx);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
```

## Tips and pitfalls

- Keep callbacks **short** (well under ~16ms) or frames will drop.
- Animate **`transform` and `opacity`** to avoid reflow; batch DOM reads before writes.
- For simple transitions, **CSS transitions/animations** or the **Web Animations API** (`el.animate()`) are even easier and can run off the main thread.
- rAF callbacks don't run in background tabs, so don't use it for logic that must keep running.
- Not available in Node.js (it's a browser API).

## Summary

- `requestAnimationFrame` runs your code just before each repaint, matched to the display's refresh rate.
- It's smoother and more efficient than `setInterval`: no frame misalignment, and it pauses when the tab is hidden.
- Use the timestamp argument for time-based motion, and `cancelAnimationFrame` to stop.
