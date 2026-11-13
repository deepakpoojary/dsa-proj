With `var`, it prints the **final value of the loop counter** for every callback (e.g. `3 3 3`), because all callbacks share a single function-scoped variable. The simplest fix is to use **`let`**, which creates a new binding for each iteration, so you get `0 1 2`.

## The snippet

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i)); // 3 3 3
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j)); // 0 1 2
}
```

Output:

```js
// 3
// 3
// 3
// 0
// 1
// 2
```

## Why `var` prints `3 3 3`

Two concepts combine here:

1. **The event loop** — `setTimeout` schedules its callback to run *later*, after the current synchronous code (the whole loop) has finished. Even with a delay of `0`, callbacks go to the task queue.
2. **Closures capture variables, not values** — each arrow function closes over the variable `i` itself, not its value at the time.

Since `var` is **function-scoped**, there's only **one** `i` shared across all iterations. By the time the callbacks run, the loop has completed and `i` is `3` (the value that made `i < 3` false). All three callbacks read that same `i`.

Conceptually, it's equivalent to:

```js
var i;
for (i = 0; i < 3; i++) {
  setTimeout(() => console.log(i));
}
// loop ends, i === 3
// callbacks run → 3, 3, 3
```

## Why `let` prints `0 1 2`

`let` is **block-scoped**, and `for (let ...)` has special semantics: it creates a **fresh binding of `j` for every iteration**, initialized with the previous iteration's value. Each callback closes over its own copy.

## Fixes

### 1. Use `let` (modern, preferred)

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i)); // 0 1 2
}
```

### 2. Use an IIFE (pre-ES6 solution)

An Immediately Invoked Function Expression creates a new function scope per iteration and captures the current value as a parameter:

```js
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(function () {
      console.log(j); // 0 1 2
    });
  })(i);
}
```

### 3. Pass the value as an extra `setTimeout` argument

`setTimeout` forwards extra arguments to the callback:

```js
for (var i = 0; i < 3; i++) {
  setTimeout((n) => console.log(n), 0, i); // 0 1 2
}
```

### 4. Use `bind`

```js
for (var i = 0; i < 3; i++) {
  setTimeout(console.log.bind(console, i)); // 0 1 2
}
```

### 5. Use `forEach` (each callback call has its own scope)

```js
[0, 1, 2].forEach((i) => {
  setTimeout(() => console.log(i)); // 0 1 2
});
```

## Comparison of fixes

| Fix | How it works | When to use |
| --- | --- | --- |
| `let` | New binding per iteration | Default choice today |
| IIFE | New function scope per iteration | Legacy ES5 code |
| `setTimeout(fn, 0, i)` | Passes value as argument | Quick fix without refactor |
| `bind` | Pre-binds argument value | Functional style |
| `forEach` | Callback parameter per call | Iterating over arrays |

## Variation interviewers like

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), i * 1000);
}
// After 0s: 3, after 1s: 3, after 2s: 3
```

The **delays** use the value of `i` at scheduling time (0, 1000, 2000), but the **logged** value is read later, so it's still `3` each time.

## Summary

- `var` + `setTimeout` in a loop prints the final value (`3 3 3`) because all callbacks share one variable and run after the loop finishes.
- `let` fixes it by creating a new binding per iteration (`0 1 2`).
- Pre-ES6 alternatives: IIFE, extra `setTimeout` argument, or `bind`.
