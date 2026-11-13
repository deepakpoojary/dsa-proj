`==` (**loose equality**) compares values after converting them to a common type, `===` (**strict equality**) compares both type and value without any conversion, and `Object.is` behaves like `===` except for two edge cases: `NaN` and signed zero.

## `==` — Loose equality

Before comparing, `==` applies **type coercion** using the Abstract Equality algorithm:

- `null` and `undefined` are equal to each other and to nothing else.
- If one side is a number and the other a string, the string is converted to a number.
- Booleans are converted to numbers (`true` → `1`, `false` → `0`).
- Objects are converted to primitives (via `valueOf` / `toString`) when compared to primitives.

```js
0 == '0';            // true  — '0' becomes 0
'' == 0;             // true  — '' becomes 0
false == '0';        // true  — both become 0
null == undefined;   // true
null == 0;           // false — null only equals undefined
[1] == 1;            // true  — [1] → '1' → 1
```

## `===` — Strict equality

`===` returns `true` only if both operands have the **same type and same value**. No conversions happen.

```js
0 === '0';           // false — different types
1 === 1;             // true
null === undefined;  // false
NaN === NaN;         // false — NaN is never equal to itself
0 === -0;            // true
```

## `Object.is` — Same-value equality

`Object.is(a, b)` (ES2015) uses the **SameValue** algorithm. It's identical to `===` except:

```js
Object.is(NaN, NaN); // true   (=== gives false)
Object.is(0, -0);    // false  (=== gives true)
Object.is(1, 1);     // true
Object.is('a', 'a'); // true
```

This makes it useful when you need mathematically precise identity, e.g. React uses `Object.is` to decide whether state changed.

## Comparison table

| Expression | `==` | `===` | `Object.is` |
| --- | --- | --- | --- |
| `0` vs `'0'` | true | false | false |
| `''` vs `0` | true | false | false |
| `null` vs `undefined` | true | false | false |
| `NaN` vs `NaN` | false | false | true |
| `0` vs `-0` | true | true | false |
| `{}` vs `{}` | false | false | false |

## Objects are compared by reference

All three compare objects (including arrays and functions) by **reference**, not by content:

```js
const a = { x: 1 };
const b = { x: 1 };
const c = a;

a === b;           // false — different objects
a === c;           // true  — same reference
Object.is(a, c);   // true
[1, 2] == [1, 2];  // false
```

To compare contents, use a deep-equality helper (e.g. `structuredClone` won't help — you need a recursive comparison or a library like Lodash's `isEqual`).

## Common pitfalls

- `==` produces surprising results: `[] == ![]` is `true`, `'\n' == 0` is `true`.
- `NaN === NaN` is `false`; use `Number.isNaN(x)` or `Object.is(x, NaN)` to detect it.
- `Array.prototype.includes` uses **SameValueZero** (like `Object.is` but `0` equals `-0`), so `[NaN].includes(NaN)` is `true`, while `indexOf` uses `===` and returns `-1`.

## When to use which

- **Use `===` by default** — it's predictable and readable.
- The one widely accepted use of `==` is `x == null`, which checks for both `null` and `undefined` in one go.
- Use **`Object.is`** when you specifically need to distinguish `-0` from `0` or treat `NaN` as equal to itself.

## Summary

- `==` coerces types, then compares — avoid it except for `x == null`.
- `===` compares type and value with no coercion — your default.
- `Object.is` is `===` plus correct handling of `NaN` and `-0`.
