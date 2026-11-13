`async`/`await` is syntax built on top of **promises** that lets you write asynchronous code that reads like synchronous code. An `async` function always returns a promise, and `await` pauses that function until a promise settles, without blocking the main thread.

## The basics

```js
async function getUser(id) {
  const res = await fetch(`/api/users/${id}`); // pause until fetch resolves
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const user = await res.json();                // pause until JSON is parsed
  return user;                                  // wrapped in a promise
}

getUser(1).then((user) => console.log(user.name));
```

The equivalent promise chain:

```js
function getUser(id) {
  return fetch(`/api/users/${id}`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    });
}
```

## Rules of `async` functions

- They **always return a promise**.
  - `return value` gives a promise fulfilled with `value`.
  - `throw error` gives a promise rejected with `error`.

```js
async function one() { return 1; }
async function fail() { throw new Error('boom'); }

console.log(one());                 // Promise { 1 }
one().then(console.log);            // 1
fail().catch((e) => console.log(e.message)); // "boom"
```

## How `await` works under the hood

`await expr`:

1. Converts `expr` to a promise (like `Promise.resolve(expr)`).
2. **Suspends** the async function and returns control to the caller.
3. When the promise settles, the rest of the function is resumed as a **microtask**, with the fulfilled value (or the rejection thrown at the `await` line).

```js
async function demo() {
  console.log('2: inside, before await');
  await null;
  console.log('4: after await (microtask)');
}

console.log('1: start');
demo();
console.log('3: end of script');

// 1: start
// 2: inside, before await
// 3: end of script
// 4: after await (microtask)
```

Only the async function pauses; the rest of the program keeps running.

## Error handling

Use `try/catch/finally` exactly like synchronous code:

```js
async function loadDashboard() {
  try {
    const user = await getUser(1);
    const stats = await getStats(user.id);
    return { user, stats };
  } catch (err) {
    console.error('Failed to load dashboard:', err.message);
    return null;
  } finally {
    hideSpinner();
  }
}
```

## Sequential vs parallel

A common performance mistake is awaiting independent operations one by one.

```js
// Sequential: ~2s total if each takes 1s
const a = await fetchA();
const b = await fetchB();

// Parallel: ~1s total
const [a2, b2] = await Promise.all([fetchA(), fetchB()]);
```

## Loops

```js
// Sequential processing (each waits for the previous)
for (const id of ids) {
  const user = await getUser(id);
  console.log(user.name);
}

// forEach does NOT wait for async callbacks
ids.forEach(async (id) => {
  await getUser(id); // fires all at once; forEach returns immediately
});

// Parallel with results
const users = await Promise.all(ids.map((id) => getUser(id)));
```

## Top-level `await`

In ES modules (`.mjs`, `type="module"`, modern bundlers), you can use `await` at the top level:

```js
// config.mjs
const res = await fetch('/config.json');
export const config = await res.json();
```

## `async`/`await` vs `.then()`

| | `async`/`await` | `.then()` chains |
| --- | --- | --- |
| Readability | Linear, sync-like | Nested callbacks per step |
| Error handling | `try/catch` | `.catch()` |
| Debugging | Better stack traces, easy breakpoints | Harder to step through |
| Parallelism | Needs `Promise.all` explicitly | Same |
| Underlying mechanism | Promises | Promises |

## Common pitfalls

- **Forgetting `await`**: you get a pending promise instead of the value, and errors escape your `try/catch`.
- **`return` vs `return await` in `try`**: `return promise` inside `try` won't let `catch` handle its rejection; `return await promise` will.
- **Unnecessary serialisation** of independent work.
- **Using `await` in a non-async function** is a `SyntaxError` (except at module top level).

## Summary

- `async` functions always return promises; `await` pauses only that function until a promise settles.
- Execution resumes as a microtask; errors are handled with plain `try/catch`.
- Use `Promise.all` for independent tasks, and remember `forEach` doesn't await.
