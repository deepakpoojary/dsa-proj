In JavaScript, `this` is determined by **how a function is called** (its call site), not where it's defined. The main exception is **arrow functions**, which don't have their own `this` and instead inherit it from the surrounding lexical scope.

## The four binding rules (plus arrows)

### 1. Default binding — plain function call

```js
function show() {
  return this;
}
show(); // undefined in strict mode / modules; globalThis in sloppy mode
```

### 2. Implicit binding — called as a method

`this` is the object **to the left of the dot** at call time.

```js
const user = {
  name: 'Ann',
  hi() { return this.name; },
};
user.hi();          // 'Ann'
const f = user.hi;
f();                // TypeError in strict mode (this is undefined)
f.call({ name: 'Bo' }); // 'Bo'
```

Assigning `user.hi` to `f` loses the object — calling `f()` is a plain call, so the default rule applies.

### 3. Explicit binding — `call`, `apply`, `bind`

```js
function intro(greeting) {
  return `${greeting}, I'm ${this.name}`;
}
const person = { name: 'Cleo' };

intro.call(person, 'Hi');      // "Hi, I'm Cleo"
intro.apply(person, ['Hey']);  // "Hey, I'm Cleo"

const bound = intro.bind(person);
bound('Hello');                // "Hello, I'm Cleo"
```

A function returned by `bind` is permanently bound; calling it with `call` or another `bind` won't change `this`.

### 4. `new` binding — constructor call

`new` creates a fresh object and sets `this` to it:

```js
function Car(model) {
  this.model = model;
}
const car = new Car('Tesla');
car.model; // 'Tesla'
```

### 5. Arrow functions — lexical `this`

Arrows capture `this` from where they're **defined**, and nothing (not even `call`/`bind`/`new`) can change it:

```js
const timer = {
  seconds: 0,
  start() {
    setInterval(() => {
      this.seconds++;   // `this` is timer, inherited from start()
    }, 1000);
  },
};
timer.start();
```

With a regular function callback, `this` would be `undefined` (or the global object) inside `setInterval`.

## Precedence

When multiple rules could apply, the order is:

| Priority | Rule | Example | `this` is |
| --- | --- | --- | --- |
| 1 | `new` | `new Foo()` | The new object |
| 2 | Explicit | `foo.call(obj)` / `bind(obj)` | `obj` |
| 3 | Implicit | `obj.foo()` | `obj` |
| 4 | Default | `foo()` | `undefined` (strict) / global |
| — | Arrow function | `() => this` | Enclosing scope's `this` |

## Other contexts

```js
// Top level
console.log(this); // browser script: window; ES module: undefined; Node CJS: module.exports

// DOM event listener (regular function)
button.addEventListener('click', function () {
  console.log(this === button); // true — this is event.currentTarget
});

// Class methods are strict
class Counter {
  count = 0;
  increment() { this.count++; }
}
const { increment } = new Counter();
increment(); // TypeError: Cannot read properties of undefined
```

## Common pitfall: losing `this` in callbacks

```js
class Button {
  label = 'Save';
  handleClick() {
    console.log(this.label);
  }
}

const btn = new Button();
setTimeout(btn.handleClick, 0);          // undefined/TypeError — this lost

// Fixes
setTimeout(() => btn.handleClick(), 0);  // arrow wrapper
setTimeout(btn.handleClick.bind(btn), 0); // bind

class Button2 {
  label = 'Save';
  handleClick = () => console.log(this.label); // arrow class field
}
```

## Quick checklist

1. Is the function an arrow? → use `this` of the enclosing scope.
2. Called with `new`? → the new object.
3. Called with `call`/`apply`/`bind`? → the provided object.
4. Called as `obj.method()`? → `obj`.
5. Otherwise → `undefined` in strict mode, `globalThis` in sloppy mode.

## Summary

- `this` depends on the call site: `new` > explicit binding > implicit (method) > default.
- Arrow functions ignore these rules and use lexical `this`.
- Passing methods as callbacks loses `this`; fix with `bind`, an arrow wrapper, or arrow class fields.
