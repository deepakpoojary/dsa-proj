**Mostly yes, but not entirely.** ES6 classes are built on the same prototype mechanism as constructor functions (methods live on `Class.prototype`, inheritance uses the prototype chain), but classes add behaviors and features that plain constructor functions can't replicate exactly.

## The "sugar" part

These two snippets produce nearly the same structure:

```js
// ES6 class
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return `Hi, I'm ${this.name}`;
  }
}

// ES5 constructor function
function PersonES5(name) {
  this.name = name;
}
PersonES5.prototype.greet = function () {
  return `Hi, I'm ${this.name}`;
};
```

```js
console.log(typeof Person);                         // "function"
console.log(Object.hasOwn(Person.prototype, 'greet')); // true
const p = new Person('Ann');
console.log(Object.getPrototypeOf(p) === Person.prototype); // true
```

A class *is* a function, its methods *are* on the prototype, and `extends` sets up the prototype chain just like you would manually.

## Where classes differ

### 1. Must be called with `new`

```js
Person('Ann');    // TypeError: Class constructor Person cannot be invoked without 'new'
PersonES5('Ann'); // runs, sets a global `name` in sloppy mode (bug!)
```

### 2. Always strict mode

Code inside a class body runs in strict mode automatically.

### 3. Not hoisted in a usable way (TDZ)

```js
new Foo(); // ReferenceError: Cannot access 'Foo' before initialization
class Foo {}

new Bar(); // works - function declarations are hoisted
function Bar() {}
```

### 4. Methods are non-enumerable

```js
for (const key in new Person('Ann')) console.log(key);    // "name"
for (const key in new PersonES5('Ann')) console.log(key); // "name", "greet"
```

### 5. Methods aren't constructors

```js
new (Person.prototype.greet)();    // TypeError: not a constructor
new (PersonES5.prototype.greet)(); // works (pointlessly)
```

### 6. `super` and derived constructors

In a subclass, `this` doesn't exist until `super()` is called, because the **parent** creates the object. This is fundamentally different from ES5, where the child creates `this` and calls `Parent.call(this)`.

```js
class Animal {
  constructor(name) { this.name = name; }
}
class Dog extends Animal {
  constructor(name) {
    // this.x = 1; // ReferenceError: must call super first
    super(name);
    this.tricks = [];
  }
}
```

This is also why classes can **properly subclass built-ins**:

```js
class MyArray extends Array {}
const arr = new MyArray();
arr.push(1, 2);
console.log(arr.length);              // 2
console.log(Array.isArray(arr));      // true

class HttpError extends Error {
  constructor(status, msg) { super(msg); this.status = status; }
}
```

Doing this with ES5 constructors doesn't give you a real exotic array or a proper `Error` with a stack trace.

### 7. Features with no ES5 equivalent

```js
class Counter {
  #count = 0;                 // truly private field
  static #instances = 0;      // private static
  static {                    // static initialization block
    console.log('class initialised');
  }
  #log() {}                   // private method
  inc() { return ++this.#count; }
}
```

You could approximate privacy with closures or `WeakMap`s, but `#private` fields with brand checks (`#count in obj`) are a genuinely new language feature.

## Summary table

| Behavior | Class | Constructor function |
| --- | --- | --- |
| Uses prototypes under the hood | Yes | Yes |
| Callable without `new` | No (TypeError) | Yes |
| Strict mode | Always | Only if opted in |
| Hoisting | TDZ | Fully hoisted (declaration) |
| Prototype methods enumerable | No | Yes (by default) |
| `super` keyword | Yes | No |
| Subclass built-ins correctly | Yes | No |
| `#private`, static blocks | Yes | No |

## Summary

- Classes use the same prototype-based model, so they're *largely* syntactic sugar.
- But they add real semantics: mandatory `new`, strict mode, TDZ, non-enumerable methods, `super`-based construction, and `#private` members.
- Saying "just syntactic sugar" is a useful simplification; in an interview, mention the differences.
