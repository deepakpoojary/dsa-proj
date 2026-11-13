Spread and rest use the **same `...` syntax** but do opposite jobs: **spread expands** an iterable or object into individual elements/properties, while **rest collects** multiple elements/arguments into a single array or object. Which one you get depends on *where* the `...` appears.

## Spread operator: expanding

Used in **function calls**, **array literals** and **object literals**.

```js
// 1. Function calls
const nums = [5, 1, 9];
Math.max(...nums); // 9  (same as Math.max(5, 1, 9))

// 2. Array literals (works with any iterable)
const a = [1, 2];
const b = [3, 4];
const merged = [...a, ...b, 5];   // [1, 2, 3, 4, 5]
const copy = [...a];              // shallow copy
const chars = [...'hi'];          // ['h', 'i']
const unique = [...new Set([1, 1, 2])]; // [1, 2]

// 3. Object literals (own enumerable properties)
const defaults = { theme: 'light', lang: 'en' };
const user = { lang: 'fr', name: 'Ann' };
const settings = { ...defaults, ...user };
// { theme: 'light', lang: 'fr', name: 'Ann' }  <- later keys win
```

## Rest operator: collecting

Used in **function parameters** and **destructuring**.

```js
// 1. Rest parameters
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
sum(1, 2, 3, 4); // 10

function log(level, ...messages) {
  console.log(`[${level}]`, ...messages); // rest in, spread out
}
log('INFO', 'Server', 'started'); // [INFO] Server started

// 2. Array destructuring
const [first, ...others] = [10, 20, 30];
// first = 10, others = [20, 30]

// 3. Object destructuring
const { password, ...safeUser } = { id: 1, name: 'Ann', password: 'x' };
// safeUser = { id: 1, name: 'Ann' }
```

## Key differences

| Aspect | Spread | Rest |
| --- | --- | --- |
| Purpose | Expands values out | Gathers values in |
| Where it appears | Function **calls**, array/object **literals** | Function **parameters**, **destructuring** patterns |
| Side of `=` | Right side (values) | Left side (patterns) |
| Position | Anywhere, multiple times | Must be **last**, only once |
| Result | Individual items / properties | An array or object |

## Rest parameters vs `arguments`

Rest parameters produce a **real array**, unlike the old array-like `arguments` object, and they work in arrow functions:

```js
function oldWay() {
  return Array.prototype.slice.call(arguments).map((x) => x * 2);
}
const newWay = (...args) => args.map((x) => x * 2);
newWay(1, 2); // [2, 4]
```

## Common pitfalls

- **Shallow copy only**: nested objects are still shared.

```js
const original = { info: { age: 30 } };
const clone = { ...original };
clone.info.age = 99;
console.log(original.info.age); // 99 (!)
// Use structuredClone(original) for a deep copy
```

- **Rest must be last**:

```js
// const [...rest, last] = arr;     // SyntaxError
// function f(...args, x) {}        // SyntaxError
```

- **Spreading non-iterables into arrays throws**: `[...{ a: 1 }]` is a `TypeError`, but `{ ...null }` and `{ ...undefined }` are fine (they add nothing).
- **Huge arrays in calls**: `Math.max(...hugeArray)` can exceed the argument limit; use `reduce` for very large arrays.

## Summary

- Same `...` syntax: **spread expands**, **rest collects**.
- Spread appears in calls and literals; rest appears in parameters and destructuring and must come last.
- Object/array spread makes **shallow** copies; rest parameters give a real array.
