**Microtasks** and **macrotasks** are two different queues the event loop uses to schedule asynchronous callbacks. The key rule: after each macrotask finishes, the event loop runs **all** pending microtasks before starting the next macrotask or rendering.

## What goes where

| Macrotasks (tasks) | Microtasks |
| --- | --- |
| `setTimeout`, `setInterval` | `Promise.then` / `.catch` / `.finally` callbacks |
| I/O callbacks (network, file system) | Code after `await` in an async function |
| UI events (click, keypress) | `queueMicrotask(fn)` |
| `MessageChannel` / `postMessage` | `MutationObserver` callbacks |
| `setImmediate` (Node) | `process.nextTick` (Node, its own higher-priority queue) |
| The initial script execution | |

## Execution order

1. Run one macrotask (e.g. the main script).
2. Run **every** microtask in the queue, including any new microtasks queued during this step.
3. (Browser) Render if needed.
4. Pick the next macrotask. Repeat.

```js
console.log('script start');                    // sync

setTimeout(() => console.log('setTimeout'), 0); // macrotask

Promise.resolve()
  .then(() => console.log('promise 1'))         // microtask
  .then(() => console.log('promise 2'));        // microtask (queued after promise 1)

queueMicrotask(() => console.log('queueMicrotask')); // microtask

console.log('script end');                      // sync

// script start
// script end
// promise 1
// queueMicrotask
// promise 2
// setTimeout
```

Even though `setTimeout` was scheduled **first** with a 0ms delay, all the microtasks run before it.

## Microtasks scheduled inside macrotasks

```js
setTimeout(() => {
  console.log('timeout 1');
  Promise.resolve().then(() => console.log('micro inside timeout 1'));
}, 0);

setTimeout(() => console.log('timeout 2'), 0);

// timeout 1
// micro inside timeout 1   <- drained before the next macrotask
// timeout 2
```

## With `async`/`await`

Code after `await` is resumed as a microtask.

```js
async function run() {
  console.log('A');
  await null;
  console.log('C'); // microtask
}

setTimeout(() => console.log('D'), 0);
run();
console.log('B');

// A B C D
```

## Danger: microtask starvation

Because the microtask queue is drained completely, a microtask that keeps queueing more microtasks blocks timers, events and rendering forever.

```js
function loop() {
  queueMicrotask(loop); // never yields - page freezes
}
// loop();

function safeLoop() {
  setTimeout(safeLoop, 0); // yields to rendering and events each time
}
```

## Node.js nuance

In Node, `process.nextTick` callbacks run **before** promise microtasks:

```js
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
setTimeout(() => console.log('timeout'), 0);

// nextTick
// promise
// timeout
```

## When to use which

- **Microtask** (`queueMicrotask`, promises): run something "as soon as possible" after the current code, before rendering, e.g. batching state updates or keeping a consistent state.
- **Macrotask** (`setTimeout`, `MessageChannel`): yield to the browser so it can render and handle input, e.g. chunking long-running work.
- **`requestAnimationFrame`**: neither; it runs right before the next paint and is best for visual updates.

## Key differences

| | Microtask | Macrotask |
| --- | --- | --- |
| Priority | Higher | Lower |
| When it runs | After current task, before render | One per loop iteration |
| Queue processing | Entire queue drained | One task at a time |
| Can starve the page | Yes, if recursive | No, rendering happens between |
| Typical sources | Promises, `await`, `queueMicrotask` | Timers, I/O, events |

## Summary

- Macrotasks: timers, I/O, events; one runs per event-loop turn.
- Microtasks: promise callbacks, `await` continuations, `queueMicrotask`; the whole queue drains after each macrotask.
- So a resolved promise's `.then` always runs before a `setTimeout(fn, 0)`, even one scheduled earlier.
