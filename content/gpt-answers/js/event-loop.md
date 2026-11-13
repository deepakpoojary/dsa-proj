The **event loop** is the mechanism that lets single-threaded JavaScript handle asynchronous work: it continuously checks whether the call stack is empty and, if so, takes the next queued callback (task) and runs it, always draining the **microtask queue** before moving on.

## The building blocks

- **Call stack**: where JavaScript executes functions, one at a time. JS has a single main thread, so only one piece of code runs at once.
- **Host APIs**: the browser (Web APIs) or Node.js (libuv) handle timers, network requests, file I/O and events *outside* the JS thread.
- **Task (macrotask) queue**: callbacks from `setTimeout`, `setInterval`, I/O, UI events, `MessageChannel`.
- **Microtask queue**: promise callbacks (`.then`, `.catch`, `.finally`, code after `await`), `queueMicrotask`, `MutationObserver`.

## How the loop works

1. Run the current script (itself a task) until the call stack is empty.
2. **Drain the entire microtask queue**, including microtasks added while draining.
3. In browsers, **render** if needed (style, layout, paint; `requestAnimationFrame` callbacks run just before this).
4. Take the **next macrotask** from the queue and run it.
5. Repeat from step 2.

## Classic example

```js
console.log('A');

setTimeout(() => console.log('B'), 0);

Promise.resolve().then(() => console.log('C'));

console.log('D');

// Output: A D C B
```

Why?

- `A` and `D` are synchronous, so they run immediately on the call stack.
- `setTimeout` hands its callback to the timer API, which queues it as a **macrotask**.
- `.then` queues its callback as a **microtask**.
- After the script finishes, microtasks run first (`C`), then the next macrotask (`B`).

## A more detailed example

```js
console.log('1: script start');

setTimeout(() => {
  console.log('5: timeout');
  Promise.resolve().then(() => console.log('6: microtask inside timeout'));
}, 0);

Promise.resolve()
  .then(() => console.log('3: promise 1'))
  .then(() => console.log('4: promise 2'));

queueMicrotask(() => console.log('3b: queueMicrotask'));

console.log('2: script end');

// 1: script start
// 2: script end
// 3: promise 1
// 3b: queueMicrotask
// 4: promise 2
// 5: timeout
// 6: microtask inside timeout
```

`promise 2` is queued only when `promise 1` finishes, so it lands after `queueMicrotask`. And the microtask created inside the timeout runs before any further macrotask.

## Why blocking is bad

Since there's only one thread, long synchronous work blocks **everything**: other callbacks, user input, and rendering.

```js
button.addEventListener('click', () => {
  const end = Date.now() + 3000;
  while (Date.now() < end) {} // UI frozen for 3 seconds
});
```

Fixes: split work into chunks (`setTimeout`, `scheduler.yield()` where supported), or move it to a **Web Worker** / Node **worker thread**.

## `setTimeout(fn, 0)` isn't "immediately"

The delay is a **minimum**. The callback only runs after the current code finishes, all microtasks drain, and any earlier tasks run. Browsers also clamp nested timers to at least ~4ms.

## Node.js specifics

Node's event loop (libuv) runs in **phases**:

| Phase | What runs |
| --- | --- |
| timers | `setTimeout` / `setInterval` callbacks |
| pending callbacks | Some deferred system callbacks |
| poll | Retrieve new I/O events; run I/O callbacks |
| check | `setImmediate` callbacks |
| close callbacks | `socket.on('close')`, etc. |

Between callbacks, Node drains `process.nextTick` callbacks **first**, then promise microtasks.

```js
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));

// nextTick
// promise
// timeout / immediate (order of these two can vary in the main module;
// inside an I/O callback, immediate always runs first)
```

## Summary

- JavaScript runs on one thread; the event loop schedules queued callbacks when the call stack is empty.
- Order per cycle: one macrotask, then **all** microtasks, then (browser) render, then repeat.
- Promises beat `setTimeout(fn, 0)`; long synchronous work blocks everything; Node adds phases, `process.nextTick` and `setImmediate`.
