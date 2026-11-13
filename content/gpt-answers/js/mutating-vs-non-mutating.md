The array methods that **mutate** (change the original array in place) are `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill` and `copyWithin`. Most others — `map`, `filter`, `slice`, `concat`, `reduce`, and the ES2023 methods `toSorted`, `toReversed`, `toSpliced` and `with` — **return a new value** and leave the original untouched.

## Mutating methods

```js
const arr = [3, 1, 2];

arr.push(4);        // returns new length 4  -> arr = [3, 1, 2, 4]
arr.pop();          // returns 4             -> arr = [3, 1, 2]
arr.unshift(0);     // returns new length 4  -> arr = [0, 3, 1, 2]
arr.shift();        // returns 0             -> arr = [3, 1, 2]
arr.sort();         // returns arr itself    -> arr = [1, 2, 3]
arr.reverse();      // returns arr itself    -> arr = [3, 2, 1]
arr.splice(1, 1);   // returns [2] (removed) -> arr = [3, 1]
arr.fill(0);        // returns arr itself    -> arr = [0, 0]

const nums = [1, 2, 3, 4, 5];
nums.copyWithin(0, 3); // [4, 5, 3, 4, 5]
```

| Method | What it does | Returns |
| --- | --- | --- |
| `push` / `unshift` | Add to end / start | New length |
| `pop` / `shift` | Remove from end / start | Removed element |
| `splice(start, count, ...items)` | Remove/insert/replace in place | Array of removed items |
| `sort(compareFn)` | Sort in place | The same array |
| `reverse()` | Reverse in place | The same array |
| `fill(value, start, end)` | Overwrite a range | The same array |
| `copyWithin(target, start, end)` | Copy part of the array over itself | The same array |

Note: `sort` and `reverse` return the **same reference**, which misleads people into thinking they made a copy.

## Non-mutating methods

```js
const base = [1, 2, 3];

base.map((x) => x * 2);     // [2, 4, 6]
base.filter((x) => x > 1);  // [2, 3]
base.slice(0, 2);           // [1, 2]
base.concat([4]);           // [1, 2, 3, 4]
[1, [2, [3]]].flat();       // [1, 2, [3]]
base.reduce((a, b) => a + b, 0); // 6
base.find((x) => x > 1);    // 2
base.includes(2);           // true
base.join('-');             // '1-2-3'

console.log(base);          // [1, 2, 3] — unchanged
```

Others: `flatMap`, `some`, `every`, `indexOf`, `findIndex`, `findLast`, `at`, `entries`, `keys`, `values`, `forEach` (doesn't mutate by itself, though your callback could).

## ES2023 "change array by copy" methods

Non-mutating versions of the classic mutators:

```js
const scores = [30, 10, 20];

scores.toSorted((a, b) => a - b); // [10, 20, 30]
scores.toReversed();              // [20, 10, 30]
scores.toSpliced(1, 1);           // [30, 20]
scores.with(0, 99);               // [99, 10, 20]

console.log(scores);              // [30, 10, 20] — unchanged
```

| Mutating | Non-mutating equivalent |
| --- | --- |
| `sort()` | `toSorted()` |
| `reverse()` | `toReversed()` |
| `splice()` | `toSpliced()` |
| `arr[i] = value` | `arr.with(i, value)` |
| `push(x)` | `[...arr, x]` or `arr.concat(x)` |
| `unshift(x)` | `[x, ...arr]` |
| `pop()` | `arr.slice(0, -1)` |
| `shift()` | `arr.slice(1)` |

## `slice` vs `splice`

A classic interview question:

```js
const letters = ['a', 'b', 'c', 'd'];

letters.slice(1, 3);     // ['b', 'c'] — copy, letters unchanged

letters.splice(1, 2);    // ['b', 'c'] — removed, letters is now ['a', 'd']
letters.splice(1, 0, 'x'); // [] — inserted, letters is now ['a', 'x', 'd']
```

## Why it matters

In **React**, **Redux** and other state libraries, change detection relies on **reference equality**. Mutating state in place keeps the same reference, so the UI may not re-render:

```js
// Bug: same array reference, React may skip re-render
items.push(newItem);
setItems(items);

// Correct: new array
setItems([...items, newItem]);
setItems((prev) => prev.toSorted((a, b) => a.price - b.price));
```

Mutation also causes bugs when an array is shared between functions:

```js
function getSorted(list) {
  return list.sort(); // surprise: also sorts the caller's array
}
// Fix: return list.toSorted();  or  [...list].sort();
```

## Common pitfalls

- Spreading or `slice` creates a **shallow** copy: nested objects are still shared, so mutating `copy[0].name` changes the original's object too.
- `const` doesn't prevent mutation: `const arr = []; arr.push(1)` is allowed.
- Use `Object.freeze(arr)` to make accidental mutations throw (in strict mode) during development.

## Summary

- **Mutating**: `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`, `copyWithin`.
- **Non-mutating**: `map`, `filter`, `slice`, `concat`, `flat`, `reduce`, `find`, `includes`, `join`, etc.
- Prefer ES2023 `toSorted`, `toReversed`, `toSpliced` and `with` (or spread) when you need immutability, especially for React/Redux state.
