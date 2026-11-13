Private class fields are declared with a `#` prefix (like `#count`) and can **only be accessed from code inside the class body**. Unlike the `_underscore` convention, the privacy is enforced by the JavaScript engine itself: trying to access them from outside is a `SyntaxError`.

## Basic example

```js
class Counter {
  #count = 0;                 // private instance field
  static #instances = 0;      // private static field

  constructor() {
    Counter.#instances++;
  }

  inc() {
    return ++this.#count;     // accessible inside the class
  }

  get value() {
    return this.#count;
  }

  static isCounter(o) {
    return #count in o;       // brand check
  }
}

const c = new Counter();
c.inc();
c.inc();
console.log(c.value);                 // 2
console.log(Counter.isCounter(c));    // true
console.log(Counter.isCounter({}));   // false

// console.log(c.#count); // SyntaxError: Private field '#count' must be declared in an enclosing class
console.log(c['#count']);   // undefined - '#count' string is just a normal key
```

## What can be private

```js
class BankAccount {
  #balance = 0;                       // private field
  static #rate = 0.05;                // private static field

  #log(msg) {                         // private method
    console.log(`[account] ${msg}`);
  }

  get #formatted() {                  // private getter
    return `$${this.#balance.toFixed(2)}`;
  }

  static #validate(amount) {          // private static method
    if (amount <= 0) throw new RangeError('Amount must be positive');
  }

  deposit(amount) {
    BankAccount.#validate(amount);
    this.#balance += amount;
    this.#log(`Deposited ${amount}, balance ${this.#formatted}`);
  }
}

new BankAccount().deposit(100); // [account] Deposited 100, balance $100.00
```

## Key rules

- Private names **must be declared** in the class body before use; you can't add `this.#x` dynamically.
- They're accessible from **any instance** of the same class inside the class body (e.g. `other.#balance` in an `equals(other)` method).
- Accessing a private field on an object that doesn't have it throws a `TypeError`.
- The **`#field in obj`** check (ES2022) safely tests whether an object has that private field, without throwing.
- Private fields are **not inherited as accessible names**: a subclass can't read `this.#count` declared in the parent (it's a SyntaxError in the subclass body). Expose a protected-style getter if needed.

```js
class Parent {
  #secret = 42;
  reveal() { return this.#secret; }
}

class Child extends Parent {
  // peek() { return this.#secret; } // SyntaxError
}

console.log(new Child().reveal()); // 42 - works via the parent's method
```

## They're invisible to reflection

```js
class User {
  #password = 'hunter2';
  name = 'Ann';
}

const u = new User();
console.log(Object.keys(u));       // ["name"]
console.log(JSON.stringify(u));    // {"name":"Ann"}
console.log(Reflect.ownKeys(u));   // ["name"]
```

## Comparison with other approaches

| Approach | Truly private at runtime? | Notes |
| --- | --- | --- |
| `_name` convention | No | Just a naming hint |
| TypeScript `private` | No | Compile-time only; visible in emitted JS |
| Closures / `WeakMap` | Yes | Works pre-ES2022 but is verbose |
| `#private` fields | Yes | Language-enforced, fast, concise |

## Gotchas

- **Proxies**: methods that touch `this.#x` fail when called through a `Proxy`, because the proxy object itself doesn't have the private field.

```js
const p = new Proxy(new Counter(), {});
// p.inc(); // TypeError: Cannot read private member #count from an object whose class did not declare it
```

- Private fields can't be accessed with bracket notation or computed names.
- Debuggers/DevTools can show them, but your code can't reach them from outside.

## Summary

- Use `#name` for fields, methods, accessors and statics that only the class body can access.
- Privacy is enforced by the engine (SyntaxError outside), unlike `_name` or TypeScript `private`.
- Use `#field in obj` for brand checks; remember private fields aren't visible to subclasses, `Object.keys`, JSON or Proxies.
