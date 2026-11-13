Use a **`Map`** when you need a true key-value **collection** — especially with non-string keys, frequent additions and deletions, a reliable size, or guaranteed insertion order. Use a **plain object** for fixed-shape **records** (like a user with `name` and `age`) and data you'll serialise to JSON.

## Key differences

| Feature | `Map` | Plain object |
| --- | --- | --- |
| Key types | **Any** value: objects, functions, numbers, `NaN` | Strings and symbols only (others converted to strings) |
| Key order | Insertion order for all keys | Integer-like keys first (ascending), then strings in insertion order |
| Size | `map.size` | `Object.keys(obj).length` (O(n)) |
| Iteration | Directly iterable (`for...of`) | Needs `Object.keys/values/entries` |
| Inherited keys | None | Inherits from `Object.prototype` (e.g. `toString`) |
| Add/delete performance | Optimised for frequent changes | Optimised for fixed shapes |
| JSON support | No (convert first) | Native `JSON.stringify` |
| Syntax | `get`/`set`/`has`/`delete` | Dot/bracket notation, literals |

## 1. Keys of any type

```js
const userEl = document.querySelector('#user');
const clicks = new Map();
clicks.set(userEl, 0);              // DOM node as a key
clicks.set(userEl, clicks.get(userEl) + 1);
console.log(clicks.get(userEl));    // 1

// With an object, keys get stringified:
const obj = {};
const a = { id: 1 };
const b = { id: 2 };
obj[a] = 'first';
obj[b] = 'second';
console.log(obj); // { '[object Object]': 'second' } — collision!

const map = new Map([[a, 'first'], [b, 'second']]);
map.get(a); // 'first'

// Number keys stay numbers in a Map
const m = new Map([[1, 'num'], ['1', 'str']]);
m.size; // 2 (an object would have only one key '1')
```

## 2. Predictable ordering

```js
const o = { b: 1, 2: 'x', a: 2, 1: 'y' };
Object.keys(o); // ['1', '2', 'b', 'a'] — integer keys jump ahead

const mp = new Map([['b', 1], [2, 'x'], ['a', 2], [1, 'y']]);
[...mp.keys()]; // ['b', 2, 'a', 1] — pure insertion order
```

## 3. No prototype collisions

```js
const counts = {};
for (const w of ['apple', 'constructor']) {
  counts[w] = (counts[w] || 0) + 1;
}
console.log(counts.apple);       // 1
console.log(counts.constructor); // 'function Object() { [native code] }1' — inherited value got in the way

const safe = new Map();
safe.set('constructor', 1); // no problem
```

You can avoid this with `Object.create(null)`, but a `Map` is safer by default, especially with user-supplied keys (also avoiding `__proto__` pollution issues).

## 4. Built-in size and iteration

```js
const scores = new Map([['Ann', 90], ['Bob', 75]]);

scores.size;                          // 2
for (const [name, score] of scores) {
  console.log(`${name}: ${score}`);   // Ann: 90, Bob: 75
}
scores.has('Ann');                    // true
scores.delete('Bob');                 // true
```

## When a plain object is better

```js
// Fixed-shape record — clear, concise, JSON-friendly
const user = { id: 1, name: 'Ann', role: 'admin' };
JSON.stringify(user); // '{"id":1,"name":"Ann","role":"admin"}'

// Map needs conversion
const settings = new Map([['theme', 'dark']]);
JSON.stringify(settings);                    // '{}' — data lost!
JSON.stringify(Object.fromEntries(settings)); // '{"theme":"dark"}'
new Map(Object.entries({ theme: 'dark' }));  // object -> Map
```

Objects are also better for config objects, function options, API payloads and anything with methods or class-like structure.

## Quick decision guide

- Keys are **not strings** (objects, numbers you want kept as numbers)? → **Map**
- Keys come from **user input** or are unknown in advance? → **Map**
- Lots of **adding/removing** entries, caches, counters, lookups? → **Map**
- Need **`size`** or ordered iteration often? → **Map**
- Fixed set of known properties, JSON, destructuring? → **Object**
- Want keys to be garbage-collected with their objects? → **WeakMap**

## Summary

- `Map`: any key type, insertion order, `size`, direct iteration, no inherited keys, fast frequent updates.
- Object: best for fixed-shape records, JSON and concise syntax.
- Convert with `Object.fromEntries(map)` and `new Map(Object.entries(obj))`.
