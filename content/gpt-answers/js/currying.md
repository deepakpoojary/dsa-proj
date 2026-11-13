**Currying** is the technique of transforming a function that takes multiple arguments, like `f(a, b, c)`, into a sequence of functions that each take one argument: `f(a)(b)(c)`.

## How it works

A curried function doesn't run until it has received all the arguments it needs. Each call returns a new function that **remembers** the arguments collected so far using a **closure**.

```js
// Normal function
function add(a, b, c) {
  return a + b + c;
}
add(1, 2, 3); // 6

// Manually curried version
const addCurried = (a) => (b) => (c) => a + b + c;
addCurried(1)(2)(3); // 6
```

## Implementing a generic `curry`

The trick is to compare the number of arguments collected with `fn.length` (the number of declared parameters).

```js
const curry = (fn) =>
  function curried(...args) {
    // Enough arguments? Call the original function.
    return args.length >= fn.length
      ? fn.apply(this, args)
      // Otherwise return a function that collects more.
      : (...next) => curried.apply(this, [...args, ...next]);
  };

const add = curry((a, b, c) => a + b + c);

console.log(add(1)(2)(3)); // 6
console.log(add(1, 2)(3)); // 6
console.log(add(1)(2, 3)); // 6
console.log(add(1, 2, 3)); // 6
```

This version is flexible: you can pass one or several arguments at each step. It also preserves `this`, so it works for methods.

## Why use currying?

- **Reusable specialised functions** built from general ones:

```js
const multiply = curry((a, b) => a * b);
const double = multiply(2);
const triple = multiply(3);

[1, 2, 3].map(double); // [2, 4, 6]
[1, 2, 3].map(triple); // [3, 6, 9]
```

- **Config-first APIs**: fix configuration early, supply data later.

```js
const log = curry((level, scope, message) =>
  console.log(`[${level}] ${scope}: ${message}`)
);

const authError = log('ERROR')('auth');
authError('Invalid token'); // [ERROR] auth: Invalid token
```

- **Function composition**: unary functions plug neatly into `pipe`/`compose` utilities.

## Currying vs partial application

| | Currying | Partial application |
| --- | --- | --- |
| What it does | Turns an n-ary function into a chain of unary calls | Fixes *some* arguments, returns a function for the rest |
| Shape | `f(a)(b)(c)` | `g = partial(f, a); g(b, c)` |
| Built-in support | None (write your own / use a library) | `fn.bind(null, a)` |

```js
const add3 = (a, b, c) => a + b + c;
const addTen = add3.bind(null, 10); // partial application
addTen(1, 2); // 13
```

## Common pitfalls

- **`fn.length` is not always accurate**: it ignores rest parameters and stops counting at the first parameter with a default value.

```js
((a, b = 2, c) => {}).length; // 1
((...args) => {}).length;     // 0  -> curry would call immediately
```

  For variadic functions, pass the arity explicitly: `curry(fn, arity)`.
- Deeply curried code can hurt readability if overused.

## Summary

- Currying turns `f(a, b, c)` into `f(a)(b)(c)` using closures to store arguments.
- A generic `curry` compares collected args with `fn.length` and either calls `fn` or returns another collector.
- It's great for creating specialised, composable functions; it's different from partial application.
