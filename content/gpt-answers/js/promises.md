A **Promise** is an object that represents the **eventual result of an asynchronous operation**: a placeholder for a value that isn't available yet, which will either be fulfilled with a value or rejected with an error.

## Promise states

A promise is always in one of three states:

| State | Meaning |
| --- | --- |
| `pending` | Initial state; the operation hasn't finished |
| `fulfilled` | Completed successfully with a **value** |
| `rejected` | Failed with a **reason** (usually an `Error`) |

Once a promise is **settled** (fulfilled or rejected), its state and value never change.

## Creating a promise

```js
const wait = (ms) =>
  new Promise((resolve, reject) => {
    if (ms < 0) {
      reject(new RangeError('ms must be >= 0'));
      return;
    }
    setTimeout(() => resolve(`waited ${ms}ms`), ms);
  });
```

The function passed to `new Promise` is the **executor**. It runs **synchronously**, immediately.

```js
console.log('before');
new Promise(() => console.log('executor runs now'));
console.log('after');
// before
// executor runs now
// after
```

## Consuming a promise

```js
wait(500)
  .then((msg) => console.log(msg))          // "waited 500ms"
  .catch((err) => console.error(err))       // handles rejections
  .finally(() => console.log('cleanup'));    // runs either way
```

- `.then(onFulfilled, onRejected)` registers handlers.
- `.catch(fn)` is shorthand for `.then(undefined, fn)`.
- `.finally(fn)` runs on both outcomes, receives no argument, and passes the original result through.

Callbacks always run **asynchronously** as microtasks, even if the promise is already resolved:

```js
Promise.resolve(1).then((v) => console.log('then', v));
console.log('sync');
// sync
// then 1
```

## Chaining

Every `.then` returns a **new promise**, so you can chain steps. Returning a value passes it on; returning a promise waits for it; throwing turns into a rejection.

```js
fetch('/api/user')
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();                       // returns a promise, chain waits
  })
  .then((user) => fetch(`/api/posts?user=${user.id}`))
  .then((res) => res.json())
  .then((posts) => console.log(posts.length))
  .catch((err) => console.error('Failed:', err.message)); // catches any step
```

## Why promises? (vs callbacks)

```js
// Callback hell
getUser(id, (err, user) => {
  if (err) return handle(err);
  getPosts(user, (err, posts) => {
    if (err) return handle(err);
    getComments(posts[0], (err, comments) => { /* ... */ });
  });
});

// Promises: flat chain, one error handler
getUser(id)
  .then(getPosts)
  .then((posts) => getComments(posts[0]))
  .catch(handle);
```

Benefits:

- **Flat, readable chains** instead of nesting.
- **Centralised error handling** with `.catch`.
- **Trust**: a promise settles only once, so callbacks can't be called twice (fixes inversion of control).
- **Composable** with `Promise.all`, `allSettled`, `race`, `any`.
- Foundation for **`async`/`await`**.

## Useful static methods

```js
Promise.resolve(42);            // already-fulfilled promise
Promise.reject(new Error('x')); // already-rejected promise
Promise.all([p1, p2]);          // all must fulfill
Promise.allSettled([p1, p2]);   // wait for all, never rejects
Promise.race([p1, p2]);         // first to settle
Promise.any([p1, p2]);          // first to fulfill

// ES2024: create a promise and control it from outside
const { promise, resolve, reject } = Promise.withResolvers();
setTimeout(() => resolve('done'), 100);
await promise; // "done"
```

## Common pitfalls

- **Forgetting to return** inside `.then`, which breaks the chain (next step gets `undefined` and doesn't wait).
- **Missing `.catch`**, which leads to unhandled rejections (Node crashes the process by default).
- **Wrapping an existing promise in `new Promise`** unnecessarily (the "explicit construction anti-pattern").
- Promises are **eager**: the work starts when you create them, not when you call `.then`.

## Summary

- A Promise is a placeholder for a future value: `pending`, then `fulfilled` or `rejected`, and it settles only once.
- Use `.then`/`.catch`/`.finally` (or `async`/`await`) to consume it; handlers always run asynchronously as microtasks.
- `.then` returns a new promise, enabling flat chains with centralised error handling.
