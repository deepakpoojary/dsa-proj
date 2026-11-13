**Hoisting** is JavaScript's behavior of processing declarations before any code in a scope is executed, which makes it *look* as if variable and function declarations were "moved to the top" of their scope. Nothing is physically moved — the engine simply registers declarations during a setup phase.

## How it works

When the JavaScript engine enters a scope (global, function, block, or module), it runs in two phases:

1. **Creation phase** — the engine scans the code and creates bindings for all declarations (`var`, `let`, `const`, `function`, `class`, `import`).
2. **Execution phase** — the code runs line by line, assigning values as it goes.

What differs between declaration types is **how the binding is initialized** during the creation phase.

## Hoisting by declaration type

| Declaration | Hoisted? | Initial value | Access before declaration |
| --- | --- | --- | --- |
| `function` declaration | Yes | The full function | Works |
| `var` | Yes | `undefined` | Returns `undefined` |
| `let` / `const` | Yes | Uninitialized (TDZ) | `ReferenceError` |
| `class` | Yes | Uninitialized (TDZ) | `ReferenceError` |
| Function expression / arrow | Follows its variable (`var`/`let`/`const`) | — | Depends on variable |
| `import` | Yes | Linked before module runs | Works |

## Example

```js
console.log(a); // undefined
var a = 1;

greet();        // works: declaration is hoisted
function greet() {}

console.log(b); // ReferenceError (TDZ)
let b = 2;
```

Here's how the engine effectively interprets the first part:

```js
var a;            // declaration hoisted, initialized to undefined
function greet() {} // whole function hoisted

console.log(a);   // undefined
a = 1;            // assignment stays in place
greet();
```

## Function declarations vs function expressions

Only **function declarations** are hoisted with their body. Function expressions behave like the variable they're assigned to.

```js
sayHi();   // "Hi"
function sayHi() {
  console.log('Hi');
}

sayBye();  // TypeError: sayBye is not a function (it's undefined)
var sayBye = function () {
  console.log('Bye');
};

sayYo();   // ReferenceError: Cannot access 'sayYo' before initialization
const sayYo = () => console.log('Yo');
```

## `let`, `const` and the Temporal Dead Zone

`let` and `const` **are hoisted** — the engine knows about them — but they stay uninitialized until their declaration line runs. The period between the start of the scope and the declaration is the **Temporal Dead Zone (TDZ)**.

```js
let x = 'outer';
{
  console.log(x); // ReferenceError — not 'outer'!
  let x = 'inner';
}
```

This proves hoisting happens: the inner `x` shadows the outer one from the very start of the block.

## Hoisting precedence

When a function and a `var` share the same name, the function declaration wins during the creation phase:

```js
console.log(typeof foo); // "function"
var foo = 5;
function foo() {}
console.log(typeof foo); // "number" — the assignment ran
```

## Common pitfalls

- Relying on `var` hoisting hides bugs — you get `undefined` instead of an error.
- Calling a function expression before its definition throws a `TypeError` or `ReferenceError`.
- Function declarations inside blocks behave inconsistently in sloppy mode; avoid them or use strict mode/modules.

## Best practices

- Declare variables at the top of their scope or just before first use.
- Prefer `const`/`let` so use-before-declaration errors surface immediately.
- Function declarations being hoisted is fine (and sometimes handy for readability, e.g. helpers at the bottom of a file).

## Summary

- Hoisting = declarations are registered before code runs.
- Function declarations are fully usable early; `var` is `undefined` early.
- `let`, `const` and `class` are hoisted but throw in the TDZ if accessed early.
