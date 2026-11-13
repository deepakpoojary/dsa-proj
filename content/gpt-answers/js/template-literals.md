**Template literals** are strings written with **backticks** instead of single or double quotes. They support **string interpolation** with `${expression}`, **multi-line strings** without escape characters, and **tagged templates**, where a function processes the string.

## Basic interpolation

Any JavaScript expression can go inside `${}`; its result is converted to a string.

```js
const name = 'Ann';
const items = 3;
const price = 9.5;

// Old way
const msg1 = 'Hi ' + name + ', you have ' + items + ' items.';

// Template literal
const msg2 = `Hi ${name}, you have ${items} items.`;

// Expressions, function calls, ternaries
console.log(`Total: $${(items * price).toFixed(2)}`); // Total: $28.50
console.log(`Status: ${items > 0 ? 'active' : 'empty'}`); // Status: active
console.log(`Upper: ${name.toUpperCase()}`); // Upper: ANN
```

## Multi-line strings

Line breaks inside backticks are preserved:

```js
const html = `
<ul>
  <li>${name}</li>
  <li>${items} items</li>
</ul>`;

// Old way needed '\n' and concatenation
const old = '<ul>\n' +
  '  <li>' + name + '</li>\n' +
  '</ul>';
```

Note: indentation and leading/trailing newlines inside the backticks are part of the string. Use `.trim()` if needed.

## How values are converted

Interpolated values are converted with `String()` semantics:

```js
`${null}`;          // 'null'
`${undefined}`;     // 'undefined'
`${[1, 2, 3]}`;     // '1,2,3'
`${{ a: 1 }}`;      // '[object Object]'  -> use JSON.stringify
`${Symbol('x')}`;   // TypeError: Cannot convert a Symbol value to a string
```

## Nesting templates

```js
const users = [{ name: 'Ann', admin: true }, { name: 'Bob', admin: false }];

const list = `
<ul>
  ${users.map((u) => `<li>${u.name}${u.admin ? ' (admin)' : ''}</li>`).join('')}
</ul>`;
```

## Tagged templates

Put a function name before the template; it receives the literal string parts and the interpolated values separately:

```js
function highlight(strings, ...values) {
  return strings.reduce(
    (out, str, i) => out + str + (i < values.length ? `[${values[i]}]` : ''),
    ''
  );
}

const user = 'Ann';
const age = 28;
highlight`User ${user} is ${age} years old`;
// 'User [Ann] is [28] years old'
```

Tagged templates power libraries like **styled-components** (`styled.div` tag), **GraphQL** (`gql` tag) and safe SQL/HTML builders.

## `String.raw`

A built-in tag that returns the string **without processing escape sequences**, handy for regex and Windows paths:

```js
console.log(`C:\new\table`);           // escapes processed: newline and tab
console.log(String.raw`C:\new\table`); // C:\new\table
```

## Template literals vs regular strings

| Feature | Quoted strings | Template literals (backticks) |
| --- | --- | --- |
| Interpolation | No (use `+`) | Yes, `${expr}` |
| Multi-line | Needs `\n` | Native |
| Tagged processing | No | Yes |
| Quotes inside | Must escape matching quote | Both `'` and `"` freely |
| Literal backtick inside | No escaping needed | Must escape with a backslash |

## Common pitfalls

- **Security**: interpolating user input into HTML and assigning it to `innerHTML` opens XSS holes. Escape it or use `textContent`.
- **Unwanted whitespace** in multi-line templates from code indentation.
- Objects interpolate as `[object Object]`; use `JSON.stringify(obj)`.

## Summary

- Backtick strings with `${expression}` interpolation and real line breaks.
- Tagged templates let a function process the parts; `String.raw` keeps backslashes raw.
- Cleaner than concatenation, but escape user input when building HTML.
