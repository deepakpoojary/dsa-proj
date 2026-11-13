All four take an iterable of promises and return a single promise, but they differ in **when they settle** and **how they treat rejections**: `all` needs every promise to succeed, `allSettled` waits for every outcome, `race` follows the first to settle, and `any` follows the first to succeed.

## Quick comparison

| Method | Fulfills when | Rejects when | Result |
| --- | --- | --- | --- |
| `Promise.all` | **All** fulfill | **Any one** rejects (fail-fast) | Array of values |
| `Promise.allSettled` | **All** settle (either way) | Never | Array of `{ status, value }` / `{ status, reason }` |
| `Promise.race` | First to settle is fulfilled | First to settle is rejected | Value or reason of the first settled |
| `Promise.any` | **First** to fulfill | **All** reject | Value, or `AggregateError` |

Setup for the examples:

```js
const delay = (ms, value, fail = false) =>
  new Promise((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error(value)) : resolve(value)), ms)
  );
```

## `Promise.all`

Waits for all promises to fulfill. If any rejects, it rejects immediately with that reason.

```js
const values = await Promise.all([
  delay(300, 'A'),
  delay(100, 'B'),
  42,               // non-promise values are allowed
]);
console.log(values); // ['A', 'B', 42] - input order, not completion order

try {
  await Promise.all([delay(300, 'A'), delay(100, 'oops', true)]);
} catch (err) {
  console.log(err.message); // "oops" (after ~100ms)
}
```

**Use when** you need every result and one failure makes the whole operation meaningless (e.g. loading all data for a page).

## `Promise.allSettled`

Waits for every promise to settle and never rejects. Each result describes its outcome.

```js
const results = await Promise.allSettled([
  delay(100, 'A'),
  delay(200, 'bad', true),
]);

console.log(results);
// [
//   { status: 'fulfilled', value: 'A' },
//   { status: 'rejected', reason: Error: bad }
// ]

const ok = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
```

**Use when** tasks are independent and you want to handle successes and failures individually (e.g. sending a batch of notifications, uploading multiple files).

## `Promise.race`

Settles as soon as the **first** promise settles, whether it fulfilled or rejected.

```js
const winner = await Promise.race([delay(300, 'slow'), delay(100, 'fast')]);
console.log(winner); // "fast"
```

Classic use case: a **timeout**.

```js
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

await withTimeout(fetch('/api/slow'), 2000);
```

(For `fetch`, `AbortSignal.timeout(ms)` is a cleaner option that actually cancels the request.)

## `Promise.any`

Fulfills with the **first successful** result, ignoring rejections. Rejects only if **all** fail, with an `AggregateError` containing every reason.

```js
const fastest = await Promise.any([
  delay(100, 'mirror-1 down', true),
  delay(200, 'mirror-2'),
  delay(300, 'mirror-3'),
]);
console.log(fastest); // "mirror-2"

try {
  await Promise.any([delay(100, 'x', true), delay(200, 'y', true)]);
} catch (err) {
  console.log(err instanceof AggregateError);    // true
  console.log(err.errors.map((e) => e.message)); // ['x', 'y']
}
```

**Use when** you have redundant sources (CDN mirrors, multiple APIs) and just need one that works.

## Empty input edge cases

```js
await Promise.all([]);        // []
await Promise.allSettled([]); // []
await Promise.any([]);        // rejects with AggregateError
Promise.race([]);             // stays pending forever
```

## Important notes

- **None of them cancel** the other promises. When `all` rejects or `race` settles, the remaining operations keep running. Use `AbortController` if you need real cancellation.
- Results from `all` and `allSettled` are in **input order**, regardless of which finished first.
- Non-promise values are wrapped with `Promise.resolve`.

## Summary

- `all`: every result or fail fast. `allSettled`: every outcome, never rejects.
- `race`: first to settle (good for timeouts). `any`: first to succeed, `AggregateError` if all fail.
- None of them cancel pending work, and ordered results follow input order.
