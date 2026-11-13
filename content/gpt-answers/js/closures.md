A **closure** is a function combined with a reference to the **lexical environment** in which it was created. In practice, it means an inner function can keep accessing variables from its outer function **even after the outer function has finished executing**.

## Basic example

```js
function counter() {
  let n = 0;
  return () => ++n;
}
const c = counter();
c(); // 1
c(); // 2
```

When `counter()` returns, you'd normally expect `n` to be garbage-collected. But the returned arrow function still references `n`, so JavaScript keeps it alive. That function plus its retained environment is the closure.

## How it works

1. JavaScript uses **lexical scoping**: a function's accessible variables are determined by where it's **written** in the code.
2. Every time a function is created, it stores a hidden reference to its surrounding scope (`[[Environment]]` in the spec).
3. When the function runs later, variable lookups follow that stored scope chain.
4. As long as the inner function is reachable, the captured variables stay in memory.

## Each call creates a fresh closure

```js
const a = counter();
const b = counter();

a(); // 1
a(); // 2
b(); // 1 — b has its own independent `n`
```

## Closures capture variables, not values

The closure sees the **current** value of a variable, not a snapshot:

```js
function makeGreeter() {
  let name = 'Ann';
  const greet = () => `Hi, ${name}`;
  name = 'Bo';
  return greet;
}
makeGreeter()(); // 'Hi, Bo'
```

## Common use cases

### 1. Data privacy (encapsulation)

```js
function createAccount(initial) {
  let balance = initial; // private

  return {
    deposit(amount) { balance += amount; return balance; },
    getBalance() { return balance; },
  };
}

const acct = createAccount(100);
acct.deposit(50);    // 150
acct.balance;        // undefined — not accessible directly
```

### 2. Function factories

```js
const multiplier = (factor) => (x) => x * factor;

const double = multiplier(2);
const triple = multiplier(3);
double(5); // 10
triple(5); // 15
```

### 3. Memoization

```js
function memoize(fn) {
  const cache = new Map();
  return (n) => {
    if (!cache.has(n)) cache.set(n, fn(n));
    return cache.get(n);
  };
}
```

### 4. Callbacks and event handlers

```js
function setupButton(button, message) {
  button.addEventListener('click', () => {
    console.log(message); // `message` captured by closure
  });
}
```

Closures also power **debounce/throttle**, **currying**, **once()**, React hooks, and the **module pattern**.

## Classic pitfall: `var` in loops

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i)); // 3, 3, 3
}

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i)); // 0, 1, 2
}
```

With `var`, all callbacks share one `i`. `let` creates a new binding per iteration.

## Things to watch out for

- **Memory**: long-lived closures (listeners, intervals, caches) keep captured data alive. Remove listeners and clear timers when done.
- **Stale values**: in frameworks like React, a closure may capture an outdated value of state ("stale closure").

## Summary

- A closure is a function that remembers the variables of the scope where it was defined.
- It enables private state, function factories, memoization and stateful callbacks.
- Closures capture live variables (not copies), and each outer call creates a separate closure.
