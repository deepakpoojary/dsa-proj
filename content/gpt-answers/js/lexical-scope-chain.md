**Lexical scope** means that the variables a piece of code can access are determined by **where it is written** in the source code, not where or how it is called. The **scope chain** is the sequence of nested scopes JavaScript searches, from innermost to outermost, when resolving a variable name.

## Lexical (static) scope

Scopes are fixed at author time. A function "remembers" the scope it was defined in:

```js
const name = 'global';

function outer() {
  const name = 'outer';

  function inner() {
    console.log(name); // looks in inner → outer
  }
  return inner;
}

const fn = outer();
fn(); // 'outer' — determined by where inner was written
```

Compare this with **dynamic scope** (used by some other languages, like Bash), where lookup would depend on the caller. JavaScript doesn't work that way:

```js
const x = 'global x';

function printX() {
  console.log(x);
}

function caller() {
  const x = 'caller x';
  printX();
}

caller(); // 'global x' — not 'caller x'
```

## Types of scope in JavaScript

| Scope | Created by | Example declarations |
| --- | --- | --- |
| **Global** | Top level of a classic script | `var`, `let`, `const`, functions |
| **Module** | Each ES module file | Top-level declarations in a module |
| **Function** | Every function body | `var`, parameters, inner functions |
| **Block** | `{ }` — `if`, `for`, `while`, bare blocks | `let`, `const`, `class` |

## The scope chain

When code references a variable, the engine:

1. Looks in the **current** scope.
2. If not found, moves to the **enclosing (parent)** scope.
3. Repeats up to the **global** scope.
4. If still not found → `ReferenceError` (when reading).

```js
const a = 'A';            // global scope

function level1() {
  const b = 'B';          // level1 scope

  function level2() {
    const c = 'C';        // level2 scope

    console.log(a, b, c); // 'A' 'B' 'C' — found by walking the chain
    console.log(d);       // ReferenceError: d is not defined
  }
  level2();
}
level1();
```

The lookup only goes **outward**, never inward: `level1` cannot see `c`.

## Shadowing

An inner declaration with the same name **hides** the outer one within its scope:

```js
let color = 'blue';

function paint() {
  let color = 'red';      // shadows the outer `color`
  console.log(color);     // 'red'
}
paint();
console.log(color);       // 'blue'
```

## Assigning to undeclared variables

```js
function oops() {
  total = 10; // not declared anywhere
}
oops();
// Sloppy mode: creates a global `total` (bad!)
// Strict mode / modules: ReferenceError
```

## Relationship with closures

Closures are a direct consequence of lexical scoping. Because functions keep a reference to the scope chain where they were created, they can still access those variables after the outer function returns:

```js
function makeCounter() {
  let count = 0;
  return () => ++count; // scope chain: arrow → makeCounter → global
}
const next = makeCounter();
next(); // 1
next(); // 2
```

## Note on `this`

`this` is **not** lexically scoped for regular functions — it's determined by the call site. Arrow functions are the exception: they take `this` lexically from their enclosing scope.

## Summary

- Lexical scope: variable visibility is decided by where code is written.
- The scope chain is the outward lookup path from the current scope to the global scope; failing lookups throw `ReferenceError`.
- Inner names shadow outer ones, and closures exist because functions retain their lexical scope chain.
