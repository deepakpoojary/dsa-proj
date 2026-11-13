**Function scope** means a variable is visible throughout the entire function it's declared in, while **block scope** means a variable is visible only inside the nearest pair of curly braces `{ }`. In JavaScript, `var` is function-scoped, whereas `let`, `const` and `class` are block-scoped.

## Function scope (`var`)

A `var` declared anywhere inside a function — even inside an `if` or `for` block — belongs to the whole function:

```js
function checkAge(age) {
  if (age >= 18) {
    var status = 'adult';
  }
  console.log(status); // 'adult' (or undefined if age < 18) — leaks out of the if block
}

checkAge(20);
console.log(typeof status); // "undefined" — but it doesn't leak out of the function
```

## Block scope (`let`, `const`)

`let` and `const` are confined to the block in which they're declared:

```js
function checkAge(age) {
  if (age >= 18) {
    let status = 'adult';
    const canVote = true;
  }
  console.log(status); // ReferenceError: status is not defined
}
```

A **block** is any `{ }`: `if`/`else`, `for`, `while`, `switch`, `try`/`catch`, or even a bare block.

```js
{
  const temp = 42;
}
console.log(temp); // ReferenceError
```

## Key differences

| Aspect | Function scope | Block scope |
| --- | --- | --- |
| Declared with | `var`, function parameters | `let`, `const`, `class` |
| Boundary | Entire function body | Nearest `{ }` |
| Leaks from `if`/`for` blocks | Yes | No |
| Hoisting | Initialized to `undefined` | Hoisted but in TDZ |
| Loop iteration bindings | One shared variable | New binding per iteration |

## Loops: the most visible difference

```js
for (var i = 0; i < 3; i++) {}
console.log(i); // 3 — i leaks out of the loop

for (let j = 0; j < 3; j++) {}
console.log(j); // ReferenceError
```

`for (let ...)` also creates a **fresh binding per iteration**, which matters for closures:

```js
const fns = [];
for (var a = 0; a < 3; a++) fns.push(() => a);
fns.map((f) => f()); // [3, 3, 3]

const fns2 = [];
for (let b = 0; b < 3; b++) fns2.push(() => b);
fns2.map((f) => f()); // [0, 1, 2]
```

## Shadowing in nested blocks

```js
let x = 1;
if (true) {
  let x = 2;        // separate variable, shadows outer x
  console.log(x);   // 2
}
console.log(x);     // 1

var y = 1;
if (true) {
  var y = 2;        // same variable! overwrites outer y
}
console.log(y);     // 2
```

## Other block-scoped things

- **`catch` parameters** are scoped to the `catch` block:

```js
try {
  throw new Error('fail');
} catch (err) {
  console.log(err.message); // 'fail'
}
// console.log(err); // ReferenceError
```

- **Function declarations inside blocks** are block-scoped in strict mode (and modules). In sloppy mode their behavior is inconsistent across legacy engines, so avoid relying on it.

## Before block scope: the IIFE workaround

Pre-ES6, developers used immediately invoked functions to simulate block scope:

```js
(function () {
  var privateVar = 'hidden';
})();
// privateVar isn't accessible here
```

## Best practices

- Use `const` by default and `let` when reassignment is needed — both give tight, predictable block scope.
- Avoid `var`: it leaks out of blocks and can be accidentally redeclared.
- Declare variables in the smallest scope that needs them.

## Summary

- Function scope (`var`) spans the whole function and ignores blocks.
- Block scope (`let`, `const`, `class`) is limited to the nearest `{ }`.
- Block scope prevents leaks from `if`/`for` blocks and gives each loop iteration its own binding.
