A **`Proxy`** wraps an object (the *target*) and lets you intercept and customise fundamental operations on it — reading, writing, deleting properties, `in` checks, function calls — through handler functions called **traps**. **`Reflect`** is a built-in object with static methods that perform those same operations with their *default* behaviour, so traps can easily forward to the original logic.

## Basic syntax

```js
const proxy = new Proxy(target, handler);
```

- **target**: the original object (or function) being wrapped.
- **handler**: an object whose methods (traps) intercept operations.

## Example: validation and default values

```js
const user = new Proxy({}, {
  set(t, key, val) {
    if (key === 'age' && !Number.isInteger(val)) throw new TypeError('age must be an int');
    return Reflect.set(t, key, val);
  },
  get: (t, key) => (key in t ? Reflect.get(t, key) : 'N/A'),
});

user.name = 'Ann';
user.age = 30;
console.log(user.name);  // 'Ann'
console.log(user.email); // 'N/A'  (default for missing keys)
user.age = 'thirty';     // TypeError: age must be an int
```

## Common traps

| Trap | Intercepts | Matching `Reflect` method |
| --- | --- | --- |
| `get` | `obj.prop`, `obj[key]` | `Reflect.get` |
| `set` | `obj.prop = val` | `Reflect.set` |
| `has` | `key in obj` | `Reflect.has` |
| `deleteProperty` | `delete obj.prop` | `Reflect.deleteProperty` |
| `ownKeys` | `Object.keys`, `for...in` | `Reflect.ownKeys` |
| `defineProperty` | `Object.defineProperty` | `Reflect.defineProperty` |
| `apply` | Calling a function | `Reflect.apply` |
| `construct` | `new Fn()` | `Reflect.construct` |
| `getPrototypeOf` | `Object.getPrototypeOf` | `Reflect.getPrototypeOf` |

There are 13 traps in total, and `Reflect` has a matching method for each one.

## Why use `Reflect`?

Inside a trap you usually want to "do the normal thing" after your custom logic. `Reflect` does that cleanly:

- Returns **booleans** instead of throwing (`Reflect.set` returns `true`/`false`), which is exactly what `set`/`deleteProperty` traps must return.
- Correctly passes the **`receiver`**, so getters/setters on prototypes see the right `this`.

```js
const handler = {
  get(target, key, receiver) {
    console.log(`reading ${String(key)}`);
    return Reflect.get(target, key, receiver); // preserves getter `this`
  },
};
```

## Practical use cases

### Negative array indexes

```js
const arr = new Proxy([10, 20, 30], {
  get(t, key, r) {
    const i = Number(key);
    if (Number.isInteger(i) && i < 0) return t[t.length + i];
    return Reflect.get(t, key, r);
  },
});
arr[-1]; // 30
```

### Logging / change tracking (the idea behind reactivity)

```js
function reactive(obj, onChange) {
  return new Proxy(obj, {
    set(t, key, val, r) {
      const old = t[key];
      const ok = Reflect.set(t, key, val, r);
      if (old !== val) onChange(key, old, val);
      return ok;
    },
  });
}

const state = reactive({ count: 0 }, (k, o, n) => console.log(`${k}: ${o} -> ${n}`));
state.count++; // count: 0 -> 1
```

**Vue 3** and **MobX** use proxies for their reactivity systems.

### Read-only view

```js
const readOnly = (obj) => new Proxy(obj, {
  set() { throw new Error('Read-only'); },
  deleteProperty() { throw new Error('Read-only'); },
});
```

## Proxy vs `Object.defineProperty`

| | `Proxy` | `Object.defineProperty` getters/setters |
| --- | --- | --- |
| Detects new properties | Yes | No (must be defined up front) |
| Detects deletions | Yes | No |
| Works on arrays (index, length) | Yes | Awkward |
| Wraps / replaces original | Returns a new object | Mutates the original |

This is why Vue 3 switched from `defineProperty` (Vue 2) to `Proxy`.

## Limitations and pitfalls

- **Performance overhead**: every operation goes through a trap; avoid proxies in hot loops.
- **Private `#fields` and internal slots**: methods of `Map`, `Set`, `Date` or classes with `#private` fields fail when called on a proxy because `this` is the proxy, not the target.
- **Identity**: `proxy !== target`.
- **Invariants**: traps must respect certain rules (e.g. can't report a non-configurable property as missing), otherwise a `TypeError` is thrown.
- `Proxy.revocable()` creates a proxy you can later disable.

## Summary

- `Proxy` intercepts object operations via traps like `get`, `set`, `has`, `deleteProperty` and `apply`.
- `Reflect` exposes the default behaviour of each operation, ideal for forwarding from traps.
- Used for validation, defaults, logging and reactivity — but adds overhead and doesn't play well with private fields.
