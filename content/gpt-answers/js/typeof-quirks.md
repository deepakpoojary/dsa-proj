The `typeof` operator returns a **string** describing the type of its operand. It's handy for checking primitives, but it has several well-known quirks — most famously, `typeof null` returns `"object"`.

## Possible return values

`typeof` always returns one of these **eight strings**:

| Value | `typeof` result |
| --- | --- |
| `'hello'` | `"string"` |
| `42`, `NaN`, `Infinity` | `"number"` |
| `10n` | `"bigint"` |
| `true` | `"boolean"` |
| `undefined` | `"undefined"` |
| `Symbol()` | `"symbol"` |
| `{}`, `[]`, `null`, `new Date()` | `"object"` |
| `function () {}`, `class {}`, `() => {}` | `"function"` |

```js
typeof 'abc';        // "string"
typeof 3.14;         // "number"
typeof 10n;          // "bigint"
typeof false;        // "boolean"
typeof undefined;    // "undefined"
typeof Symbol('x');  // "symbol"
typeof {};           // "object"
typeof Math.max;     // "function"
```

## The quirks

### 1. `typeof null === "object"`

A bug from the very first version of JavaScript (null's internal type tag was 0, the same as objects). It can't be fixed without breaking the web.

```js
typeof null; // "object"

// Correct null check
value === null;
```

### 2. Arrays are `"object"`

```js
typeof [];          // "object"
Array.isArray([]);  // true — use this instead
```

### 3. `NaN` is a `"number"`

```js
typeof NaN;          // "number"
Number.isNaN(NaN);   // true — use this to detect NaN
```

### 4. Classes are `"function"`

Classes are syntactic sugar over constructor functions:

```js
typeof class Foo {}; // "function"
```

### 5. Wrapper objects are `"object"`

```js
typeof new String('a');  // "object"
typeof String('a');      // "string" — without `new` it's a conversion
```

### 6. Undeclared variables don't throw...

```js
typeof notDeclaredAnywhere; // "undefined" — no ReferenceError
```

This made `typeof` the classic safe way to feature-detect globals, e.g. `typeof window !== 'undefined'` to check if code runs in a browser.

### 7. ...but variables in the TDZ do

```js
typeof value; // ReferenceError: Cannot access 'value' before initialization
let value = 1;
```

### 8. `typeof` has high precedence

```js
typeof 1 + 2;     // "number2" — evaluated as (typeof 1) + 2
typeof (1 + 2);   // "number"
```

## Reliable type checks

```js
const isString = (v) => typeof v === 'string';
const isNumber = (v) => typeof v === 'number' && !Number.isNaN(v);
const isObject = (v) => v !== null && typeof v === 'object';
const isPlainObject = (v) =>
  Object.prototype.toString.call(v) === '[object Object]';

Object.prototype.toString.call([]);         // "[object Array]"
Object.prototype.toString.call(null);       // "[object Null]"
Object.prototype.toString.call(new Date()); // "[object Date]"

new Date() instanceof Date; // true (for class instances)
```

## When to use `typeof`

- Checking primitives: `string`, `number`, `boolean`, `bigint`, `symbol`, `undefined`.
- Checking if something is callable: `typeof fn === 'function'`.
- Safe environment/feature detection: `typeof globalThis.fetch === 'function'`.

Avoid it for `null`, arrays, and distinguishing object kinds.

## Summary

- `typeof` returns one of 8 strings: string, number, bigint, boolean, undefined, symbol, object, function.
- Quirks: `null` → "object", arrays → "object", `NaN` → "number", classes → "function".
- It's safe on undeclared variables but throws in the TDZ; use `=== null`, `Array.isArray` and `Number.isNaN` for the edge cases.
