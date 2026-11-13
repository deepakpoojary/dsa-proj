In JavaScript, `===` and `==` compare objects **by reference**, not by content, so two objects with identical properties are not equal unless they're literally the same object. To compare contents, you need a **shallow** or **deep** equality check.

## Reference equality

```js
const a = { x: 1 };
const b = { x: 1 };
const c = a;

console.log(a === b); // false - different objects
console.log(a == b);  // false - same rule for objects
console.log(a === c); // true  - same reference
console.log(Object.is(a, b)); // false
```

## Shallow equality

Checks that both objects have the same keys and that each top-level value is strictly equal. This is what React uses to decide whether props/state changed (`React.memo`, `PureComponent`).

```js
function shallowEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => Object.hasOwn(b, key) && Object.is(a[key], b[key]));
}

console.log(shallowEqual({ x: 1, y: 2 }, { y: 2, x: 1 }));   // true
console.log(shallowEqual({ x: { z: 1 } }, { x: { z: 1 } })); // false - nested refs differ
```

## Deep equality

Recursively compares nested objects and arrays.

```js
function deepEqual(a, b) {
  if (Object.is(a, b)) return true;

  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }

  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;

  if (a instanceof Date) return a.getTime() === b.getTime();

  const keysA = Reflect.ownKeys(a);
  const keysB = Reflect.ownKeys(b);
  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => Object.hasOwn(b, key) && deepEqual(a[key], b[key]));
}

console.log(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })); // true
console.log(deepEqual([1, 2], { 0: 1, 1: 2 }));                    // false - different prototypes
console.log(deepEqual(new Date(0), new Date(0)));                  // true
```

A production-grade version also handles `Map`, `Set`, `RegExp`, typed arrays and **circular references** (track visited pairs in a `WeakMap`).

## The `JSON.stringify` shortcut (and why it's fragile)

```js
JSON.stringify({ a: 1, b: 2 }) === JSON.stringify({ a: 1, b: 2 }); // true
JSON.stringify({ a: 1, b: 2 }) === JSON.stringify({ b: 2, a: 1 }); // false - key order!
JSON.stringify({ a: undefined }) === JSON.stringify({});            // true  - wrong!
```

Problems:

- Sensitive to **key order**.
- Drops `undefined`, functions and Symbols.
- `NaN` and `null` both become `null`.
- Loses `Map`/`Set` contents and throws on cycles/BigInt.

It's OK only for quick checks on simple, JSON-shaped data you control.

## Use a library in practice

```js
// Node.js built-in
import { isDeepStrictEqual } from 'node:util';
isDeepStrictEqual({ a: [1, 2] }, { a: [1, 2] }); // true

// Lodash
import isEqual from 'lodash/isEqual';
isEqual({ a: new Set([1]) }, { a: new Set([1]) }); // true
```

Testing frameworks also provide deep equality: Jest/Vitest `expect(a).toEqual(b)` and Node's `assert.deepStrictEqual`.

## Comparison of approaches

| Approach | Compares | Nested objects | Key order matters | Edge cases |
| --- | --- | --- | --- | --- |
| `===` / `Object.is` | Reference | n/a | n/a | n/a |
| Shallow equal | Top-level values | By reference | No | Good for React props |
| `JSON.stringify` | Serialized string | Yes | **Yes** | Many failures |
| Custom deep equal | All levels | Yes | No | Depends on implementation |
| `isDeepStrictEqual` / `_.isEqual` | All levels | Yes | No | Handles Map, Set, Date, cycles |

## Summary

- `===` only tells you whether two variables point to the same object.
- Use **shallow equality** for flat objects and change detection; use **deep equality** for nested structures.
- Avoid `JSON.stringify` comparisons; prefer `util.isDeepStrictEqual`, `lodash.isEqual`, or a careful recursive function.
