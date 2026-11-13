`for...in` loops over an object's **enumerable property keys**, `for...of` loops over the **values of an iterable**, `forEach` is an **array method** that runs a callback for each element and returns nothing, and `map` is an array method that **returns a new array** of transformed values. Choosing the right one depends on whether you need keys or values, early exit, `await`, or a result.

## `for...in` — keys of an object

```js
const user = { name: 'Ann', age: 28 };
for (const key in user) {
  console.log(key, user[key]); // name Ann, age 28
}
```

- Iterates **enumerable string keys**, including **inherited** ones from the prototype chain.
- On arrays it gives indexes as **strings** (`'0'`, `'1'`), may include extra properties, and isn't meant for arrays.

```js
const arr = [10, 20];
arr.extra = 'oops';
for (const i in arr) console.log(i); // '0', '1', 'extra'
```

Prefer `Object.keys/entries(obj)` with `for...of` to avoid inherited keys.

## `for...of` — values of any iterable

```js
for (const n of [10, 20]) console.log(n);           // 10, 20
for (const ch of 'hi') console.log(ch);             // 'h', 'i'
for (const [k, v] of new Map([['a', 1]])) console.log(k, v); // a 1
for (const [k, v] of Object.entries(user)) console.log(k, v); // objects via entries
```

- Works with arrays, strings, `Map`, `Set`, `NodeList`, generators.
- Supports **`break`**, **`continue`**, **`return`**, and **`await`** inside async functions.
- Plain objects aren't iterable: `for (const x of {})` throws `TypeError`.

```js
for (const id of ids) {
  if (id < 0) break;              // early exit works
  const user = await fetchUser(id); // awaits sequentially
}
```

## `forEach` — callback per element, no result

```js
[10, 20].forEach((value, index, array) => {
  console.log(index, value); // 0 10, 1 20
});
```

- Returns **`undefined`** (not chainable).
- **Cannot `break` or `continue`**; `return` only skips the current callback.
- **Doesn't await** async callbacks:

```js
ids.forEach(async (id) => {
  await save(id);
});
console.log('done'); // runs before any save finishes
```

## `map` — transform into a new array

```js
const doubled = [1, 2, 3].map((n) => n * 2); // [2, 4, 6]
```

- Returns a **new array of the same length**; original unchanged.
- Chainable (`.map().filter()`).
- Don't use it just for side effects — that creates and discards an array. Use `forEach` or `for...of` instead.

## Comparison

| Feature | `for...in` | `for...of` | `forEach` | `map` |
| --- | --- | --- | --- | --- |
| Iterates | Keys (strings) | Values | Array elements | Array elements |
| Works on | Objects (incl. inherited keys) | Any iterable | Arrays (and NodeList, Map, Set have their own) | Arrays |
| Returns | — | — | `undefined` | New array |
| `break` / `continue` | Yes | Yes | No | No |
| `await` inside | Yes | Yes (sequential) | No (fires all) | Returns array of Promises |
| Skips array holes | Yes | No (gives `undefined`) | Yes | Yes (keeps hole) |
| Best for | Object keys (rare today) | General looping | Simple side effects | Transforming data |

## Need to stop early?

Use `for...of`, or methods that short-circuit:

```js
const nums = [1, 5, 8, 12];
nums.some((n) => n > 6);   // true — stops at 8
nums.every((n) => n > 0);  // true
nums.find((n) => n > 6);   // 8
nums.findIndex((n) => n > 6); // 2
```

## Async patterns

```js
// Sequential
for (const id of ids) await process(id);

// Parallel
await Promise.all(ids.map((id) => process(id)));
```

## Common pitfalls

- Using `for...in` on arrays: string indexes, inherited/extra properties, no order guarantees in older engines.
- Expecting `forEach` to return a value or wait for async work.
- Using `map` without using its result.

## Summary

- `for...in`: object **keys** (including inherited); avoid for arrays.
- `for...of`: **values** of any iterable; supports `break` and `await`.
- `forEach`: side effects only, no early exit, no awaiting.
- `map`: returns a new transformed array; use it when you need the result.
