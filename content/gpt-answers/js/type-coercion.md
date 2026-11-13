**Type coercion** is the automatic or manual conversion of a value from one type to another (for example, string to number). JavaScript performs **implicit coercion** whenever an operator or statement receives a type it doesn't expect, and you can perform **explicit coercion** with functions like `Number()`, `String()` and `Boolean()`.

## Explicit vs implicit coercion

```js
// Explicit — you ask for the conversion
Number('42');     // 42
String(123);      // '123'
Boolean('');      // false
parseInt('42px'); // 42

// Implicit — the engine converts for you
'5' * 2;          // 10
'5' + 2;          // '52'
if ('hello') {}   // 'hello' → true
```

JavaScript only ever converts to **three target types**: **string**, **number** and **boolean**.

## String coercion

The `+` operator concatenates if **either** operand is a string:

```js
'3' + 4;        // '34'
3 + 4 + '5';    // '75'  (left to right: 7 + '5')
'5' + null;     // '5null'
`${[1, 2]}`;    // '1,2'
```

## Numeric coercion

Arithmetic operators other than `+` (`-`, `*`, `/`, `%`, `**`), unary `+`, and relational comparisons convert operands to numbers:

```js
'10' - 3;       // 7
'6' / '2';      // 3
+'42';          // 42
+true;          // 1
+'';            // 0
+'abc';         // NaN
+null;          // 0
+undefined;     // NaN
'10' > 9;       // true
```

## Boolean coercion

Happens in `if`, `while`, ternaries, `!`, `&&`, `||`. Only these values are **falsy**: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, `NaN`. Everything else is truthy.

```js
Boolean('0');   // true
Boolean([]);    // true
!!{};           // true
```

## Objects to primitives

When an object meets an operator, it's converted via **`Symbol.toPrimitive`**, then `valueOf()`, then `toString()` (the order depends on whether the "hint" is number or string):

```js
[] + [];        // ''               ([] → '')
[] + {};        // '[object Object]'
[5] * 2;        // 10               ([5] → '5' → 5)

const price = {
  [Symbol.toPrimitive](hint) {
    return hint === 'number' ? 99 : '$99';
  },
};
+price;         // 99
`${price}`;     // '$99'
```

## Coercion with `==`

Loose equality applies its own rules:

| Comparison | Rule | Result |
| --- | --- | --- |
| `null == undefined` | Special case | `true` |
| `null == 0` | null only equals undefined | `false` |
| `'1' == 1` | String → number | `true` |
| `true == 1` | Boolean → number | `true` |
| `[1] == 1` | Object → primitive → number | `true` |
| `[] == ![]` | `![]` is false → 0; `[]` → '' → 0 | `true` |

## Famous gotchas

```js
'5' - 2;          // 3
'5' + 2;          // '52'
true + true;      // 2
[] == false;      // true
null >= 0;        // true  (null → 0)
null == 0;        // false (== has special null rules)
NaN == NaN;       // false
```

## Best practices

- Use **`===`** to avoid `==` coercion surprises.
- Convert explicitly at boundaries (form inputs, query params): `Number(input.value)`.
- Use **`??`** instead of `||` when `0` or `''` are valid values.
- Validate with `Number.isNaN()` after numeric conversion.

## Summary

- Coercion converts values to string, number or boolean — implicitly (by operators) or explicitly (by you).
- `+` prefers strings; other math operators prefer numbers; conditions use truthy/falsy.
- Prefer `===` and explicit conversions to keep code predictable.
