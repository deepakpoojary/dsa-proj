All three methods restrict how an object can be changed, at increasing levels of strictness: `Object.preventExtensions` stops **adding** properties, `Object.seal` also stops **deleting** them, and `Object.freeze` also stops **modifying** them.

## Quick comparison

| Operation | Normal | `preventExtensions` | `seal` | `freeze` |
| --- | --- | --- | --- | --- |
| Add new properties | Yes | No | No | No |
| Delete properties | Yes | Yes | No | No |
| Change existing values | Yes | Yes | Yes | No |
| Reconfigure properties (descriptors) | Yes | Yes | No | No |
| Check with | n/a | `Object.isExtensible` | `Object.isSealed` | `Object.isFrozen` |

## `Object.preventExtensions`

You can't add new properties, but you can modify and delete existing ones.

```js
const obj = { a: 1 };
Object.preventExtensions(obj);

obj.b = 2;     // ignored (TypeError in strict mode)
obj.a = 10;    // allowed
delete obj.a;  // allowed

console.log(obj);                   // {}
console.log(Object.isExtensible(obj)); // false
```

## `Object.seal`

Prevents adding and deleting properties, and makes all existing properties non-configurable. Values can still be changed if they're writable.

```js
const user = { name: 'Ann' };
Object.seal(user);

user.age = 30;      // ignored
delete user.name;   // ignored
user.name = 'Bob';  // allowed

console.log(user);                 // { name: 'Bob' }
console.log(Object.isSealed(user)); // true
```

## `Object.freeze`

The strictest: no adding, deleting, or changing. Every data property becomes non-writable and non-configurable.

```js
const config = { api: '/v1', retries: 3 };
Object.freeze(config);

config.api = '/v2';    // ignored
config.timeout = 500;  // ignored
delete config.retries; // ignored

console.log(config);                 // { api: '/v1', retries: 3 }
console.log(Object.isFrozen(config)); // true
```

## Strict mode throws, sloppy mode fails silently

```js
'use strict';
const frozen = Object.freeze({ x: 1 });
frozen.x = 2; // TypeError: Cannot assign to read only property 'x' of object
```

In ES modules and class bodies you're always in strict mode, so you'll see these errors.

## All three are shallow

They only affect the object itself, not nested objects.

```js
const settings = Object.freeze({
  theme: { color: 'dark' },
});

settings.theme.color = 'light'; // allowed - nested object isn't frozen
console.log(settings.theme.color); // "light"
```

To fully freeze, recurse:

```js
function deepFreeze(obj) {
  for (const key of Reflect.ownKeys(obj)) {
    const value = obj[key];
    if (value && (typeof value === 'object' || typeof value === 'function')) {
      deepFreeze(value);
    }
  }
  return Object.freeze(obj);
}

const s = deepFreeze({ theme: { color: 'dark' } });
s.theme.color = 'light'; // ignored
```

## `const` is not `freeze`

`const` prevents **reassigning the variable**, not mutating the object it points to.

```js
const arr = [1, 2];
arr.push(3);   // fine
// arr = [];   // TypeError: Assignment to constant variable

const frozenArr = Object.freeze([1, 2]);
// frozenArr.push(3); // TypeError: Cannot add property 2, object is not extensible
```

## Other notes

- These operations are **irreversible**: there's no "unfreeze". Make a copy instead.
- Frozen objects can still have **accessor properties** (getters/setters) that run code.
- Common uses: constants/enums, configuration objects, protecting shared state, and catching accidental mutations in development.

## Summary

- `preventExtensions`: no new properties.
- `seal`: no new or deleted properties; values can change.
- `freeze`: nothing can change. All three are shallow, and violations throw only in strict mode.
