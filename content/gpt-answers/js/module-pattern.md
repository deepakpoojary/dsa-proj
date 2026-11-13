You create private variables by declaring them inside a **function scope** and returning only an object of functions (the **public API**) that close over them. Because nothing outside the function can reach that scope, the variables are truly private — they're accessible only through the returned closures. This is known as the **module pattern**.

## Basic module pattern

```js
const bank = (() => {
  let balance = 0;
  return {
    deposit: (n) => (balance += n),
    get balance() { return balance; },
  };
})();
bank.deposit(50); bank.balance; // 50
```

What's happening:

1. The IIFE runs once and creates a scope containing `balance`.
2. It returns an object whose methods are **closures** over `balance`.
3. After the IIFE finishes, `balance` is unreachable except through those methods.

```js
bank.balance = 1_000_000; // ignored — getter only, no setter
console.log(bank.balance); // 50
```

## A fuller example with validation

```js
const Cart = (function () {
  // Private state
  const items = [];

  // Private helper
  function calcTotal() {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  // Public API
  return {
    add(name, price, qty = 1) {
      if (price < 0) throw new Error('Invalid price');
      items.push({ name, price, qty });
    },
    get total() {
      return calcTotal();
    },
    get count() {
      return items.length;
    },
  };
})();

Cart.add('Book', 12, 2);
Cart.add('Pen', 3);
console.log(Cart.total); // 27
console.log(Cart.items); // undefined — private
```

## Revealing module pattern

Define everything privately, then "reveal" chosen members by reference. This keeps the return statement a clean summary of the API:

```js
const Logger = (function () {
  let logs = [];

  function log(msg) {
    logs.push(`${new Date().toISOString()} ${msg}`);
  }
  function history() {
    return [...logs]; // return a copy so callers can't mutate internal state
  }
  function clear() {
    logs = [];
  }

  return { log, history, clear };
})();

Logger.log('Started');
Logger.history(); // ['2026-... Started']
```

## Factory version (multiple instances)

Drop the IIFE and you get a **factory function** — each call creates independent private state:

```js
function createCounter(start = 0) {
  let count = start;
  return {
    increment: () => ++count,
    reset: () => (count = start),
    value: () => count,
  };
}

const a = createCounter();
const b = createCounter(10);
a.increment(); // 1
b.increment(); // 11
```

## Modern alternatives

### ES modules

Unexported bindings in a module file are private by default:

```js
// counter.js
let count = 0;                  // private to this module
export const increment = () => ++count;
export const getCount = () => count;
```

### Class private fields (`#`)

```js
class Account {
  #balance = 0;                 // truly private

  deposit(n) { this.#balance += n; }
  get balance() { return this.#balance; }
}

const acc = new Account();
acc.deposit(100);
acc.balance;  // 100
// acc.#balance; // SyntaxError
```

## Comparison

| Approach | Privacy | Multiple instances | Notes |
| --- | --- | --- | --- |
| Module pattern (IIFE) | Real (closure) | No (singleton) | Classic pre-ES6 approach |
| Factory function | Real (closure) | Yes | Methods recreated per instance |
| ES module | Real (module scope) | No (singleton) | Standard today |
| Class `#private` fields | Real (language-level) | Yes | Methods shared on prototype |

## Trade-offs

- Each closure-based instance creates its own copies of methods (more memory than prototype methods).
- Private state can't be inspected or extended by subclasses.
- Harder to unit-test private helpers directly — test via the public API.

## Summary

- Closures make variables private by keeping them in a function scope only the returned methods can reach.
- The module pattern uses an IIFE for a singleton; factory functions give multiple instances.
- Modern code achieves the same with ES modules and `#private` class fields.
