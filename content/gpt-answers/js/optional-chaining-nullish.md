**Optional chaining (`?.`)** safely accesses a property, index or method on a value that might be `null` or `undefined`, returning `undefined` instead of throwing. **Nullish coalescing (`??`)** provides a fallback value only when the left side is `null` or `undefined`. They're often used together: `user?.profile?.name ?? 'Anonymous'`.

## Optional chaining (`?.`)

```js
const user = {
  name: 'Ann',
  address: { city: 'Pune' },
  greet() { return 'hi'; },
};

// Without ?. — verbose guard
const zip1 = user && user.address && user.address.zip;

// With ?.
user.address?.city;      // 'Pune'
user.contact?.email;     // undefined (no TypeError)

// Three forms
user?.name;              // property access
user.tags?.[0];          // bracket / index access
user.greet?.();          // call only if the method exists -> 'hi'
user.goodbye?.();        // undefined (no "is not a function" error)
```

### Short-circuiting

If the part before `?.` is nullish, **the entire rest of the chain is skipped**:

```js
let obj = null;
let i = 0;
obj?.a.b.c[i++];   // undefined, and i is still 0
```

Note that `?.` only checks the value immediately before it. `user.contact?.email.toLowerCase()` is safe if `contact` is missing, but throws if `contact` exists and `email` is `undefined`.

## Nullish coalescing (`??`)

```js
null ?? 'default';       // 'default'
undefined ?? 'default';  // 'default'
0 ?? 42;                 // 0
'' ?? 'fallback';        // ''
false ?? true;           // false
```

### `??` vs `||`

`||` falls back on **any falsy** value (`0`, `''`, `false`, `NaN`, `null`, `undefined`); `??` only on **nullish** values. That matters when `0` or `''` are valid:

```js
const settings = { volume: 0, title: '' };

settings.volume || 50;   // 50  <- bug: 0 was a valid volume
settings.volume ?? 50;   // 0   <- correct

settings.title || 'Untitled'; // 'Untitled'
settings.title ?? 'Untitled'; // ''
```

| Left value `x` | Logical OR result | Nullish `??` result |
| --- | --- | --- |
| `null` | `'d'` | `'d'` |
| `undefined` | `'d'` | `'d'` |
| `0` | `'d'` | `0` |
| `''` | `'d'` | `''` |
| `false` | `'d'` | `false` |
| `NaN` | `'d'` | `NaN` |

## Using them together

```js
function getCity(user) {
  return user?.address?.city ?? 'Unknown city';
}

getCity(null);                        // 'Unknown city'
getCity({ address: {} });             // 'Unknown city'
getCity({ address: { city: 'Goa' } }); // 'Goa'

// Typical API response handling
const count = response?.data?.items?.length ?? 0;
```

## Logical assignment operators (ES2021)

```js
let config = { retries: 0, timeout: null };

config.retries ??= 3;    // stays 0 (not nullish)
config.timeout ??= 5000; // becomes 5000
config.name ||= 'app';   // assigns because undefined is falsy
config.debug &&= false;  // only assigns if debug is truthy
```

## Common pitfalls

- **Mixing `??` with `||` or `&&` without parentheses is a SyntaxError**:

```js
// const x = a || b ?? c;   // SyntaxError
const x = (a || b) ?? c;     // OK
```

- **You can't assign through `?.`**: `user?.name = 'Bob'` is a SyntaxError.
- **Don't overuse `?.`**: sprinkling it everywhere can hide bugs where a value *should* always exist.
- `?.` doesn't help with undeclared variables: `undeclaredVar?.x` still throws `ReferenceError`.

## Summary

- `a?.b`, `a?.[k]`, `fn?.()` return `undefined` instead of throwing when the left side is `null`/`undefined`, and short-circuit the rest of the chain.
- `a ?? b` falls back only on `null`/`undefined`, unlike `||` which treats `0`, `''` and `false` as missing.
- Combine them for safe defaults; use `??=` for default assignment.
