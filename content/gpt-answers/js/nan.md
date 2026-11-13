`NaN` stands for **"Not-a-Number"**. It's a special value of the `number` type that represents the result of an invalid or undefined numeric operation. The most reliable way to check for it is **`Number.isNaN(value)`**.

## Where `NaN` comes from

```js
Number('abc');       // NaN — failed string-to-number conversion
parseInt('hello');   // NaN
0 / 0;               // NaN
Math.sqrt(-1);       // NaN
Infinity - Infinity; // NaN
undefined + 1;       // NaN
NaN + 5;             // NaN — NaN propagates through math
```

Despite its name, its type is `number`:

```js
typeof NaN; // "number"
```

## The weird part: `NaN` is not equal to itself

Per the IEEE 754 floating-point standard, `NaN` is the **only value in JavaScript that is not equal to itself**:

```js
NaN === NaN; // false
NaN == NaN;  // false

const x = NaN;
x !== x;     // true — the old-school NaN check
```

So `if (value === NaN)` will **never** work.

## How to check for `NaN`

### `Number.isNaN()` — recommended

Returns `true` only if the value is actually `NaN`. No type coercion.

```js
Number.isNaN(NaN);        // true
Number.isNaN('abc');      // false — it's a string, not NaN
Number.isNaN(undefined);  // false
Number.isNaN(0 / 0);      // true
```

### Global `isNaN()` — avoid

The older global function **coerces** its argument to a number first, which gives misleading results:

```js
isNaN(NaN);        // true
isNaN('abc');      // true  — 'abc' → NaN
isNaN(undefined);  // true  — undefined → NaN
isNaN('');         // false — '' → 0
isNaN('42');       // false
```

It answers "would this become NaN if converted?" rather than "is this NaN?".

### `Object.is()`

```js
Object.is(NaN, NaN);   // true
Object.is(value, NaN); // works as a NaN check
```

## Comparison of methods

| Check | `NaN` | `'abc'` | `undefined` | `'42'` |
| --- | --- | --- | --- | --- |
| `x === NaN` | false | false | false | false |
| `isNaN(x)` | true | true | true | false |
| `Number.isNaN(x)` | true | false | false | false |
| `Object.is(x, NaN)` | true | false | false | false |
| `x !== x` | true | false | false | false |

## `NaN` in arrays

Different array methods use different equality algorithms:

```js
[NaN].indexOf(NaN);   // -1   — uses ===
[NaN].includes(NaN);  // true — uses SameValueZero
[NaN].findIndex(Number.isNaN); // 0
new Set([NaN, NaN]).size;      // 1 — Sets treat NaN as equal
```

## Practical example: validating input

```js
function parseAge(input) {
  const age = Number(input);
  if (Number.isNaN(age)) {
    throw new Error(`Invalid age: "${input}"`);
  }
  return age;
}

parseAge('25');   // 25
parseAge('abc');  // Error: Invalid age: "abc"
```

If you also want to reject `Infinity`, use `Number.isFinite(age)` — it returns `false` for `NaN`, `Infinity` and `-Infinity`.

## Common pitfalls

- Comparing with `=== NaN` — always false.
- Using global `isNaN` on strings or `undefined`.
- Forgetting that one `NaN` in a calculation poisons the whole result (e.g. summing an array with one bad value).

## Summary

- `NaN` is a `number` value meaning "invalid numeric result", and it's never equal to itself.
- Use **`Number.isNaN()`** (or `Object.is(x, NaN)`); avoid the coercing global `isNaN()`.
- `includes` finds `NaN` in arrays; `indexOf` doesn't.
