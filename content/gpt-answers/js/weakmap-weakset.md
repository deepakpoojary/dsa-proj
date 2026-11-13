A **`Set`** is a collection of **unique values** of any type, kept in insertion order. **`WeakMap`** and **`WeakSet`** are "weak" versions of `Map` and `Set`: they only accept **objects** (or non-registered symbols) as keys/values and hold them **weakly**, meaning an entry doesn't stop its key from being garbage-collected. When nothing else references the object, the entry disappears automatically.

## `Set` — unique values

```js
const tags = new Set(['js', 'css', 'js']);
console.log(tags);        // Set(2) { 'js', 'css' }

tags.add('html');
tags.has('css');          // true
tags.delete('css');       // true
tags.size;                // 2

for (const t of tags) console.log(t); // 'js', 'html'

// Remove duplicates from an array
[...new Set([1, 1, 2, 3, 3])]; // [1, 2, 3]
```

- Uses **SameValueZero** equality: `NaN` equals `NaN`; objects compare by reference.
- Iterable, ordered, with `size`.

### ES2025 Set methods

```js
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);

a.union(b);               // Set {1, 2, 3, 4}
a.intersection(b);        // Set {2, 3}
a.difference(b);          // Set {1}
a.symmetricDifference(b); // Set {1, 4}
a.isSubsetOf(new Set([1, 2, 3, 4])); // true
a.isDisjointFrom(new Set([9]));      // true
```

## `WeakMap` — object keys, weakly held

```js
const wm = new WeakMap();
let user = { name: 'Ann' };

wm.set(user, { visits: 1 });
wm.get(user);   // { visits: 1 }
wm.has(user);   // true

user = null;
// The { name: 'Ann' } object is now unreachable, so the engine
// can garbage-collect it AND its WeakMap entry.
```

- Keys must be **objects** or **non-registered symbols** (ES2023); `wm.set('a', 1)` throws `TypeError`.
- Values can be anything and are held strongly *as long as the key is alive*.
- Methods: `set`, `get`, `has`, `delete` only.

## `WeakSet` — weakly held set of objects

```js
const visited = new WeakSet();

function visit(node) {
  if (visited.has(node)) return;  // avoid cycles / double processing
  visited.add(node);
  // ...process node
}
```

- Only objects (or non-registered symbols) can be added.
- Methods: `add`, `has`, `delete`.

## Why are weak collections not iterable?

Because entries can vanish at any moment when the garbage collector runs, there's no reliable way to list them or count them. So `WeakMap` and `WeakSet` have **no `size`, no `keys()`/`values()`, no `forEach`, and can't be used with `for...of`**.

## Comparison

| Feature | `Map` | `WeakMap` | `Set` | `WeakSet` |
| --- | --- | --- | --- | --- |
| Stores | Key → value | Key → value | Values | Values |
| Allowed keys/values | Any | Objects / non-registered symbols | Any | Objects / non-registered symbols |
| Holds references | Strongly | Weakly (keys) | Strongly | Weakly |
| Iterable | Yes | No | Yes | No |
| `size` | Yes | No | Yes | No |
| Prevents GC | Yes | No | Yes | No |

## Real-world use cases

### 1. Private data per object

```js
const privateData = new WeakMap();

class Person {
  constructor(name, ssn) {
    this.name = name;
    privateData.set(this, { ssn });
  }
  getMaskedSsn() {
    return '***-**-' + privateData.get(this).ssn.slice(-4);
  }
}
// When a Person instance is collected, its private data goes too.
```

(Modern code often uses `#private` fields instead.)

### 2. Caching / memoisation keyed by objects without leaks

```js
const cache = new WeakMap();

function computeExpensive(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = /* heavy work */ Object.keys(obj).length;
  cache.set(obj, result);
  return result;
}
```

With a regular `Map`, every object ever passed in would stay in memory forever.

### 3. Metadata on DOM nodes

```js
const clickCounts = new WeakMap();
button.addEventListener('click', () => {
  clickCounts.set(button, (clickCounts.get(button) ?? 0) + 1);
});
// If the button is removed from the DOM and dereferenced, the data is freed.
```

### 4. Tracking objects (WeakSet)

Marking objects as "already processed", detecting circular references in deep clone or serialisation, or branding instances created by a factory.

## Summary

- `Set`: unique values, iterable, has `size`, plus ES2025 set operations.
- `WeakMap`/`WeakSet`: object keys held **weakly**, so entries don't prevent garbage collection.
- Weak collections aren't iterable and have no `size`; use them for private data, caches and metadata keyed by objects.
