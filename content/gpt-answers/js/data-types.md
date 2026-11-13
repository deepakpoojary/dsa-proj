JavaScript has **8 data types**: **7 primitive types** (`string`, `number`, `bigint`, `boolean`, `undefined`, `null`, `symbol`) and **1 non-primitive type**, `object`, which covers arrays, functions, dates, maps and everything else.

## Primitive types

Primitives are **immutable** values and are compared **by value**.

| Type | Example | `typeof` result | Notes |
| --- | --- | --- | --- |
| `string` | `'hello'`, `` `hi ${name}` `` | `"string"` | UTF-16 text, immutable |
| `number` | `42`, `3.14`, `NaN`, `Infinity` | `"number"` | 64-bit IEEE 754 float |
| `bigint` | `9007199254740993n` | `"bigint"` | Arbitrary-precision integers |
| `boolean` | `true`, `false` | `"boolean"` | |
| `undefined` | `undefined` | `"undefined"` | Value not assigned |
| `null` | `null` | `"object"` (!) | Intentional absence of value |
| `symbol` | `Symbol('id')` | `"symbol"` | Unique identifiers |

```js
const str = 'JavaScript';
const num = 42;
const big = 123456789012345678901234567890n;
const flag = true;
let nothing;            // undefined
const empty = null;
const id = Symbol('id');

console.log(typeof big);   // "bigint"
console.log(typeof empty); // "object" — a historic bug
```

### Immutability of primitives

You can't change a primitive in place; operations return new values.

```js
let s = 'abc';
s[0] = 'X';
console.log(s);              // 'abc' — unchanged
console.log(s.toUpperCase()); // 'ABC' — a new string
```

### Autoboxing

Primitives (except `null` and `undefined`) have methods because JavaScript temporarily wraps them in an object wrapper (`String`, `Number`, `Boolean`, `BigInt`, `Symbol`) when you access a property:

```js
'hello'.length;      // 5
(3.14159).toFixed(2); // '3.14'
```

## The `object` type

Everything that isn't a primitive is an **object** — a mutable collection of key-value properties, compared **by reference**.

```js
const user = { name: 'Ann', age: 30 }; // plain object
const list = [1, 2, 3];                // array
const fn = () => 'hi';                 // function
const now = new Date();                // date
const map = new Map([['a', 1]]);       // Map
const set = new Set([1, 2]);           // Set

console.log(typeof list); // "object"
console.log(typeof fn);   // "function" — functions are callable objects
```

## Value vs reference

```js
// Primitives: copied by value
let a = 10;
let b = a;
b = 20;
console.log(a); // 10

// Objects: the reference is copied
const o1 = { x: 1 };
const o2 = o1;
o2.x = 99;
console.log(o1.x); // 99
```

## Checking types reliably

```js
typeof 'x';               // "string"
x === null;               // check for null (typeof gives "object")
Array.isArray([1, 2]);    // true
value instanceof Date;    // true for dates
Object.prototype.toString.call(new Map()); // "[object Map]"
```

## Common pitfalls

- `typeof null === 'object'` — always check `null` with `=== null`.
- `typeof []` is `"object"` — use `Array.isArray()`.
- `typeof NaN` is `"number"`.
- Mixing `bigint` and `number` in arithmetic throws a `TypeError` (`1n + 1`).
- Integers above `Number.MAX_SAFE_INTEGER` (2^53 − 1) lose precision as `number`; use `bigint`.

## Summary

- **7 primitives**: string, number, bigint, boolean, undefined, null, symbol — immutable, compared by value.
- **1 non-primitive**: object (including arrays and functions) — mutable, compared by reference.
- Use `typeof`, `Array.isArray`, and `=== null` together to identify types correctly.
