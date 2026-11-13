**Primitives** (string, number, boolean, etc.) are copied **by value** — each variable gets its own independent copy. **Objects** (including arrays and functions) are accessed via a **reference**, so copying a variable copies the reference, and both variables point to the same object in memory.

## Primitives: copied by value

```js
let a = 10;
let b = a;   // b gets a copy of the value 10

b = 20;

console.log(a); // 10 — unaffected
console.log(b); // 20
```

Primitives are also **immutable** — operations always produce new values rather than changing existing ones.

## Objects: the reference is copied

```js
const user1 = { name: 'Ann' };
const user2 = user1;   // copies the reference, not the object

user2.name = 'Bo';

console.log(user1.name); // 'Bo' — same object!
console.log(user1 === user2); // true
```

Both variables are just two labels on one object.

## Passing to functions

JavaScript is **always pass-by-value**. For objects, the value being passed *is the reference*. This is often called **"call by sharing"**.

```js
function change(obj) {
  obj.a = 2;      // visible to caller
  obj = { a: 3 }; // only rebinds the local
}
const o = { a: 1 };
change(o);
o.a; // 2
```

- **Mutating** the parameter (`obj.a = 2`) affects the caller's object, because both share it.
- **Reassigning** the parameter (`obj = {...}`) only changes the local variable; the caller's reference is untouched.

With primitives, nothing the function does can affect the caller:

```js
function increment(n) {
  n++;
  return n;
}
let count = 5;
increment(count); // 6
console.log(count); // 5
```

## Comparison

| Aspect | Primitives | Objects |
| --- | --- | --- |
| Stored/copied as | The value itself | A reference to the object |
| Assignment `b = a` | Independent copy | Shared object |
| Mutable? | No | Yes |
| Equality (`===`) | Compares values | Compares references |
| Passed to functions | Copy of value | Copy of reference |

## Equality follows the same rule

```js
'hi' === 'hi';           // true — same value
{ x: 1 } === { x: 1 };   // false — different objects
[1, 2] === [1, 2];       // false
```

## `const` doesn't freeze objects

`const` prevents rebinding the variable, not mutating the object it refers to:

```js
const settings = { theme: 'dark' };
settings.theme = 'light'; // allowed
// settings = {};         // TypeError
```

## Making real copies

```js
const original = { name: 'Ann', address: { city: 'Paris' } };

// Shallow copies — top level only
const s1 = { ...original };
const s2 = Object.assign({}, original);
s1.address.city = 'Rome';
console.log(original.address.city); // 'Rome' — nested object still shared!

// Deep copy (modern, built-in)
const deep = structuredClone(original);
deep.address.city = 'Berlin';
console.log(original.address.city); // 'Rome' — independent

// Arrays
const arr = [1, 2, 3];
const copy = [...arr]; // or arr.slice(), Array.from(arr)
```

Note: `structuredClone` can't clone functions or DOM nodes; `JSON.parse(JSON.stringify(x))` loses `undefined`, functions, `Date` objects and more.

## Common pitfalls

- Accidentally mutating props/state shared across components (a classic React bug).
- Assuming spread creates a deep copy.
- Using `===` to compare object contents.

## Summary

- Primitives are copied by value; objects share a reference.
- JS always passes by value — for objects, that value is a reference ("call by sharing").
- Mutation is visible through every reference; reassignment is local. Use spread for shallow copies and `structuredClone` for deep copies.
