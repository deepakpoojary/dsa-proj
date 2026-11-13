**Getters and setters** are special methods that let you run code when a property is **read** (`get`) or **assigned** (`set`), while still accessing it with normal property syntax like `obj.prop` and `obj.prop = value`. They're called **accessor properties**.

## Basic syntax

### In object literals

```js
const user = {
  firstName: 'Ann',
  lastName: 'Lee',

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  },

  set fullName(value) {
    [this.firstName, this.lastName] = value.split(' ');
  },
};

console.log(user.fullName); // "Ann Lee" - no parentheses, getter runs
user.fullName = 'Bob Smith'; // setter runs
console.log(user.firstName); // "Bob"
console.log(user.lastName);  // "Smith"
```

### In classes

```js
class Temperature {
  #celsius = 0;

  get fahrenheit() {
    return this.#celsius * 9 / 5 + 32;
  }

  set fahrenheit(f) {
    this.#celsius = (f - 32) * 5 / 9;
  }

  get celsius() {
    return this.#celsius;
  }
}

const t = new Temperature();
t.fahrenheit = 212;
console.log(t.celsius);    // 100
console.log(t.fahrenheit); // 212
```

### With `Object.defineProperty`

```js
const account = { _balance: 0 };

Object.defineProperty(account, 'balance', {
  get() { return this._balance; },
  set(v) { this._balance = v; },
  enumerable: true,
});
```

## Common use cases

### 1. Validation

```js
class Person {
  #age = 0;

  get age() {
    return this.#age;
  }

  set age(value) {
    if (!Number.isInteger(value) || value < 0) {
      throw new RangeError('Age must be a non-negative integer');
    }
    this.#age = value;
  }
}

const p = new Person();
p.age = 30;   // OK
// p.age = -5; // RangeError: Age must be a non-negative integer
```

### 2. Computed / derived values

```js
class Rectangle {
  constructor(w, h) { this.w = w; this.h = h; }
  get area() { return this.w * this.h; } // always up to date
}

const r = new Rectangle(2, 3);
r.w = 10;
console.log(r.area); // 30
```

### 3. Lazy evaluation and caching

```js
const report = {
  get data() {
    const value = expensiveComputation();
    // Replace the getter with a plain value after the first access
    Object.defineProperty(this, 'data', { value, writable: false });
    return value;
  },
};
```

### 4. Read-only properties

A getter without a setter makes the property read-only.

```js
'use strict';
const circle = {
  radius: 2,
  get diameter() { return this.radius * 2; },
};

console.log(circle.diameter); // 4
circle.diameter = 10;         // TypeError: Cannot set property diameter which has only a getter
```

### 5. Stable public API

You can start with a plain property and later switch to a getter/setter (for logging, validation, reactivity) without changing any calling code.

## Getter/setter vs regular method

| | Getter / setter | Method |
| --- | --- | --- |
| Call syntax | `obj.total` / `obj.total = 5` | `obj.getTotal()` / `obj.setTotal(5)` |
| Arguments | Getter: none; setter: exactly one | Any |
| Expectation | Cheap, side-effect-free reads | Can do heavy work |
| Shows in `JSON.stringify` | Own enumerable getters do (value is computed) | No |

## Common pitfalls

- **Infinite recursion**: a setter that assigns to the same property name calls itself.

```js
const bad = {
  set name(v) {
    this.name = v; // calls the setter again -> RangeError: Maximum call stack size exceeded
  },
};
```

  Store the value in a different field (`#name` or `_name`).
- **Class getters live on the prototype**, so they're not own properties; `Object.keys(instance)` and spread won't include them.
- **Spread and `Object.assign` invoke getters** and copy the resulting value, not the accessor itself. Use `Object.getOwnPropertyDescriptors` to copy accessors.
- Keep getters fast and free of side effects; surprising work behind `obj.prop` hurts readability.

## Framework note

Vue 2's reactivity system was built on `Object.defineProperty` getters/setters to track reads and trigger updates on writes; Vue 3 switched to `Proxy`, which can also intercept added and deleted properties.

## Summary

- Getters (`get`) run on read and setters (`set`) run on assignment, using normal property syntax.
- Use them for validation, computed values, lazy caching and read-only properties.
- Avoid recursion by storing data in a separate (ideally `#private`) field.
