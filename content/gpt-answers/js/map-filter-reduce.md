`map`, `filter` and `reduce` are higher-order array methods that process an array with a callback **without mutating it**. **`map`** transforms every element into a new array of the same length, **`filter`** keeps only elements that pass a test, and **`reduce`** combines all elements into a single value.

## `map()` — transform each element

Returns a **new array of the same length**, where each element is the callback's return value.

```js
const nums = [1, 2, 3];
const doubled = nums.map((n) => n * 2);
console.log(doubled); // [2, 4, 6]
console.log(nums);    // [1, 2, 3] (unchanged)

const users = [{ name: 'Ann', age: 28 }, { name: 'Bob', age: 17 }];
const names = users.map((u) => u.name); // ['Ann', 'Bob']
```

Callback signature: `(element, index, array)`.

## `filter()` — keep matching elements

Returns a **new array** containing only elements for which the callback returns a truthy value. The result can be shorter (or empty).

```js
const adults = users.filter((u) => u.age >= 18);
console.log(adults); // [{ name: 'Ann', age: 28 }]

const values = [0, 'a', '', null, 5];
values.filter(Boolean); // ['a', 5] — removes falsy values
```

## `reduce()` — fold into a single value

Calls the callback with an **accumulator** and the current element, carrying the accumulator forward. The result can be anything: a number, string, object, array, Map.

```js
// Sum
[1, 2, 3, 4].reduce((sum, n) => sum + n, 0); // 10

// Count occurrences
const fruits = ['apple', 'banana', 'apple'];
const counts = fruits.reduce((acc, f) => {
  acc[f] = (acc[f] ?? 0) + 1;
  return acc;
}, {});
// { apple: 2, banana: 1 }

// Max value
[3, 9, 2].reduce((max, n) => (n > max ? n : max), -Infinity); // 9
```

Callback signature: `(accumulator, element, index, array)`, plus an optional **initial value** as the second argument.

## Chaining them together

```js
const orders = [{ amt: 50, paid: true }, { amt: 20, paid: false }, { amt: 30, paid: true }];
const total = orders
  .filter((o) => o.paid)
  .map((o) => o.amt)
  .reduce((sum, n) => sum + n, 0); // 80
```

1. `filter` → the two paid orders
2. `map` → `[50, 30]`
3. `reduce` → `80`

## Comparison

| Method | Returns | Length of result | Typical use |
| --- | --- | --- | --- |
| `map` | New array | Same as input | Transform each item |
| `filter` | New array | Same or fewer | Select items |
| `reduce` | Any single value | N/A | Sum, group, count, build objects |

None of the three mutate the original array, and all of them **skip holes** in sparse arrays.

## Common pitfalls

- **Forgetting to return** in a block-bodied callback:

```js
[1, 2].map((n) => { n * 2; });  // [undefined, undefined]
[1, 2].map((n) => n * 2);       // [2, 4]
```

- **Omitting `reduce`'s initial value**: on an empty array it throws, and with objects it can give wrong results.

```js
[].reduce((a, b) => a + b);     // TypeError: Reduce of empty array with no initial value
[].reduce((a, b) => a + b, 0);  // 0
```

- **`map` with `parseInt`**: `['1', '2', '3'].map(parseInt)` gives `[1, NaN, NaN]` because the index is passed as the radix. Use `map(Number)` or an arrow.
- **Using `map` for side effects** (logging, pushing elsewhere): use `forEach` or `for...of` instead.
- **Async callbacks**: `map(async ...)` returns an array of Promises — wrap it in `Promise.all`. `filter` and `reduce` don't await at all.
- **Performance on huge arrays**: each chained method creates an intermediate array. For very large data, a single `for` loop or one `reduce` can be faster.

## Modern alternatives

For grouping, `Object.groupBy` (ES2024) is often clearer than `reduce`:

```js
Object.groupBy(users, (u) => (u.age >= 18 ? 'adult' : 'minor'));
// { adult: [{ name: 'Ann', ... }], minor: [{ name: 'Bob', ... }] }
```

## Summary

- `map` transforms every element (same length), `filter` selects elements, `reduce` combines them into one value.
- All three return new values and don't mutate the original.
- Always return from callbacks and always pass an initial value to `reduce`.
