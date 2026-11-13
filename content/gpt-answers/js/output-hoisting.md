It prints `undefined`, then `'foo'`, then `'function'`, and then throws **`TypeError: bar is not a function`**. This happens because of **hoisting**: before any code runs, JavaScript registers `var` declarations (initialized to `undefined`) and function declarations (with their full body) at the top of their scope.

## The snippet

```js
console.log(a);   // undefined
var a = 1;
console.log(foo()); // 'foo'
function foo() { return 'foo'; }
console.log(typeof baz); // 'function'
var baz = 1;
function baz() {}
bar();            // TypeError: bar is not a function
var bar = function () {};
```

## How the engine "sees" it

During the creation phase, declarations are processed first. Conceptually the code behaves like this:

```js
// Hoisted declarations
function foo() { return 'foo'; } // function declarations: name + body
function baz() {}                // function wins over var baz at this stage
var a;                           // undefined
var bar;                         // undefined
// (var baz is ignored here: baz already exists as a function)

// Execution phase, in original order
console.log(a);          // undefined
a = 1;
console.log(foo());      // 'foo'
console.log(typeof baz); // 'function'
baz = 1;
bar();                   // TypeError
bar = function () {};
```

## Line-by-line walkthrough

### 1. `console.log(a)` → `undefined`

`var a` is hoisted and initialized to `undefined`. The assignment `a = 1` stays in place and hasn't run yet. No error, just `undefined`.

### 2. `console.log(foo())` → `'foo'`

**Function declarations are hoisted with their entire body**, so `foo` is callable before the line where it appears.

### 3. `console.log(typeof baz)` → `'function'`

Both `var baz` and `function baz() {}` declare the same name. During hoisting, **function declarations take priority** over `var` declarations; a `var` without assignment doesn't overwrite an existing binding. So before `baz = 1` executes, `baz` is the function.

After `var baz = 1;` runs, `typeof baz` would be `'number'`.

### 4. `bar()` → `TypeError: bar is not a function`

`var bar = function () {}` is a **function expression** assigned to a `var`. Only the declaration `var bar` is hoisted (as `undefined`); the function is assigned later. Calling `undefined()` throws a **TypeError**, not a ReferenceError, because the variable exists.

Execution stops here, so nothing after it runs.

## Final output

```js
// undefined
// foo
// function
// Uncaught TypeError: bar is not a function
```

## How `let`, `const` and `class` differ

They're hoisted too, but **not initialized**. Accessing them before the declaration is in the **Temporal Dead Zone (TDZ)** and throws a `ReferenceError`:

```js
console.log(x); // ReferenceError: Cannot access 'x' before initialization
let x = 1;

qux(); // ReferenceError (const in TDZ), not TypeError
const qux = () => {};
```

## Hoisting cheat sheet

| Declaration | Hoisted? | Initial value before its line | Access before declaration |
|---|---|---|---|
| `var x` | Yes | `undefined` | `undefined` |
| `let` / `const` | Yes (TDZ) | Uninitialized | `ReferenceError` |
| `function f() {}` | Yes, with body | The function | Works |
| `var f = function () {}` | Only `var f` | `undefined` | Calling → `TypeError` |
| `const f = () => {}` | Yes (TDZ) | Uninitialized | `ReferenceError` |
| `class C {}` | Yes (TDZ) | Uninitialized | `ReferenceError` |

## Summary

- `var` is hoisted as `undefined`; function declarations are hoisted with their body and win over a same-named `var`.
- Function expressions assigned to `var` are `undefined` until assigned, so calling early throws `TypeError`.
- Output: `undefined`, `'foo'`, `'function'`, then `TypeError: bar is not a function`.
