Since ES2022, JavaScript has added many practical features: better array access and immutable array methods, class private fields, top-level `await`, grouping utilities, new Promise helpers, Set operations and iterator helpers. Here are the ones most worth knowing, grouped by year.

## ES2022

```js
// .at() — negative indexing
[1, 2, 3].at(-1);              // 3
'hello'.at(-1);                // 'o'

// Object.hasOwn — safer than obj.hasOwnProperty
Object.hasOwn({ a: 1 }, 'a');  // true

// Class fields, private members and static blocks
class Counter {
  #count = 0;                  // private field
  static instances = 0;        // static field
  static { /* static init block */ }
  #log() { console.log(this.#count); } // private method
  inc() { this.#count++; this.#log(); }
  static isCounter(o) { return #count in o; } // ergonomic brand check
}

// Top-level await (in ES modules)
const config = await fetch('/config.json').then((r) => r.json());

// Error cause
try {
  await saveUser();
} catch (err) {
  throw new Error('Failed to save user', { cause: err });
}

// RegExp match indices: /d flag
/b/d.exec('abc').indices[0];   // [1, 2]
```

## ES2023

Non-mutating ("change array by copy") methods — great for React/Redux state:

```js
const nums = [3, 1, 2];

nums.toSorted();               // [1, 2, 3]  (nums unchanged)
nums.toReversed();             // [2, 1, 3]
nums.toSpliced(0, 1);          // [1, 2]
nums.with(0, 99);              // [99, 1, 2]

// Search from the end
[1, 2, 3, 4].findLast((n) => n % 2 === 1);      // 3
[1, 2, 3, 4].findLastIndex((n) => n % 2 === 1); // 2
```

Also: symbols as `WeakMap` keys and hashbang (`#!`) support.

## ES2024

```js
// Grouping
const people = [{ name: 'A', role: 'dev' }, { name: 'B', role: 'qa' }, { name: 'C', role: 'dev' }];
Object.groupBy(people, (p) => p.role);
// { dev: [{A}, {C}], qa: [{B}] }
Map.groupBy(people, (p) => p.role); // same, but as a Map

// Promise.withResolvers — create a promise and its controls together
const { promise, resolve, reject } = Promise.withResolvers();
setTimeout(() => resolve('done'), 100);
await promise; // 'done'

// Array.fromAsync — collect async iterables
const items = await Array.fromAsync(asyncGenerator());

// Well-formed strings
'ab\uD800'.isWellFormed();     // false
'ab\uD800'.toWellFormed();     // 'ab�'
```

Also: resizable `ArrayBuffer`, `Atomics.waitAsync`, and the RegExp `/v` flag.

## ES2025

```js
// Set methods
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);
a.union(b);                // Set {1, 2, 3, 4}
a.intersection(b);         // Set {2, 3}
a.difference(b);           // Set {1}
a.symmetricDifference(b);  // Set {1, 4}
a.isSubsetOf(b);           // false

// Iterator helpers — lazy, chainable
function* naturals() { let n = 1; while (true) yield n++; }
naturals().filter((n) => n % 2).map((n) => n * 10).take(3).toArray(); // [10, 30, 50]

// Promise.try — run sync-or-async code with uniform error handling
await Promise.try(() => mightThrowSync());

// RegExp.escape
new RegExp(RegExp.escape('1+1=2')); // safely matches literal "1+1=2"

// JSON modules (import attributes)
import data from './data.json' with { type: 'json' };
```

Also: `Float16Array` and `Math.f16round`, duplicate named capture groups, and regex inline modifiers.

## Not ECMAScript, but widely used

- **`structuredClone(obj)`**: deep clone (Web/Node API).
- **`AbortSignal.timeout`/`AbortSignal.any`**: cancellation helpers.

## Quick reference

| Year | Must-know features |
| --- | --- |
| ES2022 | `.at()`, `Object.hasOwn`, `#private`, static blocks, top-level `await`, `Error` `cause` |
| ES2023 | `toSorted`, `toReversed`, `toSpliced`, `with`, `findLast`, `findLastIndex` |
| ES2024 | `Object.groupBy`, `Map.groupBy`, `Promise.withResolvers`, `Array.fromAsync` |
| ES2025 | Set methods, Iterator helpers, `Promise.try`, `RegExp.escape`, JSON modules |

> Check support before relying on the newest features; most are in all evergreen browsers and Node 22+, but transpile/polyfill for older targets.

## Summary

- ES2022: `.at()`, `Object.hasOwn`, private class members, top-level `await`, error `cause`.
- ES2023: non-mutating `toSorted`/`toReversed`/`toSpliced`/`with` and `findLast`.
- ES2024: `Object.groupBy`, `Promise.withResolvers`, `Array.fromAsync`.
- ES2025: Set operations, iterator helpers, `Promise.try`, `RegExp.escape`.
