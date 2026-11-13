`"use strict"` is a directive that opts a script or function into **strict mode**, a restricted variant of JavaScript introduced in ES5. It turns many silent mistakes into thrown errors, disables some confusing features, and makes code easier for engines to optimize.

## How to enable it

Place the directive at the very top of a script or function:

```js
'use strict';          // whole script is strict

function legacy() {
  'use strict';        // only this function is strict
}
```

**ES modules** and **class bodies** are always strict automatically — no directive needed. Since most modern code uses modules (or is bundled from them), you're often in strict mode already.

## What changes in strict mode

### 1. No accidental globals

```js
'use strict';
total = 100; // ReferenceError: total is not defined
// Sloppy mode would silently create window.total
```

### 2. `this` is `undefined` in plain function calls

```js
'use strict';
function show() {
  return this;
}
show(); // undefined (sloppy mode: the global object)
```

This prevents methods detached from their objects from accidentally modifying `window`.

### 3. Silent failures become errors

```js
'use strict';
const obj = Object.freeze({ a: 1 });
obj.a = 2;              // TypeError: Cannot assign to read only property

const o2 = {};
Object.defineProperty(o2, 'x', { value: 1, writable: false });
o2.x = 5;               // TypeError

delete Object.prototype; // TypeError
'abc'.length = 1;        // TypeError
```

### 4. Forbidden syntax

```js
'use strict';
function sum(a, a) {}   // SyntaxError: duplicate parameter name
with (obj) {}           // SyntaxError: 'with' not allowed
const n = 010;          // SyntaxError: legacy octal literal (use 0o10)
delete someVariable;    // SyntaxError: can't delete plain names
```

### 5. Safer `eval` and `arguments`

```js
'use strict';
eval('var x = 1');
typeof x;               // "undefined" — eval gets its own scope

function f(a) {
  a = 2;
  return arguments[0];  // 1 — arguments no longer mirrors parameters
}
f(1);
```

`arguments.callee` is also disallowed.

### 6. Reserved words

Words like `let`, `static`, `implements`, `interface`, `package`, `private`, `protected`, `public` and `yield` can't be used as identifiers.

## Sloppy vs strict at a glance

| Behavior | Sloppy mode | Strict mode |
| --- | --- | --- |
| Assign undeclared variable | Creates global | `ReferenceError` |
| `this` in plain function call | Global object | `undefined` |
| Write to read-only property | Silently ignored | `TypeError` |
| Duplicate parameter names | Allowed | `SyntaxError` |
| `with` statement | Allowed | `SyntaxError` |
| `eval` declares variables in caller scope | Yes | No |

## Why use it

- **Catches bugs early** — typos in variable names fail loudly.
- **Safer `this`** — no accidental global mutation.
- **Better performance** — engines can optimize more aggressively without `with` and `arguments` aliasing.
- **Future-proofing** — reserves keywords for later language features.

## Pitfalls

- Concatenating a strict file with a non-strict one can unintentionally change the mode of the whole bundle (less relevant with modern bundlers).
- A function with default/rest/destructured parameters **cannot** contain a `'use strict'` directive (SyntaxError).

## Summary

- `"use strict"` enables a stricter, safer JavaScript: silent errors throw, accidental globals are blocked, and `this` is `undefined` in plain calls.
- ES modules and classes are strict by default, so modern code usually runs in strict mode already.
