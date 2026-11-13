`var`, `let` and `const` all declare variables, but they differ in **scope**, **hoisting behavior**, **redeclaration/reassignment rules**, and how they interact with the global object. In modern JavaScript, `let` and `const` (introduced in ES6) are preferred over `var`.

## Quick comparison

| Feature | `var` | `let` | `const` |
| --- | --- | --- | --- |
| Scope | Function | Block | Block |
| Hoisted | Yes, initialized to `undefined` | Yes, but uninitialized (TDZ) | Yes, but uninitialized (TDZ) |
| Redeclare in same scope | Allowed | SyntaxError | SyntaxError |
| Reassign | Allowed | Allowed | TypeError |
| Must initialize at declaration | No | No | Yes |
| Creates property on `window` (top-level, classic script) | Yes | No | No |

## 1. Scope

`var` is **function-scoped**: it ignores blocks like `if` and `for`. `let` and `const` are **block-scoped**: they exist only inside the nearest `{ }`.

```js
function demo() {
  if (true) {
    var a = 1;
    let b = 2;
    const c = 3;
  }
  console.log(a); // 1  (var leaks out of the block)
  console.log(b); // ReferenceError: b is not defined
}
```

## 2. Hoisting and the Temporal Dead Zone

All three are hoisted, but differently:

- `var` is hoisted and **initialized to `undefined`**, so reading it early returns `undefined`.
- `let` and `const` are hoisted but **not initialized**. Accessing them before the declaration throws a `ReferenceError`. This window is called the **Temporal Dead Zone (TDZ)**.

```js
console.log(x); // undefined
var x = 10;

console.log(y); // ReferenceError: Cannot access 'y' before initialization
let y = 20;
```

## 3. Redeclaration and reassignment

```js
var name = 'Ann';
var name = 'Bo';      // OK — silently overwrites

let age = 30;
// let age = 31;      // SyntaxError: Identifier 'age' has already been declared
age = 31;             // OK — reassignment is fine

const PI = 3.14;
// PI = 3.14159;      // TypeError: Assignment to constant variable.
// const E;           // SyntaxError: Missing initializer in const declaration
```

## 4. `const` is not immutable

`const` makes the **binding** constant, not the value. Objects and arrays declared with `const` can still be mutated.

```js
const user = { name: 'Ann' };
user.name = 'Bo';      // OK — mutating the object
user.age = 25;         // OK
// user = {};          // TypeError — rebinding is not allowed

const nums = [1, 2];
nums.push(3);          // OK → [1, 2, 3]
```

If you need true immutability, use `Object.freeze()` (shallow) or immutable data patterns.

## 5. Global object behavior

In a classic (non-module) browser script, a top-level `var` becomes a property of `window`; `let` and `const` do not.

```js
var g1 = 'var';
let g2 = 'let';

console.log(window.g1); // 'var'
console.log(window.g2); // undefined
```

## 6. Loops and closures

The classic difference shows up with asynchronous callbacks inside loops:

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i)); // 3, 3, 3
}

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j)); // 0, 1, 2
}
```

`let` creates a **new binding for each iteration**, so each callback captures its own value.

## Best practices

- Use **`const` by default** — it signals intent and prevents accidental reassignment.
- Use **`let`** only when the variable needs to be reassigned (counters, accumulators).
- **Avoid `var`** in modern code; its function scoping and lenient hoisting lead to subtle bugs.

## Summary

- `var`: function-scoped, hoisted as `undefined`, redeclarable, attaches to the global object.
- `let`: block-scoped, TDZ, reassignable but not redeclarable.
- `const`: block-scoped, TDZ, must be initialized, cannot be reassigned (but objects it holds can be mutated).
