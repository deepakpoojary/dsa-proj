A **higher-order function (HOF)** is a function that either **takes another function as an argument**, **returns a function**, or both. It's possible in JavaScript because functions are first-class values.

## Two kinds of higher-order functions

### 1. Functions that accept functions

The function you pass in is usually called a **callback**.

```js
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map((n) => n * 2);         // [2, 4, 6, 8, 10]
const evens   = numbers.filter((n) => n % 2 === 0); // [2, 4]
const sum     = numbers.reduce((acc, n) => acc + n, 0); // 15

console.log(doubled, evens, sum);
```

### 2. Functions that return functions

```js
function multiplier(factor) {
  return (n) => n * factor; // returns a new function
}

const double = multiplier(2);
const triple = multiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

The returned function "remembers" `factor` thanks to a **closure**.

## Built-in examples

| Higher-order function | Takes a function? | Purpose |
| --- | --- | --- |
| `Array.prototype.map` | Yes | Transform each element |
| `filter`, `find`, `some`, `every` | Yes | Select / test elements |
| `reduce` | Yes | Fold into a single value |
| `sort` / `toSorted` | Yes | Custom comparison |
| `setTimeout`, `setInterval` | Yes | Schedule work |
| `addEventListener` | Yes | React to events |
| `Promise.prototype.then` | Yes | Handle async results |
| `Function.prototype.bind` | Returns one | Create a bound function |

## Writing your own HOFs

Common real-world HOFs wrap another function to add behavior without changing it.

```js
// Logs every call to the wrapped function
function withLogging(fn) {
  return function (...args) {
    console.log(`Calling ${fn.name} with`, args);
    const result = fn.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };
}

const add = (a, b) => a + b;
const loggedAdd = withLogging(add);
loggedAdd(2, 3);
// Calling add with [2, 3]
// Result: 5
```

A classic interview example is `debounce`, which delays calls until activity stops:

```js
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const onResize = debounce(() => console.log('resized!'), 200);
window.addEventListener('resize', onResize);
```

Other common custom HOFs: `throttle`, `memoize`, `once`, `curry`, Express/Redux middleware, and React higher-order components.

## Why they matter

- **Abstraction**: separate *what* to do (the callback) from *how* to iterate or schedule it.
- **Reusability**: write generic logic once (`retry`, `memoize`) and apply it to any function.
- **Composition**: build complex behavior by combining small functions.
- **Declarative code**: `users.filter(isActive).map(getName)` reads like a description of the result.

## Common pitfalls

- Losing `this` when passing methods as callbacks (`arr.map(obj.method)`); use an arrow function or `bind`.
- Passing a function that expects different arguments: `['1', '2', '3'].map(parseInt)` gives `[1, NaN, NaN]` because `map` passes `(value, index)`.

## Summary

- A higher-order function takes a function as input and/or returns one.
- `map`, `filter`, `reduce`, `setTimeout` and `addEventListener` are everyday examples.
- They enable reusable wrappers like `debounce`, `memoize` and middleware, and they depend on functions being first-class values.
