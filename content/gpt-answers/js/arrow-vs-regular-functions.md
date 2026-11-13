Arrow functions (`() => {}`), introduced in ES6, are a more concise function syntax, but they're not just shorthand: they have **no own `this`, `arguments`, `super` or `new.target`**, and they **can't be used as constructors**. Regular functions get all of these, with `this` determined by how they're called.

## Syntax

```js
// Regular function
function add(a, b) {
  return a + b;
}

// Arrow function
const addArrow = (a, b) => a + b;   // implicit return

const square = x => x * x;          // single param: parens optional
const greet = () => 'Hello';        // no params
const makeUser = (name) => ({ name }); // returning an object literal needs ()
const process = (x) => {            // block body needs explicit return
  const y = x * 2;
  return y + 1;
};
```

## Key differences

| Feature | Regular function | Arrow function |
| --- | --- | --- |
| `this` | Dynamic — depends on call site | Lexical — from enclosing scope |
| `arguments` object | Yes | No (use rest `...args`) |
| Can be a constructor (`new`) | Yes | No — `TypeError` |
| `prototype` property | Yes | No |
| `call`/`apply`/`bind` change `this` | Yes | No |
| `super`, `new.target` | Own | Inherited lexically |
| Hoisting (declaration form) | Fully hoisted | Follows variable (`const`/`let`) |
| Implicit return | No | Yes (concise body) |
| Can be a generator | Yes (`function*`) | No |
| Duplicate param names (sloppy) | Allowed | Never allowed |

## 1. `this` behavior (the big one)

```js
const counter = {
  count: 0,

  startRegular() {
    setTimeout(function () {
      console.log(this.count); // undefined — `this` is not counter
    }, 0);
  },

  startArrow() {
    setTimeout(() => {
      console.log(this.count); // 0 — inherits `this` from startArrow
    }, 0);
  },
};

counter.startRegular();
counter.startArrow();
```

Before arrows, people wrote `const self = this;` or used `.bind(this)` to solve this.

## 2. Arrow functions as object methods — a pitfall

```js
const user = {
  name: 'Ann',
  regular() { return this.name; },
  arrow: () => this.name,
};

user.regular(); // 'Ann'
user.arrow();   // undefined — `this` is the module/global scope, not user
```

## 3. No `arguments`

```js
function regular() {
  return arguments.length;
}
regular(1, 2, 3); // 3

const arrow = (...args) => args.length; // use rest parameters
arrow(1, 2, 3);   // 3
```

## 4. Not constructible

```js
function Person(name) { this.name = name; }
new Person('Ann'); // Person { name: 'Ann' }

const PersonArrow = (name) => { this.name = name; };
new PersonArrow('Ann'); // TypeError: PersonArrow is not a constructor
```

## 5. `bind`/`call` can't change `this`

```js
const arrow = () => this;
const obj = { x: 1 };

arrow.call(obj) === obj; // false
```

## 6. Hoisting

```js
sayHi();                       // works
function sayHi() { console.log('hi'); }

sayBye();                      // ReferenceError (TDZ)
const sayBye = () => console.log('bye');
```

## When to use each

**Use arrow functions for:**

- Callbacks: `array.map(x => x * 2)`, `promise.then(res => ...)`, `setTimeout`.
- Preserving the outer `this` inside methods and class components.
- Short, pure utility functions.

**Use regular functions for:**

- Object methods and prototype methods that rely on `this`.
- Constructors (or better, use `class`).
- DOM event handlers when you want `this` to be the element.
- Generators (`function*`).
- Top-level named functions where hoisting improves readability.

## Summary

- Arrow functions are concise and use **lexical `this`**; regular functions have **dynamic `this`**.
- Arrows lack `arguments`, `prototype` and constructor ability, and ignore `call`/`apply`/`bind` for `this`.
- Use arrows for callbacks; use regular functions (or class methods) for methods, constructors and generators.
