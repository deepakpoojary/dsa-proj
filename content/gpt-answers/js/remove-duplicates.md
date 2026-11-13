The simplest and fastest way to remove duplicates from an array of primitives is to convert it to a **`Set`** (which only stores unique values) and spread it back into an array: `[...new Set(arr)]`. For arrays of objects, deduplicate by a key using a `Map` or a `Set` of seen keys.

## 1. Using `Set` (recommended for primitives)

```js
const nums = [1, 2, 2, 3, 3, 3];
const unique = [...new Set(nums)];
console.log(unique); // [1, 2, 3]

// Equivalent
Array.from(new Set(nums)); // [1, 2, 3]

[...new Set([1, 2, 2, 3, NaN, NaN])]; // [1, 2, 3, NaN]
[...new Set('mississippi')].join(''); // 'misp'
```

- **Time complexity: O(n)**.
- Preserves the **order of first occurrence**.
- Uses **SameValueZero** equality: `NaN` equals `NaN`, `0` equals `-0`, and objects compare by **reference**.

## 2. Using `filter` + `indexOf`

Keeps an element only if its first index equals the current index:

```js
const unique = nums.filter((x, i) => nums.indexOf(x) === i);
// [1, 2, 3]
```

- Works without `Set`, but is **O(n²)** because `indexOf` scans the array each time.
- **Drops `NaN` entirely**, because `indexOf(NaN)` is always `-1`.

## 3. Using `reduce` / a loop with a `Set` of seen values

Useful when you need custom logic while deduplicating:

```js
function uniq(arr) {
  const seen = new Set();
  const result = [];
  for (const x of arr) {
    if (!seen.has(x)) {
      seen.add(x);
      result.push(x);
    }
  }
  return result;
}
uniq([3, 1, 3, 2, 1]); // [3, 1, 2]
```

## 4. Removing duplicate objects by a key

`Set` won't help directly because two objects with the same content are different references:

```js
const users = [
  { id: 1, name: 'Ann' },
  { id: 2, name: 'Bob' },
  { id: 1, name: 'Ann (updated)' },
];

[...new Set(users)].length; // 3 — no change, different references
```

### Keep the last occurrence (Map)

```js
const byId = [...new Map(users.map((u) => [u.id, u])).values()];
// [{ id: 1, name: 'Ann (updated)' }, { id: 2, name: 'Bob' }]
```

The `Map` keeps each key in its **first-insertion position** but overwrites the value, so you get the *last* object for each id.

### Keep the first occurrence (Set of seen keys)

```js
const seen = new Set();
const firstById = users.filter((u) => !seen.has(u.id) && seen.add(u.id));
// [{ id: 1, name: 'Ann' }, { id: 2, name: 'Bob' }]
```

(`seen.add()` returns the Set, which is truthy, so the filter keeps the item.)

### Deduplicate by multiple fields or full content

```js
const key = (o) => `${o.firstName}|${o.lastName}`;
// or, for simple flat objects with consistent key order:
const contentKey = (o) => JSON.stringify(o);
```

## Comparison

| Method | Time | Handles `NaN` | Objects by value | Notes |
| --- | --- | --- | --- | --- |
| `[...new Set(arr)]` | O(n) | Yes | No (reference) | Cleanest for primitives |
| `filter` + `indexOf` | O(n²) | No (drops it) | No | Classic interview answer |
| Loop + `Set` of seen | O(n) | Yes | Yes, with a key function | Most flexible |
| `Map` by key | O(n) | Yes | Yes | Keeps last occurrence |

## Bonus: find only the duplicates

```js
const arr = [1, 2, 2, 3, 3, 3, 4];
const dupes = [...new Set(arr.filter((x, i) => arr.indexOf(x) !== i))];
// [2, 3]
```

## Common pitfalls

- `Set` treats `1` and `'1'` as different values.
- `JSON.stringify` as a key fails if property order differs (`{a:1,b:2}` vs `{b:2,a:1}`).
- Sorting first and comparing neighbours works but changes order and costs O(n log n).

## Summary

- Primitives: `[...new Set(arr)]` — O(n), order-preserving, handles `NaN`.
- Objects: dedupe by a key with a `Map` (keeps last) or a `Set` of seen keys (keeps first).
- `filter` + `indexOf` works but is O(n²) and drops `NaN`.
