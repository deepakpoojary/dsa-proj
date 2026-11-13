`call`, `apply` and `bind` are methods on every function that let you explicitly set the value of `this`. **`call`** and **`apply`** invoke the function immediately (differing only in how arguments are passed), while **`bind`** returns a **new function** with `this` (and optionally some arguments) permanently fixed, to be called later.

## Quick comparison

| Method | Invokes immediately? | Arguments format | Returns |
| --- | --- | --- | --- |
| `call` | Yes | Individually: `fn.call(ctx, a, b)` | Function's result |
| `apply` | Yes | As an array: `fn.apply(ctx, [a, b])` | Function's result |
| `bind` | No | Individually (preset): `fn.bind(ctx, a)` | A new bound function |

Mnemonic: **A**pply takes an **A**rray; **C**all takes **C**ommas.

## `call`

```js
function introduce(greeting, punctuation) {
  return `${greeting}, I'm ${this.name}${punctuation}`;
}

const ann = { name: 'Ann' };

introduce.call(ann, 'Hello', '!'); // "Hello, I'm Ann!"
```

## `apply`

Same as `call`, but arguments are passed as an array (or array-like):

```js
introduce.apply(ann, ['Hi', '.']); // "Hi, I'm Ann."

// Classic use: spreading an array into a function (pre-ES6)
const nums = [5, 1, 9, 3];
Math.max.apply(null, nums); // 9

// Modern equivalent with spread
Math.max(...nums);          // 9
```

## `bind`

Returns a new function; nothing runs until you call it:

```js
const greetAnn = introduce.bind(ann, 'Hey');
greetAnn('?'); // "Hey, I'm Ann?"
```

### Fixing `this` in callbacks

```js
const counter = {
  count: 0,
  increment() {
    this.count++;
    console.log(this.count);
  },
};

setTimeout(counter.increment, 100);               // NaN or TypeError — `this` lost
setTimeout(counter.increment.bind(counter), 100); // 1
```

### Partial application

```js
function multiply(a, b) {
  return a * b;
}

const double = multiply.bind(null, 2);
const triple = multiply.bind(null, 3);

double(5); // 10
triple(5); // 15
```

## Practical use cases

### Method borrowing

```js
function listArgs() {
  // `arguments` is array-like, not an array
  return Array.prototype.slice.call(arguments);
}
listArgs(1, 2, 3); // [1, 2, 3]

// Modern alternatives: Array.from(arguments) or rest params (...args)
```

```js
const logger = {
  prefix: '[LOG]',
  log(msg) { console.log(this.prefix, msg); },
};
const errorLogger = { prefix: '[ERROR]' };

logger.log.call(errorLogger, 'Disk full'); // [ERROR] Disk full
```

### Calling a parent constructor (pre-class code)

```js
function Animal(name) {
  this.name = name;
}
function Dog(name, breed) {
  Animal.call(this, name); // run Animal with Dog's `this`
  this.breed = breed;
}
new Dog('Rex', 'Lab'); // { name: 'Rex', breed: 'Lab' }
```

## Important rules and gotchas

**A bound function can't be rebound:**

```js
function who() { return this.name; }
const bound = who.bind({ name: 'First' });

bound.call({ name: 'Second' });           // 'First'
bound.bind({ name: 'Third' })();          // 'First'
```

**`new` overrides `bind`'s `this`** (but keeps preset arguments):

```js
function Point(x, y) { this.x = x; this.y = y; }
const BoundPoint = Point.bind({ ignored: true }, 1);
new BoundPoint(2); // Point { x: 1, y: 2 }
```

**Arrow functions ignore all three for `this`:**

```js
const arrow = () => this;
arrow.call({ a: 1 }); // still the enclosing scope's `this`
```

**`null`/`undefined` as `thisArg`:** in strict mode `this` stays `null`/`undefined`; in sloppy mode it becomes `globalThis`.

## Summary

- `call(ctx, a, b)` and `apply(ctx, [a, b])` invoke immediately; they differ only in argument format.
- `bind(ctx, ...args)` returns a new function with `this` fixed and optional preset arguments.
- Bound functions can't be rebound (only `new` overrides them), and none of these change an arrow function's `this`.
