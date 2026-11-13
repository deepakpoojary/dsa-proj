`Promise.all` takes an iterable of values or promises and returns a single promise that **fulfills with an array of all results (in input order)** once every item fulfills, or **rejects immediately** with the first rejection reason. Here's how to implement it from scratch.

## Requirements

Before writing code, list the behaviors to match:

1. Return a **new promise**.
2. Accept any **iterable** (arrays, Sets, generators), not just arrays.
3. Accept **non-promise values** (`42` is treated as `Promise.resolve(42)`).
4. Results must be in **input order**, not completion order.
5. Resolve when **all** items have fulfilled.
6. Reject as soon as **any** item rejects (fail-fast).
7. An **empty** input resolves immediately with `[]`.

## Implementation

```js
function promiseAll(items) {
  return new Promise((resolve, reject) => {
    const list = [...items], out = [];
    let done = 0;
    if (!list.length) return resolve(out);
    list.forEach((p, i) => Promise.resolve(p).then((v) => {
      out[i] = v;
      if (++done === list.length) resolve(out);
    }, reject));
  });
}
```

### How it works

- `[...items]` converts any iterable into an array so we know the total count.
- `Promise.resolve(p)` normalises plain values and thenables into real promises.
- `out[i] = v` stores each result **by index**, so order is preserved even if later items finish first.
- A `done` **counter** tracks how many have fulfilled. We can't use `out.length`, because setting `out[2]` first makes the length 3 while slots 0 and 1 are still empty.
- Passing `reject` as the second argument to `.then` means the first rejection rejects the outer promise. Later rejections or resolutions are ignored, because a promise can settle only once.

## Testing it

```js
const delay = (ms, value, fail = false) =>
  new Promise((res, rej) => setTimeout(() => (fail ? rej(new Error(value)) : res(value)), ms));

// 1. Order is preserved
promiseAll([delay(300, 'A'), delay(100, 'B'), 'C']).then(console.log);
// ['A', 'B', 'C'] (after ~300ms)

// 2. Fail-fast
promiseAll([delay(300, 'A'), delay(100, 'boom', true)])
  .catch((err) => console.log('Rejected:', err.message));
// Rejected: boom (after ~100ms)

// 3. Empty input
promiseAll([]).then(console.log); // []

// 4. Any iterable
promiseAll(new Set([1, Promise.resolve(2)])).then(console.log); // [1, 2]
```

## A version with `for...of` (no array copy)

This variant iterates the iterable directly and counts as it goes:

```js
function promiseAll2(iterable) {
  return new Promise((resolve, reject) => {
    const results = [];
    let index = 0;
    let remaining = 0;

    for (const item of iterable) {
      const i = index++;
      remaining++;
      Promise.resolve(item).then(
        (value) => {
          results[i] = value;
          if (--remaining === 0) resolve(results);
        },
        reject
      );
    }

    if (index === 0) resolve(results); // empty iterable
  });
}
```

This is safe because `.then` callbacks always run asynchronously, so the loop finishes counting before any callback can decrement `remaining` to zero.

## Common mistakes in interviews

| Mistake | Problem |
| --- | --- |
| Using `results.push(value)` | Results end up in completion order |
| Checking `results.length === n` | Sparse arrays make length wrong |
| Not handling empty input | Promise never resolves |
| Not wrapping with `Promise.resolve` | Breaks on plain values |
| Using `async`/`await` in a loop | Runs sequentially, and doesn't fail fast |
| Forgetting to reject | Errors silently swallowed |

## Bonus: `allSettled` in the same style

```js
function promiseAllSettled(items) {
  return promiseAll(
    [...items].map((p) =>
      Promise.resolve(p).then(
        (value) => ({ status: 'fulfilled', value }),
        (reason) => ({ status: 'rejected', reason })
      )
    )
  );
}
```

## Summary

- Return a new promise, wrap each item with `Promise.resolve`, and store results by index.
- Resolve when a counter reaches the input length; reject on the first rejection.
- Handle the empty-input case by resolving with `[]` immediately.
