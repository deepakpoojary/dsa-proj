`prototype` is a property on **constructor functions and classes** that holds the object which will become the prototype of instances created with `new`, while `__proto__` is a (legacy) accessor on **every object** that exposes that object's own actual prototype. In short: `new Foo().__proto__ === Foo.prototype`.

## `prototype`: the blueprint for instances

Only functions that can be used as constructors (regular functions and classes) have a `prototype` property. It's a plain object where you put shared methods.

```js
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function () {
  return `Hi, I'm ${this.name}`;
};

console.log(typeof Person.prototype);          // "object"
console.log(Person.prototype.constructor === Person); // true
```

`Person.prototype` is **not** the prototype of `Person` itself; it's the prototype that `Person`'s *instances* will get.

## `__proto__`: an object's actual link

Every object has an internal `[[Prototype]]` slot. `__proto__` is a getter/setter defined on `Object.prototype` that reads or writes it.

```js
const ann = new Person('Ann');

console.log(ann.__proto__ === Person.prototype);            // true
console.log(Object.getPrototypeOf(ann) === Person.prototype); // true (preferred)
console.log(ann.prototype);                                  // undefined - instances don't have one
```

## Putting it together

```js
function Person() {}
const p = new Person();

// Instance chain
p.__proto__ === Person.prototype;                 // true
Person.prototype.__proto__ === Object.prototype;  // true
Object.prototype.__proto__ === null;              // true

// The constructor function itself is an object too
Person.__proto__ === Function.prototype;          // true
Person.__proto__ === Person.prototype;            // false
```

The same holds for classes:

```js
class Animal {}
class Dog extends Animal {}

const d = new Dog();
Object.getPrototypeOf(d) === Dog.prototype;             // true
Object.getPrototypeOf(Dog.prototype) === Animal.prototype; // true
Object.getPrototypeOf(Dog) === Animal;                  // true (static inheritance)
```

## Comparison

| | `prototype` | `__proto__` |
| --- | --- | --- |
| Exists on | Constructor functions and classes | Every object (via `Object.prototype`) |
| What it is | Object used as the prototype for instances | Accessor for the object's own `[[Prototype]]` |
| Used by | The `new` operator | Property lookup / prototype chain |
| Standard alternative | n/a (it's the standard) | `Object.getPrototypeOf` / `Object.setPrototypeOf` |
| Status | Core language feature | Legacy, kept for web compatibility |

## Things that don't have `prototype`

```js
const arrow = () => {};
const obj = { method() {} };

console.log(arrow.prototype);      // undefined
console.log(obj.method.prototype); // undefined
console.log((async function () {}).prototype); // undefined
```

These functions can't be used with `new`.

## Why avoid `__proto__`

- It's a **legacy feature**; it's only guaranteed in browsers (Annex B of the spec).
- It doesn't exist on objects created with `Object.create(null)`, because they don't inherit from `Object.prototype`.
- Changing an object's prototype at runtime (via `__proto__` or `setPrototypeOf`) de-optimises it in engines.

```js
const dict = Object.create(null);
console.log(dict.__proto__); // undefined - no accessor available
```

Use these instead:

```js
Object.getPrototypeOf(obj);
Object.setPrototypeOf(obj, proto); // sparingly
Object.create(proto);              // set the prototype at creation time
```

Note: `__proto__` inside an **object literal** (`{ __proto__: proto }`) is a separate, standardised syntax for setting the prototype at creation and is fine to use.

## Summary

- `prototype` belongs to constructors/classes and becomes the `[[Prototype]]` of instances made with `new`.
- `__proto__` exposes any object's actual `[[Prototype]]`; `instance.__proto__ === Constructor.prototype`.
- Prefer `Object.getPrototypeOf` / `Object.create` over the legacy `__proto__` accessor.
