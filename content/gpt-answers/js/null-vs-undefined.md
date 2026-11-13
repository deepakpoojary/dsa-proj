Both represent "no value", but **`undefined`** means a value has **not been assigned** (usually set by the JavaScript engine), while **`null`** means an **intentional absence of a value** (set explicitly by the developer).

## `undefined`

JavaScript gives you `undefined` automatically in several situations:

```js
let a;
console.log(a);            // undefined — declared but not assigned

const obj = { name: 'Ann' };
console.log(obj.age);      // undefined — missing property

function greet(name) {
  console.log(name);
}
greet();                   // undefined — missing argument

function noReturn() {}
console.log(noReturn());   // undefined — no return value

const [x] = [];
console.log(x);            // undefined — missing array element
```

## `null`

`null` never appears on its own — you (or an API) assign it deliberately to say "this is empty on purpose".

```js
let currentUser = null;        // no user logged in yet

document.querySelector('#nope'); // null — DOM API: element not found
'abc'.match(/z/);                // null — no regex match
```

## Key differences

| Aspect | `undefined` | `null` |
| --- | --- | --- |
| Meaning | Value not assigned | Intentionally empty |
| Set by | Engine (usually) | Developer / APIs |
| `typeof` | `"undefined"` | `"object"` (legacy bug) |
| Converts to number | `NaN` | `0` |
| Triggers default params | Yes | No |
| `JSON.stringify` | Property is omitted | Kept as `null` |

## Equality

```js
null == undefined;   // true  — loosely equal
null === undefined;  // false — different types
null == 0;           // false
undefined == 0;      // false
```

The `x == null` idiom is a concise way to check for **both** at once.

## Arithmetic behavior

```js
null + 1;       // 1    (null → 0)
undefined + 1;  // NaN  (undefined → NaN)
```

## Default parameters and destructuring

Defaults only apply when the value is `undefined`:

```js
function setVolume(level = 50) {
  return level;
}
setVolume(undefined); // 50
setVolume(null);      // null — default NOT applied

const { theme = 'light' } = { theme: null };
console.log(theme);   // null
```

## JSON serialization

```js
JSON.stringify({ a: undefined, b: null });
// '{"b":null}' — undefined properties are dropped
```

## Handling both safely

Modern operators treat `null` and `undefined` together as "nullish":

```js
const user = null;

user?.profile?.name;      // undefined — optional chaining, no error
const name = user ?? 'Guest'; // 'Guest' — nullish coalescing

let count = 0;
count ?? 10;  // 0  (?? only replaces null/undefined)
count || 10;  // 10 (|| replaces any falsy value)
```

## Best practices

- Don't assign `undefined` manually; use `null` to signal "intentionally empty".
- Check for both with `x == null` or `x ?? fallback`.
- Use `x === undefined` or `x === null` when you need to distinguish them.
- Remember `typeof null === 'object'` — never use `typeof` to detect `null`.

## Summary

- `undefined` = "not yet assigned" (engine default); `null` = "deliberately empty" (developer's choice).
- They're loosely equal (`==`) but not strictly equal (`===`).
- Default parameters and JSON treat them differently; `??` and `?.` handle both.
