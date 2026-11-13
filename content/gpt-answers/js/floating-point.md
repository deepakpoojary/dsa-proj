Because JavaScript stores all `number` values as **64-bit IEEE 754 binary floating-point** numbers, and decimals like `0.1` and `0.2` can't be represented exactly in binary. The tiny rounding errors add up, so `0.1 + 0.2` evaluates to `0.30000000000000004`.

```js
console.log(0.1 + 0.2);          // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3);  // false
```

## Why it happens

In base 10, `1/3` can't be written exactly (`0.3333...`). In base 2, the same problem hits fractions like `1/10`:

- `0.1` in binary is `0.0001100110011001100...` (repeating forever).
- A double has only **52 bits of mantissa**, so the value is rounded to the nearest representable number.
- `0.1` is actually stored as `0.1000000000000000055511151231257827...`
- `0.2` is stored as `0.2000000000000000111022302462515654...`
- Their sum rounds to a double that's slightly **above** the double closest to `0.3`.

```js
(0.1).toFixed(20);       // '0.10000000000000000555'
(0.1 + 0.2).toFixed(20); // '0.30000000000000004441'
(0.3).toFixed(20);       // '0.29999999999999998890'
```

This isn't a JavaScript bug — Python, Java, C and any language using IEEE 754 doubles behave the same way.

## How to compare floats safely

### Use a tolerance (epsilon)

```js
function nearlyEqual(a, b, epsilon = Number.EPSILON) {
  return Math.abs(a - b) < epsilon;
}

nearlyEqual(0.1 + 0.2, 0.3); // true
```

`Number.EPSILON` (≈ `2.22e-16`) is the gap between 1 and the next representable number. For larger values, scale the tolerance: `Math.abs(a - b) < Number.EPSILON * Math.max(Math.abs(a), Math.abs(b))`.

### Round to a fixed precision

```js
const sum = 0.1 + 0.2;
Number(sum.toFixed(2)) === 0.3;           // true
Math.round(sum * 100) / 100;              // 0.3
```

## Handling money

Never store currency as floating-point decimals. Instead:

```js
// Store integer cents
const priceCents = 1999;            // $19.99
const taxCents = Math.round(priceCents * 0.08);
const totalCents = priceCents + taxCents;

// Format only for display
new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
  .format(totalCents / 100);        // '$21.59'
```

Alternatively, use a decimal library (e.g. `decimal.js`, `big.js`) for arbitrary-precision decimal arithmetic.

## Integer precision limits

Integers are exact only up to `Number.MAX_SAFE_INTEGER` (2^53 − 1 = `9007199254740991`):

```js
9007199254740992 === 9007199254740993; // true (!)
Number.isSafeInteger(2 ** 53);          // false

// Use BigInt for larger integers
9007199254740992n === 9007199254740993n; // false
2n ** 64n;                               // 18446744073709551616n
```

## Options at a glance

| Approach | Best for | Caveat |
| --- | --- | --- |
| Epsilon comparison | Scientific/general math | Choose tolerance carefully |
| `toFixed` / rounding | Display, simple comparisons | `toFixed` returns a string |
| Integer cents | Money | Must convert at boundaries |
| Decimal library | Financial calculations | Extra dependency |
| `BigInt` | Huge integers | Integers only, no mixing with `number` |

## Summary

- `0.1` and `0.2` have no exact binary representation, so their sum carries a tiny rounding error.
- Compare floats with a tolerance (`Number.EPSILON`) or round first.
- Use integer cents or a decimal library for money, and `BigInt` for integers beyond 2^53 − 1.
