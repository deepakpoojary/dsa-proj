The results are `[1, NaN, NaN]`, `11`, `[1]`, and `3`. Each line shows a classic array quirk: `map` passing extra arguments to `parseInt`, assigning beyond the end creating a **sparse array**, the writable `length` property truncating the array, and trailing commas in array literals.

## The snippet

```js
['1', '2', '3'].map(parseInt); // [1, NaN, NaN]
const a = [1, 2, 3];
a[10] = 4;
a.length;       // 11
a.length = 1;
a;              // [1]
[,,,].length;   // 3
```

## 1. `['1', '2', '3'].map(parseInt)` → `[1, NaN, NaN]`

`map` calls its callback with **three arguments**: `(element, index, array)`. `parseInt` takes **two**: `(string, radix)`. So the index is silently used as the radix:

| Call | Radix meaning | Result |
|---|---|---|
| `parseInt('1', 0)` | `0` means "auto-detect", treated as base 10 | `1` |
| `parseInt('2', 1)` | Radix `1` is invalid (must be 2–36) | `NaN` |
| `parseInt('3', 2)` | Base 2 only allows digits `0` and `1`; `'3'` is invalid | `NaN` |

Fix it by controlling the arguments:

```js
['1', '2', '3'].map(Number);              // [1, 2, 3]
['1', '2', '3'].map((s) => parseInt(s, 10)); // [1, 2, 3]
['10', '10', '10'].map(parseInt);         // [10, NaN, 2]  (another classic)
```

## 2. `a[10] = 4; a.length` → `11`

```js
const a = [1, 2, 3];
a[10] = 4;
console.log(a.length); // 11
console.log(a);        // [1, 2, 3, <7 empty items>, 4]
```

An array's `length` is always **highest index + 1**. Assigning to index `10` creates a **sparse array** with **holes** at indexes 3–9. Holes are not `undefined` values; they're missing properties:

```js
console.log(a[5]);     // undefined (reading a hole)
console.log(5 in a);   // false (no property there)
a.forEach((v) => console.log(v)); // 1, 2, 3, 4 (holes are skipped)
```

Note `const` doesn't prevent this: `const` only stops reassigning the variable, not mutating the array.

## 3. `a.length = 1; a` → `[1]`

`length` is **writable**. Setting it smaller **truncates** the array and deletes all elements at index ≥ the new length:

```js
a.length = 1;
console.log(a);    // [1]
a.length = 0;      // common way to clear an array in place
console.log(a);    // []

a.length = 3;      // making it longer adds holes, not values
console.log(a);    // [ <3 empty items> ]
```

## 4. `[,,,].length` → `3`

In an array literal, a **single trailing comma is ignored**. `[,,,]` contains three commas: the first two each create a hole, and the last is a trailing comma. That's **3 holes**, so length `3`.

```js
[,].length;     // 1
[1, 2, 3,].length; // 3 (trailing comma ignored)
[1, , 3].length;   // 3 (hole in the middle)
```

## Final output

```js
// [1, NaN, NaN]
// 11
// [1]
// 3
```

## Holes vs `undefined` cheat sheet

| Method | Behavior on holes |
|---|---|
| `forEach`, `map`, `filter`, `reduce`, `some`, `every` | Skip holes (`map` keeps them in the result) |
| `for...of`, spread `[...]`, `Array.from` | Treat holes as `undefined` |
| `join`, `toString` | Treat holes as empty strings |
| `Object.keys` | Omits hole indexes |
| `find`, `findIndex`, `includes`, `at` | Treat holes as `undefined` |
| `toSorted`, `toReversed`, `with` (ES2023) | Turn holes into `undefined` |

## Summary

- `map(parseInt)` breaks because `map`'s index becomes `parseInt`'s radix; use `map(Number)`.
- Writing past the end creates holes and sets `length` to highest index + 1.
- Shrinking `length` truncates the array in place.
- One trailing comma is ignored, so `[,,,]` has length 3.
