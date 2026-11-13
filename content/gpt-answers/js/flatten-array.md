The built-in way to flatten a nested array is **`arr.flat(depth)`** — use `arr.flat(Infinity)` to flatten completely. To implement it yourself, walk the array and **recursively** flatten any element that is itself an array, or use an **explicit stack** to do it iteratively.

## Built-in: `flat()` and `flatMap()`

```js
const nested = [1, [2, [3, [4]]], 5];

nested.flat();          // [1, 2, [3, [4]], 5]   (default depth = 1)
nested.flat(2);         // [1, 2, 3, [4], 5]
nested.flat(Infinity);  // [1, 2, 3, 4, 5]

[1, , 3].flat();        // [1, 3] — holes are removed

// flatMap = map then flat(1)
['a b', 'c'].flatMap((s) => s.split(' ')); // ['a', 'b', 'c']
```

## Implementation 1: recursion with `reduce` (supports depth)

```js
function flatten(arr, depth = Infinity) {
  return depth > 0
    ? arr.reduce((acc, x) =>
        acc.concat(Array.isArray(x) ? flatten(x, depth - 1) : [x]), [])
    : arr.slice();
}
flatten([1, [2, [3, [4]]]]); // [1, 2, 3, 4]
flatten([1, [2, [3, [4]]]], 1); // [1, 2, [3, [4]]]
```

How it works:

- If `depth` is used up, return a shallow copy as-is.
- Otherwise, for each element: if it's an array, flatten it with `depth - 1`; if not, wrap it in `[x]` so `concat` adds it as one item.

`concat` creates a new array each step, so for very large inputs a `push`-based version is faster:

```js
function flattenFast(arr, depth = Infinity, out = []) {
  for (const x of arr) {
    if (Array.isArray(x) && depth > 0) flattenFast(x, depth - 1, out);
    else out.push(x);
  }
  return out;
}
flattenFast([1, [2, [3, [4]]], 5]); // [1, 2, 3, 4, 5]
```

## Implementation 2: iterative with a stack

Recursion can hit "Maximum call stack size exceeded" for extremely deep nesting. A stack avoids that:

```js
function flattenIterative(arr) {
  const stack = [...arr];
  const result = [];

  while (stack.length) {
    const item = stack.pop();
    if (Array.isArray(item)) {
      stack.push(...item);     // unpack and process later
    } else {
      result.push(item);
    }
  }
  return result.reverse();     // we popped from the end, so reverse
}

flattenIterative([1, [2, [3, [4]]], 5]); // [1, 2, 3, 4, 5]
```

## Implementation 3: generator (lazy)

```js
function* flattenGen(arr) {
  for (const x of arr) {
    if (Array.isArray(x)) yield* flattenGen(x);
    else yield x;
  }
}
[...flattenGen([1, [2, [3]], 4])]; // [1, 2, 3, 4]
```

## Quick hacks (and why to avoid them)

```js
[1, [2, [3]]].toString().split(',').map(Number); // [1, 2, 3]
```

This only works for numbers: strings with commas break, and every value is converted to a string.

## Comparison

| Approach | Depth control | Deep nesting safe | Notes |
| --- | --- | --- | --- |
| `arr.flat(depth)` | Yes | Yes | Best in production; removes holes |
| Recursive `reduce` + `concat` | Yes | Limited by call stack | Concise, interview favourite |
| Recursive `push` | Yes | Limited by call stack | Faster, fewer allocations |
| Iterative stack | Full only (as written) | Yes | No recursion |
| Generator | Full | Limited by call stack | Lazy, memory-friendly |

## Follow-up: flatten a nested object

A common follow-up is turning a nested object into dotted keys:

```js
function flattenObject(obj, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenObject(value, path, out);
    } else {
      out[path] = value;
    }
  }
  return out;
}

flattenObject({ a: { b: { c: 1 } }, d: 2 });
// { 'a.b.c': 1, d: 2 }
```

## Summary

- Use `arr.flat(Infinity)` in real code; `flatMap` for map-then-flatten-one-level.
- Implement recursively (check `Array.isArray`, recurse with `depth - 1`) or iteratively with a stack to avoid recursion limits.
- Be ready for the "flatten an object into dotted keys" follow-up.
