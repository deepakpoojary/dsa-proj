A **function declaration** defines a named function as a standalone statement and is fully hoisted, while a **function expression** creates a function as part of an expression (usually assigned to a variable) and can only be used after that line runs.

## Syntax

```js
// Function declaration
function greet(name) {
  return `Hello, ${name}`;
}

// Function expression (anonymous)
const greet2 = function (name) {
  return `Hello, ${name}`;
};

// Named function expression
const factorial = function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1);
};

// Arrow function (also an expression)
const greet3 = (name) => `Hello, ${name}`;
```

## The key difference: hoisting

Function declarations are **hoisted with their body**, so you can call them before they appear in the code.

```js
console.log(sayHi()); // "Hi!" - works

function sayHi() {
  return 'Hi!';
}
```

Function expressions follow the hoisting rules of the variable they're assigned to:

```js
console.log(sayBye()); // ReferenceError: Cannot access 'sayBye' before initialization

const sayBye = function () {
  return 'Bye!';
};
```

With `var`, the variable is hoisted as `undefined`, so you get a different error:

```js
console.log(typeof oldStyle); // "undefined"
oldStyle(); // TypeError: oldStyle is not a function

var oldStyle = function () {};
```

## Named function expressions

The name in a named function expression is only visible **inside the function itself**. That's useful for recursion and gives clearer stack traces.

```js
const countdown = function tick(n) {
  if (n === 0) return 'Done';
  return tick(n - 1); // `tick` is available here
};

console.log(countdown(3)); // "Done"
console.log(typeof tick);  // "undefined" - not in outer scope
```

## Comparison

| Feature | Declaration | Expression |
| --- | --- | --- |
| Syntax | `function f() {}` statement | `const f = function () {}` |
| Hoisting | Name and body hoisted | Only the variable (TDZ for `let`/`const`) |
| Callable before definition | Yes | No |
| Name required | Yes | Optional |
| Can be an IIFE / inline callback | No (must be an expression) | Yes |
| Conditional definition | Inconsistent inside blocks in sloppy mode | Predictable |

## When expressions are required

Some patterns only work with expressions:

```js
// IIFE
(function () {
  console.log('runs immediately');
})();

// Inline callback
setTimeout(function () {
  console.log('later');
}, 100);

// Conditionally choose an implementation
const format = isDev
  ? function (msg) { return `[DEV] ${msg}`; }
  : function (msg) { return msg; };
```

## Which should you use?

- **Declarations** are great for top-level helper functions: readable, hoisted, and you can organise files with the main logic first and helpers below.
- **Expressions** (especially arrow functions with `const`) are great for callbacks, closures, and when you want to prevent use-before-definition or accidental reassignment.
- Many style guides prefer `const fn = () => {}` for consistency, but both are perfectly valid.

## Summary

- Declarations are hoisted completely and can be called before their line; expressions can't.
- Expressions can be anonymous, named (name visible only inside), or arrows, and are required for IIFEs and inline callbacks.
- Choose declarations for top-level helpers and expressions for callbacks and values.
