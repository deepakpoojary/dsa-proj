**Memoization** is an optimization technique where a function **caches its results** based on its arguments, so repeated calls with the same inputs return the stored result instead of recomputing it. It trades memory for speed and only works correctly for **pure functions** (same input → same output, no side effects).

## How it works

1. When the function is called, build a **cache key** from the arguments.
2. If the key exists in the cache, return the cached value.
3. Otherwise, compute the result, store it under the key, and return it.

## Implementing `memoize`

```js
function memoize(fn, resolver = (...args) => JSON.stringify(args)) {
  const cache = new Map();

  function memoized(...args) {
    const key = resolver(...args);
    if (cache.has(key)) {
      return cache.get(key);           // cache hit
    }
    const result = fn.apply(this, args); // cache miss: compute
    cache.set(key, result);
    return result;
  }

  memoized.cache = cache;              // expose for clearing/inspection
  return memoized;
}
```

Why these choices:

- **`Map`** instead of a plain object avoids prototype key collisions (`"constructor"`, `"__proto__"`) and supports any key type.
- **`cache.has()`** instead of a truthy check so results like `0`, `''` or `undefined` are cached too.
- **`resolver`** lets callers define a custom key (the default `JSON.stringify` is fine for primitives and plain data).
- **`fn.apply(this, args)`** preserves `this` for methods.

## Example: expensive computation

```js
const slowSquare = (n) => {
  for (let i = 0; i < 1e8; i++) {} // simulate heavy work
  return n * n;
};

const fastSquare = memoize(slowSquare);

console.time('first');
console.log(fastSquare(9)); // 81
console.timeEnd('first');   // first: ~60ms

console.time('second');
console.log(fastSquare(9)); // 81
console.timeEnd('second');  // second: ~0.05ms (from cache)
```

## Example: recursive Fibonacci

Naive Fibonacci is **O(2ⁿ)** because it recomputes the same subproblems. Memoizing makes it **O(n)**:

```js
const fib = memoize((n) => (n <= 1 ? n : fib(n - 1) + fib(n - 2)));

console.log(fib(50)); // 12586269025 (instant)
// Without memoization, fib(50) would take minutes.
```

Note the recursive calls go through the memoized `fib`, so intermediate results are cached as well. This is the same idea as **top-down dynamic programming**.

## Single-argument version with object keys

For functions taking one object argument, a `WeakMap` caches by reference and lets the garbage collector free entries:

```js
function memoizeByRef(fn) {
  const cache = new WeakMap();
  return (obj) => {
    if (!cache.has(obj)) cache.set(obj, fn(obj));
    return cache.get(obj);
  };
}

const getTotal = memoizeByRef((cart) => cart.items.reduce((s, i) => s + i.price, 0));
const cart = { items: [{ price: 10 }, { price: 5 }] };
getTotal(cart); // 15 (computed)
getTotal(cart); // 15 (cached)
```

## When to use memoization

- Expensive **pure** calculations called repeatedly with the same inputs
- Recursive problems with overlapping subproblems (Fibonacci, grid paths, edit distance)
- Derived data in UIs (React's `useMemo`, `React.memo`, Reselect selectors)
- Caching promise results of identical API requests (deduplication)

## Pitfalls

- **Impure functions**: memoizing something that depends on time, randomness or external state returns stale results.
- **Unbounded memory growth**: the cache never shrinks; use an **LRU** cache or size limit for long-running apps.
- **Key generation cost**: `JSON.stringify` on large objects can be slower than the computation itself; it also ignores key order differences and can't handle functions, `undefined`, or circular references.
- **Reference vs value**: two equal-looking objects are different keys with `WeakMap`/reference caching.
- **Cheap functions**: memoizing `a + b` just adds overhead.

## Summary

- Memoization caches function results by arguments so repeat calls are instant.
- Implement with a closure over a `Map`, a key from the arguments, and `has`/`get`/`set`.
- Use it for pure, expensive, frequently repeated work, and watch memory usage and key costs.
