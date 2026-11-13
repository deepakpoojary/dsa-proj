**Destructuring** is a syntax for unpacking values from arrays or properties from objects into distinct variables in a single statement. **Array destructuring** works by **position**, while **object destructuring** works by **property name**.

## Array destructuring

Values are assigned by index. It works with **any iterable** (arrays, strings, Sets, Maps, generators).

```js
const colors = ['red', 'green', 'blue', 'yellow'];

const [first, second] = colors;    // 'red', 'green'
const [a, , c] = colors;           // skip with holes: 'red', 'blue'
const [head, ...tail] = colors;    // 'red', ['green', 'blue', 'yellow']
const [x, y, z, w, v = 'none'] = colors; // v = 'none' (default)

const [ch1, ch2] = 'hi';           // 'h', 'i'
```

### Swapping variables without a temp

```js
let p = 1, q = 2;
[p, q] = [q, p];
console.log(p, q); // 2 1
```

### Returning multiple values

```js
function minMax(arr) {
  return [Math.min(...arr), Math.max(...arr)];
}
const [min, max] = minMax([4, 9, 1]); // 1, 9
```

## Object destructuring

Values are matched by **key name**; order doesn't matter.

```js
const user = { name: 'Ann', age: 28, address: { city: 'Pune' } };

const { name, age } = user;               // 'Ann', 28
const { name: userName } = user;          // rename: userName = 'Ann'
const { role = 'guest' } = user;          // default: 'guest'
const { name: n = 'Anon' } = user;        // rename + default
const { address: { city } } = user;       // nested: city = 'Pune'
const { name: _, ...rest } = user;        // rest: { age, address }
```

### Computed keys

```js
const key = 'age';
const { [key]: value } = user; // value = 28
```

## Destructuring in function parameters

Very common for "options objects" and React props:

```js
function createUser({ name, role = 'user', active = true } = {}) {
  return `${name} (${role}) active=${active}`;
}

createUser({ name: 'Ann' });    // 'Ann (user) active=true'
createUser();                    // 'undefined (user) active=true' — no crash thanks to = {}

// React
function Card({ title, children, ...props }) { /* ... */ }

// Iterating entries
for (const [key, val] of Object.entries({ a: 1, b: 2 })) {
  console.log(key, val); // a 1, b 2
}
```

## Array vs object destructuring

| Aspect | Array | Object |
| --- | --- | --- |
| Matches by | Position (index) | Property name |
| Works on | Any iterable | Any value (converted to object) |
| Rename | Just pick any variable name | `{ key: newName }` |
| Skip items | Empty slots `[a, , c]` | Just omit the key |
| Rest | `[a, ...rest]` → array | `{ a, ...rest }` → object |

## Common pitfalls

- **Defaults apply only for `undefined`**, not `null`:

```js
const { size = 10 } = { size: null };
console.log(size); // null
```

- **Destructuring `null`/`undefined` throws**:

```js
const { id } = null; // TypeError: Cannot destructure property 'id' of 'null'
// Guard: const { id } = maybeObj ?? {};
```

- **Assigning to existing variables** with object patterns needs parentheses, otherwise `{` is parsed as a block:

```js
let a, b;
({ a, b } = { a: 1, b: 2 }); // parentheses required
```

- **Nested destructuring doesn't create the parent variable**: in `const { address: { city } } = user`, only `city` is defined, not `address`.

## Summary

- Array destructuring is **positional** and works on any iterable; object destructuring is **by name**.
- Supports defaults (for `undefined` only), renaming, nesting, rest and use in parameters.
- Guard against `null`/`undefined` sources with `= {}` or `?? {}`.
