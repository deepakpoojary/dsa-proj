`globalThis` is a standard property, introduced in **ES2020**, that gives you a reliable way to access the **global object** in any JavaScript environment — browsers, Node.js, Web Workers, Deno, and others.

## The problem it solves

Before `globalThis`, the global object had a different name in each environment:

| Environment | Global object name |
| --- | --- |
| Browser (main thread) | `window` (also `self`, `frames`) |
| Web Worker / Service Worker | `self` |
| Node.js | `global` |
| Deno / Bun | `globalThis` (also `window` in older Deno) |

Universal code had to use awkward detection logic:

```js
// The old way
const getGlobal = function () {
  if (typeof self !== 'undefined') return self;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  throw new Error('Unable to locate global object');
};
```

Even `Function('return this')()` was used, but it breaks under Content Security Policy rules that forbid `eval`-like code.

## The modern way

```js
globalThis.setTimeout === setTimeout; // true everywhere

// Browser
globalThis === window;  // true

// Node.js
globalThis === global;  // true

// Web Worker
globalThis === self;    // true
```

## Common uses

### Feature detection

```js
if (typeof globalThis.fetch === 'function') {
  // fetch is available (browsers, Node 18+)
}

const isBrowser = typeof globalThis.document !== 'undefined';
```

### Polyfills

```js
if (!globalThis.structuredClone) {
  globalThis.structuredClone = (value) => JSON.parse(JSON.stringify(value));
}
```

### Sharing a singleton across module reloads

```js
// Common in Next.js dev mode to avoid creating multiple DB clients
const globalForDb = globalThis;
export const db = globalForDb.db ?? createDbClient();
if (process.env.NODE_ENV !== 'production') globalForDb.db = db;
```

## What becomes a global property?

In a **classic (non-module) script**, top-level `var` and function declarations become properties of the global object. `let`, `const` and `class` create global *bindings* but not properties:

```js
var a = 1;
let b = 2;
function c() {}

globalThis.a; // 1
globalThis.b; // undefined
globalThis.c; // [Function: c]
```

In **ES modules** (and Node.js CommonJS files), top-level declarations are scoped to the module and **never** become global properties:

```js
// app.mjs
var x = 10;
console.log(globalThis.x); // undefined
```

## `globalThis` vs `this` at the top level

Top-level `this` varies by context, so it's not a reliable substitute:

| Context | Top-level `this` |
| --- | --- |
| Browser classic script | `window` |
| ES module | `undefined` |
| Node.js CommonJS | `module.exports` (`{}`) |

`globalThis` is consistent in all of them.

## Best practices

- Prefer `globalThis` over `window`/`global` in code meant to run in multiple environments (libraries, SSR, isomorphic apps).
- Avoid storing app state on the global object — it causes naming collisions and hidden dependencies. Use modules instead.
- In the browser, `globalThis` actually returns a `WindowProxy`, which behaves like `window` for all practical purposes.

## Summary

- `globalThis` (ES2020) is the universal, standard reference to the global object.
- It equals `window` in browsers, `global` in Node.js and `self` in workers.
- Use it for cross-environment feature detection and polyfills; avoid using globals for app state.
