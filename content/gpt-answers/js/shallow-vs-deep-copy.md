A **shallow copy** duplicates only the top level of an object, so nested objects are still **shared by reference**; a **deep copy** recursively duplicates every level, so the copy is completely independent. The modern way to deep clone is `structuredClone()`.

## Shallow copy

Only the outer container is new. Any property that holds an object or array still points to the same nested object.

```js
const a = { n: 1, inner: { x: 1 } };
const shallow = { ...a };

shallow.n = 2;         // only affects the copy
shallow.inner.x = 99;  // affects BOTH - inner is shared

console.log(a.n);       // 1
console.log(a.inner.x); // 99
console.log(shallow.inner === a.inner); // true
```

Ways to make a shallow copy:

```js
// Objects
const o1 = { ...obj };
const o2 = Object.assign({}, obj);

// Arrays
const a1 = [...arr];
const a2 = arr.slice();
const a3 = Array.from(arr);
const a4 = arr.concat();
```

## Deep copy

Every nested level is duplicated, so changes to the copy never affect the original.

```js
const a = { n: 1, inner: { x: 1 } };
const deep = structuredClone(a);

deep.inner.x = 5;
console.log(a.inner.x); // 1 - original untouched
```

## How to deep clone

### 1. `structuredClone` (recommended)

Built into all modern browsers and Node 17+. It handles many types correctly, including circular references.

```js
const original = {
  date: new Date('2024-01-01'),
  tags: new Set(['js', 'web']),
  map: new Map([['a', 1]]),
  nested: { list: [1, 2, 3] },
};
original.self = original; // circular reference

const copy = structuredClone(original);
console.log(copy.date instanceof Date); // true
console.log(copy.tags.has('js'));       // true
console.log(copy.self === copy);        // true - cycle preserved
```

Limitations:

- Throws on **functions** and **DOM nodes**.
- Drops **class prototypes**: instances come back as plain objects (methods are lost).
- Doesn't copy getters/setters or property descriptors, and ignores Symbol keys.

### 2. `JSON.parse(JSON.stringify(obj))` (legacy trick)

```js
const data = { d: new Date(), u: undefined, f() {}, big: 1n };
// JSON.parse(JSON.stringify(data)); // TypeError: Do not know how to serialize a BigInt
```

Problems: drops `undefined`, functions and Symbols; turns `Date` into strings; turns `Map`/`Set` into `{}`; `NaN`/`Infinity` become `null`; throws on cycles and BigInt. Only safe for plain JSON-compatible data.

### 3. Custom recursive clone

Useful in interviews or when you need to preserve prototypes:

```js
function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value; // primitives & functions
  if (seen.has(value)) return seen.get(value);                   // handle cycles

  if (value instanceof Date) return new Date(value);
  if (value instanceof RegExp) return new RegExp(value);
  if (value instanceof Map) {
    const m = new Map();
    seen.set(value, m);
    value.forEach((v, k) => m.set(deepClone(k, seen), deepClone(v, seen)));
    return m;
  }
  if (value instanceof Set) {
    const s = new Set();
    seen.set(value, s);
    value.forEach((v) => s.add(deepClone(v, seen)));
    return s;
  }

  const copy = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
  seen.set(value, copy);
  for (const key of Reflect.ownKeys(value)) {
    copy[key] = deepClone(value[key], seen);
  }
  return copy;
}
```

### 4. Libraries

`lodash.cloneDeep` is battle-tested and handles many edge cases.

## Comparison

| Method | Depth | Dates / Map / Set | Cycles | Functions | Keeps prototype |
| --- | --- | --- | --- | --- | --- |
| Spread / `Object.assign` | Shallow | Shared refs | n/a | Copied (by ref) | No (spread) |
| `JSON` round-trip | Deep | Broken | Throws | Dropped | No |
| `structuredClone` | Deep | Yes | Yes | Throws | No |
| `lodash.cloneDeep` | Deep | Yes | Yes | Kept by ref | Yes |

## Summary

- Shallow copy = new outer object, shared nested objects; deep copy = fully independent.
- Use spread/`Object.assign` for shallow copies and `structuredClone` for deep copies.
- Avoid the JSON trick except for plain JSON data; write a custom clone or use lodash when you need prototypes or functions preserved.
