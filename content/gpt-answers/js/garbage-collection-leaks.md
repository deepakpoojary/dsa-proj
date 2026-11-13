JavaScript manages memory **automatically**: the engine allocates memory when you create values and a **garbage collector (GC)** frees memory that is no longer **reachable** from the program. A **memory leak** happens when memory you no longer need is still reachable, usually because something forgot to let go of a reference, so the GC can never reclaim it.

## How garbage collection works

### Reachability

The GC starts from a set of **roots** and follows every reference:

- The global object (`window` / `globalThis`)
- The current call stack (local variables and parameters)
- Active closures, timers, event listeners, pending promises

Anything that can be reached from a root is **alive**; everything else is **garbage**.

```js
let user = { name: 'Asha' }; // object reachable via `user`
let admin = user;            // two references

user = null;                 // still reachable via `admin`
admin = null;                // now unreachable → eligible for GC
```

### Mark-and-sweep

Modern engines (V8, SpiderMonkey, JavaScriptCore) use **mark-and-sweep** variants:

1. **Mark**: traverse from the roots and mark everything reachable.
2. **Sweep**: free everything unmarked.
3. Optionally **compact** memory to reduce fragmentation.

Unlike old **reference counting**, mark-and-sweep handles **circular references** correctly:

```js
function makeCycle() {
  const a = {};
  const b = {};
  a.ref = b;
  b.ref = a; // cycle
}
makeCycle(); // after return, a and b are unreachable → both collected
```

### Generational and incremental GC (V8)

- **Young generation** (minor GC / "Scavenger"): new objects; most die young, so this is collected often and quickly.
- **Old generation** (major GC / Mark-Compact): objects that survive several collections.
- Collection is **incremental, concurrent and parallel** to reduce main-thread pauses.

You can't trigger GC manually in normal code (Node's `--expose-gc` flag is for debugging only).

## Common causes of memory leaks

### 1. Accidental globals

```js
function track() {
  leaked = new Array(1e6); // no let/const → becomes a global (non-strict mode)
}
// Fix: use strict mode / modules and always declare variables.
```

### 2. Forgotten timers and intervals

```js
const data = loadHugeData();
const id = setInterval(() => {
  console.log(data.length); // closure keeps `data` alive forever
}, 1000);
// Fix: clearInterval(id) when no longer needed
```

### 3. Event listeners not removed

```js
function mountWidget(el) {
  const bigCache = new Array(1e6).fill('*');
  const onResize = () => console.log(bigCache.length);
  window.addEventListener('resize', onResize);

  // Fix: return a cleanup function and call it on unmount
  return () => window.removeEventListener('resize', onResize);
}

// Or use AbortController to remove many listeners at once
const controller = new AbortController();
window.addEventListener('scroll', handler, { signal: controller.signal });
controller.abort(); // removes the listener
```

### 4. Detached DOM nodes

```js
const cache = [];
const el = document.querySelector('#modal');
cache.push(el);
el.remove(); // removed from the page, but still referenced by `cache` → not collected
```

### 5. Closures holding large data

```js
function createHandler() {
  const hugeBuffer = new ArrayBuffer(50 * 1024 * 1024);
  return () => hugeBuffer.byteLength; // the returned function keeps 50MB alive
}
```

### 6. Unbounded caches and collections

Maps, arrays or memoization caches that only grow. Use size limits / LRU, or `WeakMap` / `WeakRef` when keys are objects.

```js
const meta = new WeakMap();
let node = document.createElement('div');
meta.set(node, { clicks: 0 });
node = null; // entry can be collected automatically
```

## Detecting leaks

- **Chrome DevTools → Memory**: take heap snapshots before/after an action and compare; look for "Detached" DOM trees.
- **Performance monitor**: watch JS heap size climb without dropping.
- **Node.js**: `process.memoryUsage()`, `--inspect` with DevTools, `--heapsnapshot-signal`.
- `FinalizationRegistry` can observe collection, but don't rely on its timing for logic.

## Summary

| Leak source | Fix |
|---|---|
| Accidental globals | Strict mode, `let`/`const` |
| Timers | `clearInterval` / `clearTimeout` |
| Event listeners | `removeEventListener` or `AbortController` |
| Detached DOM | Drop references after removing nodes |
| Closures | Don't capture large data unnecessarily |
| Growing caches | Bounded caches, `WeakMap`, `WeakRef` |

- JS uses **reachability-based mark-and-sweep** GC, which handles cycles.
- Leaks come from **unintended references** that keep objects reachable.
- Clean up listeners, timers and caches, and verify with heap snapshots.
