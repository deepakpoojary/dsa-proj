To run async tasks **sequentially**, `await` each one inside a `for...of` loop so each starts only after the previous one finishes. To run them **in parallel**, start them all at once and then `await Promise.all(...)` (or `Promise.allSettled`) on the resulting promises.

## Sequential execution

Use this when each task depends on the previous result, or when you must not hit a resource with many requests at once.

```js
async function loadSequential(ids) {
  const results = [];
  for (const id of ids) {
    // each fetch waits for the previous one to finish
    results.push(await fetchUser(id));
  }
  return results;
}
// 3 tasks x 1s each => ~3s total
```

**Total time = sum of all task durations.**

## Parallel execution

Start every promise first, then wait for all of them together.

```js
async function loadParallel(ids) {
  // map() starts all requests immediately
  const users = await Promise.all(ids.map(fetchUser));
  return users; // results keep the same order as ids
}
// 3 tasks x 1s each => ~1s total
```

**Total time = duration of the slowest task.**

`Promise.all` rejects as soon as any promise rejects. If you want every result regardless of failures, use `Promise.allSettled`:

```js
const results = await Promise.allSettled(ids.map(fetchUser));
results.forEach((r) => {
  if (r.status === 'fulfilled') console.log(r.value);
  else console.error(r.reason);
});
```

## Limited concurrency (the middle ground)

Firing 1,000 requests at once can overwhelm an API or trigger rate limits. A small pool processes N at a time:

```js
async function mapWithLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;            // claim an index
      results[i] = await fn(items[i]);
    }
  }

  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

const users = await mapWithLimit(ids, 5, fetchUser); // at most 5 in flight
```

In production, libraries like `p-limit` do the same thing.

## Common pitfalls

- **`forEach` with async callbacks** does not wait. It fires everything in parallel and returns immediately:

```js
ids.forEach(async (id) => {
  await fetchUser(id);
});
console.log('done'); // logs BEFORE any fetch finishes
```

- **Accidental serialisation**: awaiting independent calls one after another wastes time.

```js
// Slow: ~2s
const user = await getUser();
const posts = await getPosts();

// Fast: ~1s
const [user2, posts2] = await Promise.all([getUser(), getPosts()]);
```

- **Unhandled rejections**: if you start promises early and await them later one by one, a rejection in a later promise may be reported as unhandled before you reach it. Prefer `Promise.all`.

## Comparison

| Approach | Total time | Fails fast? | Use when |
| --- | --- | --- | --- |
| `for...of` + `await` | Sum of tasks | Yes, stops at first error | Tasks depend on each other / order matters |
| `Promise.all` | Slowest task | Yes | Independent tasks, all must succeed |
| `Promise.allSettled` | Slowest task | No | Independent tasks, partial success is fine |
| Concurrency pool | Between the two | Configurable | Many tasks, rate limits |

## Summary

- **Sequential**: `for...of` with `await` — simple, ordered, slower.
- **Parallel**: `Promise.all(items.map(fn))` — fastest for independent work.
- **Throttled**: a pool or `p-limit` when you have many tasks.
- Never use `forEach` with `async` callbacks if you need to wait for them.
