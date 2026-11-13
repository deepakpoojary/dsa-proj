Saying that functions are **first-class citizens** means that in JavaScript, functions are treated like any other value: you can assign them to variables, store them in objects and arrays, pass them as arguments, and return them from other functions.

## What you can do with first-class functions

### 1. Assign them to variables

```js
const greet = function (name) {
  return `Hello, ${name}`;
};

const sayHello = greet;     // same function, another reference
console.log(sayHello('Ann')); // "Hello, Ann"
```

### 2. Store them in data structures

```js
const operations = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b,
};

const pipeline = [(x) => x + 1, (x) => x * 2];

console.log(operations.add(2, 3));                    // 5
console.log(pipeline.reduce((acc, fn) => fn(acc), 3)); // 8
```

### 3. Pass them as arguments (callbacks)

```js
function repeat(times, action) {
  for (let i = 0; i < times; i++) action(i);
}

repeat(3, (i) => console.log('Run', i));
// Run 0
// Run 1
// Run 2
```

### 4. Return them from functions

```js
function makeCounter() {
  let count = 0;
  return () => ++count; // returns a function
}

const next = makeCounter();
console.log(next()); // 1
console.log(next()); // 2
```

## Functions are objects

In JavaScript, functions are actually special **objects** (callable objects). That means they have properties and you can add your own.

```js
function sum(a, b) {
  return a + b;
}

console.log(sum.name);   // "sum"
console.log(sum.length); // 2 (number of declared params)

sum.description = 'Adds two numbers';
console.log(sum.description); // "Adds two numbers"

console.log(typeof sum);            // "function"
console.log(sum instanceof Object); // true
```

## What this enables

First-class functions are the foundation for many core JavaScript patterns:

| Pattern | How first-class functions are used |
| --- | --- |
| **Callbacks** | Passing a function to run later (`setTimeout`, event listeners) |
| **Higher-order functions** | `map`, `filter`, `reduce`, `debounce`, `memoize` |
| **Closures** | Returning inner functions that remember outer variables |
| **Currying / partial application** | Returning specialised functions |
| **Strategy / dispatch tables** | Storing functions in objects keyed by name |
| **Promises & async** | `.then(fn)`, `.catch(fn)` |

```js
// Dispatch table instead of a big switch
const handlers = {
  click: () => console.log('clicked'),
  hover: () => console.log('hovered'),
};

function handle(eventType) {
  handlers[eventType]?.();
}

handle('click'); // "clicked"
```

## First-class vs higher-order

These terms are related but distinct:

- **First-class functions** is a property of the *language*: functions are values.
- **Higher-order functions** are *specific functions* that take or return other functions, which is only possible because the language has first-class functions.

## Summary

- Functions in JS are values (objects) that can be assigned, stored, passed and returned.
- They can have properties like `name`, `length` and custom ones.
- This is what makes callbacks, closures, higher-order functions and functional programming possible.
