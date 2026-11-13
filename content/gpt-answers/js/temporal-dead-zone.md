The **Temporal Dead Zone (TDZ)** is the period between the start of a scope and the point where a `let`, `const` or `class` declaration is actually evaluated. During that window, the variable exists (it has been hoisted) but is **uninitialized**, and any attempt to access it throws a `ReferenceError`.

## Basic example

```js
console.log(score); // ReferenceError: Cannot access 'score' before initialization
let score = 10;
console.log(score); // 10
```

Compare with `var`, which is initialized to `undefined` at hoisting time:

```js
console.log(level); // undefined — no error
var level = 1;
```

## Proof that `let` is hoisted

If `let` weren't hoisted, the following would print `'outer'`. Instead, it throws:

```js
let x = 'outer';
{
  console.log(x); // ReferenceError, not 'outer'
  let x = 'inner';
}
```

The inner `x` is registered at the top of the block, shadowing the outer `x` — but it's in the TDZ until its declaration line runs.

## Why "temporal"?

The TDZ is about **time of execution**, not position in the code. A function can reference a `let` variable declared below it, as long as the function is **called** after the declaration:

```js
function show() {
  console.log(value); // fine if called after initialization
}

// show();          // ReferenceError — still in TDZ
let value = 42;
show();             // 42
```

## TDZ edge cases

### `typeof` is no longer safe

```js
typeof undeclared; // "undefined" — never declared, no error
typeof later;      // ReferenceError — in TDZ
let later = 1;
```

### Default parameters

Parameters are initialized left to right, so referencing a later parameter is a TDZ error:

```js
function f(a = b, b = 2) {}
f();       // ReferenceError: Cannot access 'b' before initialization

function g(a = 1, b = a + 1) { return b; }
g();       // 2 — fine
```

### Self-reference in the initializer

```js
let n = n + 1; // ReferenceError — n is still in TDZ while evaluating the right side
```

### Classes

```js
const p = new Person(); // ReferenceError
class Person {}
```

## Behavior comparison

| Declaration | Hoisted | Initialized at hoist time | Access before declaration |
| --- | --- | --- | --- |
| `var` | Yes | `undefined` | Returns `undefined` |
| `function` | Yes | Full function | Works |
| `let` | Yes | No (TDZ) | `ReferenceError` |
| `const` | Yes | No (TDZ) | `ReferenceError` |
| `class` | Yes | No (TDZ) | `ReferenceError` |

## Why the TDZ exists

- **Catches bugs**: using a variable before it's set is almost always a mistake; `var` hid this by returning `undefined`.
- **Makes `const` meaningful**: a `const` should never be observed with a value other than the one it was declared with — not even `undefined`.
- **Predictable semantics** for classes and block scoping.

## How to avoid TDZ errors

- Declare variables at the top of their scope or before first use.
- Don't call functions that read a `let`/`const` before that variable is initialized.
- Watch out for circular imports in ES modules, which can surface TDZ errors for exported bindings.

## Summary

- The TDZ is the time between entering a scope and the `let`/`const`/`class` declaration being executed.
- The binding is hoisted but uninitialized; accessing it — even with `typeof` — throws `ReferenceError`.
- It exists to catch use-before-declaration bugs that `var` silently allowed.
