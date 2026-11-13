Because `Array.prototype.sort()` with no comparator **converts every element to a string** and sorts them by UTF-16 code unit order. As strings, `"10"` comes before `"9"` (since `"1"` < `"9"`), so you get `[1, 10, 9]` instead of a numeric sort.

## What actually happens

```js
[10, 9, 1].sort();
// Step 1: compare as strings → "10", "9", "1"
// Step 2: lexicographic order → "1" < "10" < "9"
// Result:
// [1, 10, 9]
```

The comparison is character by character, exactly like words in a dictionary:

- `"1"` vs `"10"` → `"1"` is a prefix of `"10"`, so it comes first.
- `"10"` vs `"9"` → first characters `"1"` (code 49) vs `"9"` (code 57) → `"10"` wins.

The elements stay numbers in the result; only the *comparison* uses their string form.

## The fix: pass a comparator

A comparator `(a, b) => number` returns:

- a **negative** number if `a` should come before `b`
- a **positive** number if `a` should come after `b`
- **0** if they are equal (order kept, since sort is stable)

```js
const nums = [10, 9, 1, 100, 25];

nums.sort((a, b) => a - b); // ascending
console.log(nums);          // [1, 9, 10, 25, 100]

nums.sort((a, b) => b - a); // descending
console.log(nums);          // [100, 25, 10, 9, 1]
```

### Sorting objects by a numeric field

```js
const users = [
  { name: 'Asha', age: 31 },
  { name: 'Ben', age: 9 },
  { name: 'Chen', age: 22 },
];

users.sort((a, b) => a.age - b.age);
// [{ Ben, 9 }, { Chen, 22 }, { Asha, 31 }]
```

### Sorting strings properly

The default sort is code-unit based, so uppercase letters sort before lowercase and accents behave oddly. Use `localeCompare` or `Intl.Collator`:

```js
['banana', 'Apple', 'cherry'].sort();
// ['Apple', 'banana', 'cherry']  (works here by luck: 'A' < 'b')

['b', 'B', 'a', 'A'].sort();
// ['A', 'B', 'a', 'b']  (all uppercase first)

['b', 'B', 'a', 'A'].sort((a, b) => a.localeCompare(b));
// ['a', 'A', 'b', 'B']

// Natural ordering of strings containing numbers:
const collator = new Intl.Collator(undefined, { numeric: true });
['file10', 'file9', 'file1'].sort(collator.compare);
// ['file1', 'file9', 'file10']
```

## Other `sort` gotchas

| Behavior | Detail |
|---|---|
| Mutates in place | `sort()` reorders the original array and returns the same reference |
| Stable | Guaranteed stable since ES2019 (equal items keep their relative order) |
| `undefined` handling | `undefined` values are always moved to the end, and the comparator is never called with them |
| Non-copying version | `toSorted()` (ES2023) returns a new sorted array |
| Bad comparators | Returning a boolean (`a > b`) is wrong; it never returns a negative number |

```js
const original = [3, 1, 2];
const sorted = original.toSorted((a, b) => a - b);
console.log(sorted);   // [1, 2, 3]
console.log(original); // [3, 1, 2]  (unchanged)

[3, undefined, 1].sort((a, b) => a - b);
// [1, 3, undefined]

// Anti-pattern: boolean comparator
[3, 1, 2].sort((a, b) => a > b); // unreliable, don't do this
```

## Summary

- `sort()` without arguments compares elements **as strings**, so `10` sorts before `9`.
- For numbers, always pass `(a, b) => a - b` (or `b - a` for descending).
- Use `localeCompare` / `Intl.Collator` for human-friendly string sorting.
- `sort` mutates; use `toSorted` when you need a copy.
