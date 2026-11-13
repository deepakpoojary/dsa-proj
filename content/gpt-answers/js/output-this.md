It returns `'obj'`, `'undefined'`, `'obj'`, and then throws a **`TypeError`**. The value of `this` in a regular function depends on **how the function is called**, while an arrow function has no `this` of its own and **inherits it from the surrounding scope** where it was defined.

## The snippet

```js
const obj = {
  name: 'obj',
  regular() { return this.name; },
  arrow: () => typeof this,
  nested() { return [1].map(() => this.name)[0]; },
};
obj.regular(); // 'obj'
obj.arrow();   // 'undefined' (ES module top-level this)
obj.nested();  // 'obj'
const f = obj.regular;
f();           // TypeError (this is undefined)
```

## Walkthrough

### 1. `obj.regular()` → `'obj'`

`regular` is a normal method called with **dot notation**. This is *implicit binding*: `this` is the object before the dot, `obj`. So `this.name` is `'obj'`.

### 2. `obj.arrow()` → `'undefined'`

Arrow functions **don't get their own `this`**. They capture `this` lexically from where they're *defined*, not where they're called. The arrow is defined inside an **object literal**, and an object literal does **not** create a new scope for `this`, so `this` comes from the top level of the module/script.

- In an **ES module**, top-level `this` is `undefined` → `typeof this` is `'undefined'`.
- In a **classic browser script**, top-level `this` is `window` → `'object'`.
- In a **Node CommonJS** file, top-level `this` is `module.exports` (`{}`) → `'object'`.

The snippet assumes an ES module, hence `'undefined'`. The key point: it's **never** `obj`.

### 3. `obj.nested()` → `'obj'`

`nested` is a regular method called as `obj.nested()`, so inside it `this === obj`. The arrow callback passed to `map` inherits `this` from `nested`, so `this.name` is `'obj'`. `map` returns `['obj']`, and `[0]` gives `'obj'`.

(Had the callback been a regular `function`, `this` would be `undefined` in strict mode and it would throw.)

### 4. `f()` → `TypeError`

```js
const f = obj.regular; // copies the function reference only
f();                   // called with no object before the dot
```

Assigning the method to a variable **loses the binding**. A plain function call uses *default binding*: `this` is `undefined` in strict mode (which ES modules and classes always are). Accessing `undefined.name` throws:

```js
// TypeError: Cannot read properties of undefined (reading 'name')
```

In non-strict (sloppy) scripts, `this` would be `globalThis`, so it would return `window.name` (often `''`) instead of throwing.

## Final output

```js
obj.regular(); // 'obj'
obj.arrow();   // 'undefined'
obj.nested();  // 'obj'
f();           // TypeError: Cannot read properties of undefined (reading 'name')
```

## How to fix the lost `this`

```js
const bound = obj.regular.bind(obj);
bound();                    // 'obj'

obj.regular.call(obj);      // 'obj'

const g = () => obj.regular();
g();                        // 'obj'

// Common real-world case: passing methods as callbacks
setTimeout(obj.regular, 0);              // loses this
setTimeout(() => obj.regular(), 0);      // keeps it
```

## Rules for `this` (in priority order)

| Call style | `this` value |
|---|---|
| `new Fn()` | The newly created object |
| `fn.call(x)` / `fn.apply(x)` / `fn.bind(x)()` | `x` (explicit binding) |
| `obj.fn()` | `obj` (implicit binding) |
| `fn()` | `undefined` in strict mode, `globalThis` in sloppy mode |
| Arrow function | Inherited from the enclosing scope; `call`/`bind` can't change it |

## Summary

- Regular functions get `this` from the **call site**; arrow functions take it from the **definition site**.
- An arrow defined directly in an object literal does **not** see the object.
- Detaching a method (`const f = obj.regular`) loses `this`, causing a `TypeError` in strict mode.
- Output: `'obj'`, `'undefined'`, `'obj'`, `TypeError`.
