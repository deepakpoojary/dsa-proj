A **property descriptor** is an object that describes the attributes of a single property: not just its value, but whether it can be changed, whether it shows up in loops, and whether it can be deleted or reconfigured. Every property on every JavaScript object has one.

## Two kinds of descriptors

### Data descriptors

| Attribute | Meaning | Default via assignment | Default via `defineProperty` |
| --- | --- | --- | --- |
| `value` | The property's value | (assigned value) | `undefined` |
| `writable` | Can the value be changed? | `true` | `false` |
| `enumerable` | Shows in `for...in`, `Object.keys`, JSON? | `true` | `false` |
| `configurable` | Can it be deleted or its descriptor changed? | `true` | `false` |

### Accessor descriptors

| Attribute | Meaning |
| --- | --- |
| `get` | Function called when the property is read |
| `set` | Function called when the property is written |
| `enumerable` | Same as above |
| `configurable` | Same as above |

A descriptor can't have both `value`/`writable` and `get`/`set`; that throws a `TypeError`.

## Reading descriptors

```js
const user = { name: 'Ann' };

console.log(Object.getOwnPropertyDescriptor(user, 'name'));
// { value: 'Ann', writable: true, enumerable: true, configurable: true }

console.log(Object.getOwnPropertyDescriptors(user));
// { name: { value: 'Ann', writable: true, enumerable: true, configurable: true } }
```

## Defining properties

```js
const product = {};

Object.defineProperty(product, 'id', {
  value: 101,
  // writable, enumerable, configurable all default to false
});

product.id = 999;               // silently ignored (TypeError in strict mode)
console.log(product.id);        // 101
console.log(Object.keys(product)); // [] - not enumerable
delete product.id;              // false - not configurable
```

Multiple at once:

```js
const point = Object.defineProperties({}, {
  x: { value: 1, writable: true, enumerable: true },
  y: { value: 2, writable: true, enumerable: true },
  magnitude: {
    get() { return Math.hypot(this.x, this.y); },
    enumerable: false,
  },
});

console.log(point.magnitude);   // 2.236...
console.log(JSON.stringify(point)); // {"x":1,"y":2}
```

## What each flag does in practice

### `writable: false`

```js
'use strict';
const obj = {};
Object.defineProperty(obj, 'PI', { value: 3.14, enumerable: true });
obj.PI = 3; // TypeError: Cannot assign to read only property 'PI'
```

### `enumerable: false`

Hidden from `for...in`, `Object.keys`, `Object.entries`, spread and `JSON.stringify`, but still accessible directly. Built-in methods like `Array.prototype.map` are non-enumerable, which is why they don't appear in `for...in` loops.

```js
const o = { visible: 1 };
Object.defineProperty(o, 'hidden', { value: 2 });

console.log(o.hidden);        // 2
console.log({ ...o });        // { visible: 1 }
console.log('hidden' in o);   // true
```

### `configurable: false`

- The property can't be deleted.
- Its descriptor can't be changed (with one exception: `writable` can still go from `true` to `false`).
- It's a one-way door: you can't make it configurable again.

```js
const cfg = {};
Object.defineProperty(cfg, 'mode', { value: 'prod', writable: true });

Object.defineProperty(cfg, 'mode', { enumerable: true });
// TypeError: Cannot redefine property: mode
```

## Real-world uses

- **Constants and read-only APIs** (`writable: false`).
- **Hiding internal/meta properties** from serialization and iteration (`enumerable: false`).
- **Computed properties** with getters/setters.
- **Copying objects including accessors**, which spread/`Object.assign` can't do:

```js
const clone = Object.defineProperties({}, Object.getOwnPropertyDescriptors(source));
```

- `Object.freeze` and `Object.seal` work by setting `writable`/`configurable` to `false` on every property.
- Libraries like Vue 2 used `defineProperty` getters/setters for reactivity.

## Summary

- Each property has a descriptor: `value`, `writable`, `enumerable`, `configurable` (data) or `get`, `set` (accessor).
- Read with `Object.getOwnPropertyDescriptor(s)`, define with `Object.defineProperty(ies)`.
- With `defineProperty`, omitted flags default to `false`, unlike normal assignment where they're all `true`.
