A **pure function** is a function that always returns the **same output for the same input** and has **no side effects**, meaning it doesn't change anything outside itself or depend on anything that can change.

## The two rules

1. **Deterministic**: given the same arguments, it always returns the same result.
2. **No side effects**: it doesn't modify its arguments, global/outer variables, the DOM, files, network, or anything else observable outside the function.

```js
// Pure
function add(a, b) {
  return a + b;
}

add(2, 3); // 5
add(2, 3); // 5 - always
```

## Examples of impure functions

```js
// 1. Depends on external mutable state
let taxRate = 0.2;
function priceWithTax(price) {
  return price * (1 + taxRate); // result changes if taxRate changes
}

// 2. Mutates its argument
function addItem(cart, item) {
  cart.push(item); // side effect: caller's array is changed
  return cart;
}

// 3. Non-deterministic
function randomId() {
  return Math.random().toString(36).slice(2); // different every call
}

// 4. Performs I/O
function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user)); // side effect
}
```

## Making functions pure

Pass in everything the function needs and return new values instead of mutating.

```js
// Pure: tax rate is an argument
function priceWithTax(price, taxRate) {
  return price * (1 + taxRate);
}

// Pure: returns a new array, original untouched
function addItem(cart, item) {
  return [...cart, item];
}

const cart = ['apple'];
const newCart = addItem(cart, 'banana');
console.log(cart);    // ['apple']
console.log(newCart); // ['apple', 'banana']
```

Modern JS also has non-mutating array methods that help:

```js
const nums = [3, 1, 2];
const sorted = nums.toSorted();   // [1, 2, 3], nums unchanged
const reversed = nums.toReversed(); // [2, 1, 3]
const updated = nums.with(0, 99);   // [99, 1, 2]
```

## Common side effects to watch for

| Side effect | Example |
| --- | --- |
| Mutating arguments | `arr.push()`, `obj.x = 1`, `arr.sort()` |
| Changing outer variables | `count++` on a module-level variable |
| I/O | `console.log`, `fetch`, file writes, `localStorage` |
| DOM manipulation | `element.textContent = ...` |
| Non-determinism | `Math.random()`, `Date.now()`, `new Date()` |

## Why pure functions matter

- **Predictable**: easy to reason about; output depends only on input.
- **Easy to test**: no mocks or setup, just call and assert.
- **Memoizable**: since the output never changes for the same input, results can be cached safely.
- **Safe to parallelise / reorder**: no shared state to corrupt.
- **Framework expectations**: React components' render logic and Redux reducers are expected to be pure. Mutating state in a reducer is a classic bug.

```js
// Redux-style reducer - pure
function counter(state = { count: 0 }, action) {
  switch (action.type) {
    case 'inc':
      return { ...state, count: state.count + 1 }; // new object
    default:
      return state;
  }
}
```

## A practical note

Real apps *need* side effects (fetching data, updating the UI). The goal isn't to eliminate them but to **isolate** them: keep core logic pure and push side effects to the edges (event handlers, effects, services).

## Summary

- Pure = same input gives same output + no side effects.
- Avoid mutating arguments, reading changing outer state, I/O, `Math.random()` and `Date.now()` inside them.
- Pure functions are predictable, testable and memoizable; keep side effects at the edges of your app.
