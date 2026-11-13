An **IIFE (Immediately Invoked Function Expression)** is a function that is defined and executed in one step. It was widely used to create a **private scope**, keeping variables out of the global namespace in the era before ES6 block scoping and ES modules.

## Syntax

```js
(function () {
  const message = 'Hello from IIFE';
  console.log(message);
})();
// 'Hello from IIFE'

// Arrow function version
(() => {
  console.log('Arrow IIFE');
})();

// Alternative placement of the invoking parens
(function () {
  console.log('Also valid');
}());
```

## Why the parentheses?

Without the wrapping parentheses, the parser sees `function` at the start of a statement and treats it as a **function declaration**, which must have a name and can't be invoked immediately:

```js
function () {}();   // SyntaxError
```

Wrapping it in `( )` forces the parser to treat it as a **function expression**, which can then be called right away. Other operators (`!`, `+`, `void`) also work, but parentheses are the convention:

```js
!function () { console.log('works'); }();
```

## Passing arguments and returning values

```js
const result = (function (a, b) {
  return a + b;
})(2, 3);

console.log(result); // 5

// Aliasing globals (common in jQuery plugins)
(function ($, win) {
  $('#app').hide();
})(jQuery, window);
```

## Why IIFEs were used

### 1. Avoiding global scope pollution

Before ES6, `var` was function-scoped, so the only way to create a private scope was a function:

```js
(function () {
  var counter = 0; // not a global
  // ...
})();

console.log(typeof counter); // "undefined"
```

### 2. The module pattern

IIFEs combined with closures created private state with a public API:

```js
const Counter = (function () {
  let count = 0; // private

  return {
    increment: () => ++count,
    get value() { return count; },
  };
})();

Counter.increment();
Counter.value; // 1
Counter.count; // undefined
```

### 3. Fixing `var` in loops

```js
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j)); // 0 1 2
  })(i);
}
```

### 4. Safe library bundling

Libraries and bundlers (UMD format, older webpack output) wrapped code in IIFEs so separate files wouldn't collide.

## Modern alternatives

| Old IIFE use | Modern replacement |
| --- | --- |
| Private scope | Block scope `{ let x; }` |
| Module pattern | ES modules (`import`/`export`) |
| Private class state | `#private` fields |
| Loop closure fix | `let` in `for` loops |

## Where IIFEs are still useful

- **Async IIFE** where top-level `await` isn't available (CommonJS, classic scripts):

```js
(async () => {
  const res = await fetch('/api/data');
  const data = await res.json();
  console.log(data);
})();
```

- Running one-off initialization logic with local variables.
- Computing a `const` value with complex logic:

```js
const config = (() => {
  if (process.env.NODE_ENV === 'production') return { debug: false };
  return { debug: true };
})();
```

## Pitfall

A missing semicolon before an IIFE can cause the previous line to be "called":

```js
const a = 1
(function () {})() // TypeError: 1 is not a function
```

## Summary

- An IIFE is a function expression invoked immediately: `(function () { ... })();`.
- It created private scopes and powered the module pattern before ES6.
- Today, block scope and ES modules cover most cases, but async IIFEs remain handy.
