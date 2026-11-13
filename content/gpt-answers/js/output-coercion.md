The results are `''`, `'[object Object]'`, `'52'`, `3`, `2`, `true`, `false`, `true`. They all follow from JavaScript's **type coercion** rules: `+` prefers **string concatenation** if either operand becomes a string, other arithmetic operators convert to **numbers**, and `==` has its own special algorithm (especially for `null`).

## The snippet

```js
[] + [];        // ''
[] + {};        // '[object Object]'
'5' + 2;        // '52'
'5' - 2;        // 3
true + 1;       // 2
[] == ![];      // true
null == 0;      // false
null >= 0;      // true
```

## Background: how objects become primitives

When an object or array is used with an operator, JS calls **ToPrimitive**: it tries `valueOf()` (which returns the object itself for arrays/plain objects, so it's skipped) and then `toString()`:

```js
[].toString();        // ''
[1, 2].toString();    // '1,2'
({}).toString();      // '[object Object]'
```

## Walkthrough

### 1. `[] + []` → `''`

Both arrays convert to `''`. Since the operands are strings, `+` concatenates: `'' + ''` = `''`.

### 2. `[] + {}` → `'[object Object]'`

`[]` → `''`, `{}` → `'[object Object]'`. Concatenation gives `'[object Object]'`.

(Gotcha: typing `{} + []` at the start of a line in a console may print `0`, because `{}` is parsed as an empty **block** and the expression becomes `+[]`. Inside an expression like `console.log({} + [])` it's `'[object Object]'`.)

### 3. `'5' + 2` → `'52'`

With `+`, if either side is a string, the other is converted to a string: `'5' + '2'` = `'52'`.

### 4. `'5' - 2` → `3`

`-` is **only** numeric, so `'5'` is converted to `5`: `5 - 2` = `3`. The same applies to `*`, `/`, `%`, `**`.

### 5. `true + 1` → `2`

No strings involved, so both sides become numbers: `true` → `1`, giving `1 + 1` = `2`.

### 6. `[] == ![]` → `true`

Step by step:

1. `![]`: arrays are **truthy** (all objects are), so `![]` is `false`.
2. Now `[] == false`. When one side is a boolean, it's converted to a number: `false` → `0`.
3. `[] == 0`: the object is converted to a primitive: `[]` → `''`.
4. `'' == 0`: the string is converted to a number: `''` → `0`.
5. `0 == 0` → **`true`**.

So an array is "equal" to its own negation.

### 7. `null == 0` → `false`

Loose equality has a special rule: **`null` is only `==` to `null` and `undefined`**. It is *not* converted to a number for `==`, so `null == 0` is `false`.

### 8. `null >= 0` → `true`

Relational operators (`<`, `>`, `<=`, `>=`) **do** convert to numbers: `null` → `0`, so `0 >= 0` is `true`.

This creates the famous paradox:

```js
null > 0;   // false (0 > 0)
null == 0;  // false (special == rule)
null >= 0;  // true  (0 >= 0)
```

## Final output

```js
// ''
// '[object Object]'
// '52'
// 3
// 2
// true
// false
// true
```

## Coercion rules at a glance

| Operator | Behavior |
|---|---|
| `+` | If either operand (after ToPrimitive) is a string → concatenate; otherwise add numbers |
| `-`, `*`, `/`, `%` | Always convert to numbers |
| `==` | `null`/`undefined` only equal each other; booleans → numbers; objects → primitives; strings vs numbers → numbers |
| `===` | No coercion at all |
| `<`, `>`, `<=`, `>=` | Convert to primitives, then numbers (unless both are strings, then compared lexicographically) |
| `!` | Converts to boolean; only `false, 0, -0, 0n, '', null, undefined, NaN` are falsy |

## Best practices

- Use **`===` and `!==`** to avoid surprising `==` conversions.
- Convert explicitly: `Number(x)`, `String(x)`, `Boolean(x)`, template literals.
- Use `x == null` only as an intentional shorthand for `x === null || x === undefined`.

## Summary

- `+` concatenates as soon as a string appears (arrays/objects turn into strings first); other math operators convert to numbers.
- `[] == ![]` is `true` because both sides end up as `0`.
- `null == 0` is `false` but `null >= 0` is `true`, because `==` and relational operators use different rules.
