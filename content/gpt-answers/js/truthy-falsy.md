In JavaScript, every value has an inherent boolean meaning when used in a boolean context (like an `if` statement). **Falsy** values convert to `false`; **truthy** values convert to `true`. There's a short, fixed list of falsy values — everything else is truthy.

## The falsy values

| Value | Type | Notes |
| --- | --- | --- |
| `false` | boolean | |
| `0` | number | |
| `-0` | number | |
| `0n` | bigint | BigInt zero |
| `''` (empty string) | string | Same for `""` and an empty template literal |
| `null` | null | |
| `undefined` | undefined | |
| `NaN` | number | |

(There's also the legacy browser oddity `document.all`, which is falsy for historical compatibility.)

## Everything else is truthy

Including some values that surprise people:

```js
Boolean('0');        // true  — non-empty string
Boolean('false');    // true  — non-empty string
Boolean(' ');        // true  — whitespace is not empty
Boolean([]);         // true  — empty array
Boolean({});         // true  — empty object
Boolean(function(){}); // true
Boolean(-1);         // true
Boolean(Infinity);   // true
Boolean(new Boolean(false)); // true — it's an object!
```

## Where truthiness is used

- `if`, `else if`, `while`, `do...while`, `for` conditions
- The ternary operator `cond ? a : b`
- Logical operators `!`, `&&`, `||`
- `Array.prototype.filter(Boolean)` and similar callbacks

```js
const name = '';

if (name) {
  console.log('Hello, ' + name);
} else {
  console.log('Name is empty'); // runs
}

// Remove falsy values from an array
[0, 1, '', 'a', null, undefined, NaN, 2].filter(Boolean);
// [1, 'a', 2]
```

## Logical operators return values, not booleans

`&&` and `||` return one of their **operands**, chosen based on truthiness:

```js
'hello' || 'default';  // 'hello' — first truthy
'' || 'default';       // 'default'
'a' && 'b';            // 'b'     — last value if all truthy
0 && 'b';              // 0       — first falsy

// Common patterns
const label = userInput || 'Untitled';
isLoggedIn && showDashboard();
```

## The `||` vs `??` gotcha

`||` falls back on **any** falsy value — including valid values like `0` or `''`. The nullish coalescing operator `??` only falls back on `null` or `undefined`.

```js
const count = 0;

const a = count || 10; // 10 — oops, 0 was valid
const b = count ?? 10; // 0  — correct

const title = '';
title || 'Untitled';   // 'Untitled'
title ?? 'Untitled';   // ''
```

## Converting explicitly

```js
Boolean('text'); // true
!!'text';        // true — double negation idiom
!!0;             // false
```

## Common pitfalls

- Checking arrays with `if (arr)` — an empty array is truthy. Use `if (arr.length)` instead.
- Checking objects with `if (obj)` — use `Object.keys(obj).length` to test emptiness.
- Using `||` for defaults when `0`, `false` or `''` are legitimate values — use `??`.
- `'0'` and `'false'` strings from forms/APIs are truthy.

## Summary

- Falsy: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, `NaN` — everything else is truthy.
- `[]`, `{}`, `'0'` and `'false'` are all truthy.
- Prefer `??` over `||` when `0` or empty strings are valid values.
