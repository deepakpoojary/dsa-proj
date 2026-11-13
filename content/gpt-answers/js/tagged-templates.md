A **tagged template literal** is a template literal preceded by a function name (the **tag**). Instead of producing a string directly, JavaScript calls the tag function with the **literal string parts** and the **interpolated values** as separate arguments, letting the function build whatever result it wants — a string, an object, a DOM node, a query.

## How it works

```js
function tag(strings, ...values) {
  console.log(strings); // ['Hello ', ', you are ', '!']
  console.log(values);  // ['Ann', 28]
}

const name = 'Ann';
const age = 28;
tag`Hello ${name}, you are ${age}!`;
```

Key points:

- `strings` is an array of the static text pieces. It always has **one more element than `values`** (possibly empty strings at the ends).
- `values` holds the evaluated `${}` expressions, **not yet converted** to strings.
- The tag can return **anything**, not just a string.
- There are no parentheses: writing the tag name directly before the template *is* the function call.

## Example: uppercase interpolated values

```js
function upper(strings, ...vals) {
  return strings.reduce((out, s, i) =>
    out + s + (i < vals.length ? String(vals[i]).toUpperCase() : ''), '');
}
const name = 'ann';
upper`hi ${name}!`; // 'hi ANN!'
```

Step by step: `strings` is `['hi ', '!']` and `vals` is `['ann']`, so the reduce builds `'hi ' + 'ANN'` then `+ '!'`.

## The `raw` property

The `strings` array also has a `.raw` property containing the text **exactly as typed**, with escape sequences unprocessed:

```js
function show(strings) {
  console.log(strings[0]);     // Line1 (newline) Line2
  console.log(strings.raw[0]); // 'Line1\nLine2'
}
show`Line1\nLine2`;

// String.raw is a built-in tag that uses .raw
String.raw`C:\Users\new`; // 'C:\Users\new'
```

## Practical use cases

### 1. Safe HTML escaping (prevent XSS)

```js
const escape = (v) =>
  String(v).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);

function html(strings, ...values) {
  return strings.reduce(
    (out, s, i) => out + s + (i < values.length ? escape(values[i]) : ''),
    ''
  );
}

const comment = '<img src=x onerror=alert(1)>';
html`<p>${comment}</p>`;
// '<p>&lt;img src=x onerror=alert(1)&gt;</p>'
```

### 2. Parameterised SQL queries

Libraries like `postgres` and `@vercel/postgres` use tags so values become **bound parameters**, not concatenated text, preventing SQL injection:

```js
function sql(strings, ...values) {
  const text = strings.reduce((q, s, i) => q + '$' + i + s);
  return { text, values };
}

const id = "1; DROP TABLE users";
sql`SELECT * FROM users WHERE id = ${id}`;
// { text: 'SELECT * FROM users WHERE id = $1', values: ['1; DROP TABLE users'] }
```

### 3. Libraries built on tags

```js
// styled-components (CSS-in-JS)
const Button = styled.button`
  color: ${(props) => (props.primary ? 'white' : 'black')};
`;

// GraphQL
const QUERY = gql`
  query GetUser($id: ID!) { user(id: $id) { name } }
`;

// lit (web components)
const tpl = html`<h1>Hello ${name}</h1>`;
```

### 4. i18n and formatting

```js
function currency(strings, ...values) {
  const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
  return strings.reduce(
    (out, s, i) => out + s + (i < values.length ? fmt.format(values[i]) : ''),
    ''
  );
}
currency`Total: ${1234.5}`; // 'Total: ₹1,234.50'
```

## Template literal vs tagged template

| | Template literal | Tagged template |
| --- | --- | --- |
| Result | Always a string | Whatever the tag returns |
| Values | Converted with `String()` | Passed raw to the function |
| Escapes | Processed | Available both cooked and `.raw` |
| Typical use | Interpolation | Escaping, DSLs, query builders |

## Good to know

- The `strings` array is **frozen** and **cached per call site**: the same template location passes the identical array each time, which libraries like lit use for fast caching.
- Any expression can be a tag, e.g. `obj.method` or a function that returns a function.

## Summary

- A tag function receives `(strings, ...values)` separately and can return anything.
- `strings.raw` gives unprocessed text; `String.raw` is the built-in raw tag.
- Used for HTML escaping, safe SQL, CSS-in-JS, GraphQL and i18n.
