A `bind` polyfill stores the original function and the preset arguments, then returns a new function that calls the original via `apply`, using the bound `this` and merging the preset arguments with the ones passed at call time. A complete version also handles the bound function being called with `new`.

## What `bind` must do

1. Return a **new function** (don't call the original yet).
2. Fix `this` to the provided `thisArg`.
3. Support **partial application**: preset arguments come first, call-time arguments after.
4. When invoked with `new`, **ignore** the bound `this` and create an instance whose prototype chain links to the original function's prototype.

## Basic polyfill

```js
Function.prototype.myBind = function (ctx, ...preset) {
  const fn = this;
  return function (...args) {
    return fn.apply(ctx, [...preset, ...args]);
  };
};
function greet(g, p) { return g + ' ' + this.name + p; }
greet.myBind({ name: 'Ann' }, 'Hi')('!'); // 'Hi Ann!'
```

How it works:

- Inside `myBind`, `this` is the function `myBind` was called on (`greet`), so we save it as `fn`.
- `preset` captures `'Hi'`; the returned function receives `'!'` as `args`.
- `fn.apply(ctx, [...])` invokes `greet` with `this = { name: 'Ann' }` and arguments `['Hi', '!']`.
- Closures keep `fn`, `ctx` and `preset` alive for later calls.

This covers ~90% of interview expectations. Interviewers often follow up with: *"What happens with `new`?"*

## Full polyfill (supports `new` and validates input)

```js
Function.prototype.myBind = function (ctx, ...preset) {
  if (typeof this !== 'function') {
    throw new TypeError('myBind must be called on a function');
  }

  const fn = this;

  function bound(...args) {
    // If called with `new`, `this` is an instance of `bound`:
    // ignore ctx and use the newly created object instead.
    const isNew = this instanceof bound;
    return fn.apply(isNew ? this : ctx, [...preset, ...args]);
  }

  // Link prototypes so instances created via `new bound()`
  // are also `instanceof fn`.
  if (fn.prototype) {
    bound.prototype = Object.create(fn.prototype);
  }

  return bound;
};
```

### Testing it

```js
// 1. Fixing `this`
const user = { name: 'Ann' };
function hello() { return `Hello, ${this.name}`; }
hello.myBind(user)(); // 'Hello, Ann'

// 2. Partial application
function sum(a, b, c) { return a + b + c; }
const add10 = sum.myBind(null, 10);
add10(5, 1); // 16

// 3. Losing `this` in callbacks — fixed
const counter = {
  count: 0,
  inc() { return ++this.count; },
};
const inc = counter.inc.myBind(counter);
inc(); // 1
inc(); // 2

// 4. Works with `new`
function Point(x, y) {
  this.x = x;
  this.y = y;
}
const BoundPoint = Point.myBind({ ignored: true }, 1);
const p = new BoundPoint(2);

console.log(p);                   // { x: 1, y: 2 }
console.log(p instanceof Point);  // true
console.log(p.ignored);           // undefined — bound ctx ignored under `new`
```

## ES5-compatible version (no rest/spread)

If the interviewer wants a "true" polyfill for old environments:

```js
Function.prototype.myBind = function (ctx) {
  var fn = this;
  var preset = Array.prototype.slice.call(arguments, 1);

  return function () {
    var args = Array.prototype.slice.call(arguments);
    return fn.apply(ctx, preset.concat(args));
  };
};
```

## Differences from native `bind`

| Behavior | Native `bind` | This polyfill |
| --- | --- | --- |
| Fixes `this` and presets args | Yes | Yes |
| Works with `new` | Yes | Yes (full version) |
| `name` property | `"bound greet"` | `"bound"` |
| `length` reflects remaining params | Yes | No (0) |
| Bound function has no `prototype` | Yes | No (we set one) |

These details rarely matter in interviews, but mentioning them shows depth. You could set `name`/`length` with `Object.defineProperty` if needed.

## Common mistakes

- Calling the function immediately instead of returning a new one.
- Forgetting to forward call-time arguments (only passing presets).
- Using an **arrow function** for `myBind` itself — then `this` wouldn't be the target function.
- Forgetting `return`, so the bound function's result is lost.

## Related follow-ups

```js
// call polyfill: temporarily attach fn as a unique property on ctx
Function.prototype.myCall = function (ctx, ...args) {
  ctx = ctx ?? globalThis;
  const key = Symbol('fn');
  ctx[key] = this;
  const result = ctx[key](...args);
  delete ctx[key];
  return result;
};
```

`apply` is the same, but accepts `args` as an array.

## Summary

- Save the target function (`this`), capture preset args, return a function that calls `fn.apply(ctx, [...preset, ...args])`.
- A full polyfill detects `new` (`this instanceof bound`) and links prototypes.
- Avoid arrow functions for the polyfill itself, and always forward and return correctly.
