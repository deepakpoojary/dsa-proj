The **`arguments` object** is an array-like object available inside every regular (non-arrow) function that contains all the arguments passed to that call, regardless of how many parameters the function declares.

## Basic usage

```js
function showArgs() {
  console.log(arguments.length); // number of args passed
  console.log(arguments[0]);     // first arg
  console.log(arguments);        // [Arguments] { '0': 'a', '1': 'b', '2': 'c' }
}

showArgs('a', 'b', 'c');
// 3
// a
```

It's handy for functions that accept a variable number of arguments:

```js
function sum() {
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}

console.log(sum(1, 2, 3, 4)); // 10
```

## It's array-*like*, not an array

`arguments` has indexes and a `length`, but **no array methods** like `map`, `filter` or `reduce`.

```js
function test() {
  console.log(Array.isArray(arguments)); // false
  // arguments.map(x => x * 2);          // TypeError: arguments.map is not a function

  const arr1 = Array.from(arguments);
  const arr2 = [...arguments];                       // it's iterable
  const arr3 = Array.prototype.slice.call(arguments); // old-school

  console.log(arr2.map((x) => x * 2)); // [2, 4, 6]
}

test(1, 2, 3);
```

## Arrow functions don't have their own `arguments`

Arrow functions don't create an `arguments` binding. If you reference it, you get the **enclosing regular function's** `arguments` (or a `ReferenceError` at the top level of a module).

```js
function outer() {
  const inner = () => arguments[0]; // refers to outer's arguments
  return inner('ignored');
}

console.log(outer('from outer')); // "from outer"

const arrow = () => arguments;
// arrow(); // ReferenceError: arguments is not defined (in modules / strict top level)
```

## Prefer rest parameters

Modern JavaScript has **rest parameters** (`...args`), which are cleaner and give you a real array:

```js
const sum = (...nums) => nums.reduce((a, b) => a + b, 0);
console.log(sum(1, 2, 3)); // 6

function log(level, ...messages) {
  console.log(`[${level}]`, messages.join(' '));
}
log('INFO', 'Server', 'started'); // [INFO] Server started
```

| Feature | `arguments` | Rest parameters `...args` |
| --- | --- | --- |
| Type | Array-like object | Real `Array` |
| Array methods | No | Yes |
| Works in arrow functions | No | Yes |
| Contains | All passed arguments | Only the arguments after named params |
| Readability | Implicit, "magic" | Explicit in the signature |

## Quirks worth knowing

- **Parameter aliasing in sloppy mode**: in non-strict functions with simple parameters, changing `arguments[0]` also changes the named parameter (and vice versa). Strict mode, default parameters, rest or destructured params break this link.

```js
function sloppy(a) {
  arguments[0] = 99;
  return a;
}
sloppy(1); // 99 (sloppy mode)

function strict(a) {
  'use strict';
  arguments[0] = 99;
  return a;
}
strict(1); // 1
```

- `arguments.callee` (a reference to the current function) throws in strict mode and is deprecated.
- `arguments.length` reflects arguments *passed*, while `fn.length` reflects parameters *declared*.

## Summary

- `arguments` is an array-like object holding all arguments passed to a regular function.
- It has `length` and indexes but no array methods; convert with `Array.from` or spread.
- Arrow functions don't have their own; use **rest parameters** (`...args`) in modern code instead.
