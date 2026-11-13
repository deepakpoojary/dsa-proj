A polyfill re-implements a built-in method so you understand (or supply) its exact behaviour. For `map`, you loop over the array, call the callback with `(element, index, array)` and collect results into a **new array of the same length**. For `reduce`, you carry an **accumulator** through the loop, using the first element as the starting value when no initial value is given.

## Polyfill for `Array.prototype.map`

```js
Array.prototype.myMap = function (cb, thisArg) {
  const out = new Array(this.length);
  for (let i = 0; i < this.length; i++)
    if (i in this) out[i] = cb.call(thisArg, this[i], i, this);
  return out;
};

// Usage
[1, 2, 3].myMap((n) => n * 2);        // [2, 4, 6]
[1, , 3].myMap((n) => n * 10);        // [10, <empty>, 30]  (holes preserved)
['a', 'b'].myMap((x, i) => x + i);    // ['a0', 'b1']
```

### What it handles

- **Callback arguments**: `(element, index, array)`, just like the native method.
- **`thisArg`**: the optional second argument becomes `this` inside the callback, via `cb.call(thisArg, ...)`.
- **Sparse arrays**: `i in this` skips holes, so the output keeps holes in the same positions.
- **Immutability**: writes to a new array; the original isn't changed.

## Polyfill for `Array.prototype.reduce`

```js
Array.prototype.myReduce = function (cb, ...init) {
  if (!this.length && !init.length) throw new TypeError('Reduce of empty array');
  let i = init.length ? 0 : 1, acc = init.length ? init[0] : this[0];
  for (; i < this.length; i++) acc = cb(acc, this[i], i, this);
  return acc;
};

// Usage
[1, 2, 3, 4].myReduce((sum, n) => sum + n, 0);  // 10
[1, 2, 3, 4].myReduce((sum, n) => sum + n);     // 10 (starts with acc = 1, i = 1)
['a', 'b'].myReduce((acc, x) => ({ ...acc, [x]: true }), {}); // { a: true, b: true }
[].myReduce((a, b) => a + b);                   // TypeError: Reduce of empty array
```

### Why `...init` instead of `init`?

You must distinguish "no initial value passed" from "initial value passed as `undefined`". Using a rest parameter and checking `init.length` does this correctly:

```js
[1, 2].reduce((acc, x) => acc, undefined); // undefined — initial value WAS given
```

### Logic step by step

1. If the array is empty and no initial value was supplied, throw a `TypeError` (native behaviour).
2. With an initial value: `acc = init[0]` and start at index `0`.
3. Without one: `acc = this[0]` and start at index `1`.
4. For each element, `acc = cb(acc, element, index, array)`.
5. Return `acc`.

## A more spec-faithful `reduce` (handles holes)

Interviewers may ask about sparse arrays. Native `reduce` skips holes, including when choosing the starting value:

```js
Array.prototype.myReduce2 = function (cb, ...init) {
  if (typeof cb !== 'function') throw new TypeError(cb + ' is not a function');
  const arr = Object(this);
  const len = arr.length >>> 0;
  let i = 0;
  let acc;

  if (init.length) {
    acc = init[0];
  } else {
    while (i < len && !(i in arr)) i++;   // find first existing element
    if (i >= len) throw new TypeError('Reduce of empty array with no initial value');
    acc = arr[i++];
  }

  for (; i < len; i++) {
    if (i in arr) acc = cb(acc, arr[i], i, arr);
  }
  return acc;
};

[, 5, , 10].myReduce2((a, b) => a + b); // 15
```

## Bonus: `filter` follows the same pattern

```js
Array.prototype.myFilter = function (cb, thisArg) {
  const out = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && cb.call(thisArg, this[i], i, this)) out.push(this[i]);
  }
  return out;
};
```

## Edge cases checklist

| Edge case | `map` | `reduce` |
| --- | --- | --- |
| Empty array | Returns `[]` | Throws without initial value |
| Sparse array (holes) | Holes preserved, callback skipped | Holes skipped |
| `thisArg` | Supported | Not supported |
| Non-function callback | Should throw `TypeError` | Should throw `TypeError` |
| Original array | Unchanged | Unchanged |

## Common pitfalls

- **Using an arrow function for the polyfill itself**: `Array.prototype.myMap = (cb) => {...}` breaks because arrows don't get their own `this`. Use a regular `function`.
- **Checking `if (init)`** instead of whether an argument was passed: fails for initial values like `0` or `''`.
- **Pushing into `[]` in `map`**: loses holes and can shift indexes; preallocate with `new Array(this.length)`.
- In real projects, don't modify built-in prototypes with non-standard names in shared code; use a standalone function instead.

## Summary

- `map`: new array of same length, callback gets `(el, i, arr)`, honours `thisArg`, skips holes.
- `reduce`: carry an accumulator; with no initial value start from the first element at index 1; throw `TypeError` on an empty array without one.
- Use a regular `function` so `this` refers to the array.
