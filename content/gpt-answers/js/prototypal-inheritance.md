**Prototypal inheritance** is JavaScript's way of sharing behavior between objects: every object has a hidden link to another object called its **prototype**, and when you access a property that isn't on the object itself, JavaScript looks it up on the prototype, then the prototype's prototype, and so on. That series of links is the **prototype chain**.

## How it works

Every object has an internal slot called `[[Prototype]]` that points to another object or to `null`.

When you read `obj.prop`:

1. JavaScript checks whether `obj` has an **own** property `prop`.
2. If not, it checks `obj`'s prototype.
3. It keeps walking up the chain until it finds the property or reaches `null`, in which case the result is `undefined`.

```js
const animal = {
  speak() {
    return this.name + ' speaks';
  },
};

const dog = Object.create(animal); // dog's prototype is animal
dog.name = 'Rex';

console.log(dog.speak());                // "Rex speaks"
console.log(Object.hasOwn(dog, 'speak')); // false - inherited
console.log('speak' in dog);              // true  - found on the chain
```

Notice that `this` inside `speak` still refers to `dog`, the object the method was called on, not `animal`.

## Visualising the chain

```js
const arr = [1, 2, 3];

Object.getPrototypeOf(arr) === Array.prototype;              // true
Object.getPrototypeOf(Array.prototype) === Object.prototype; // true
Object.getPrototypeOf(Object.prototype);                      // null

// arr -> Array.prototype -> Object.prototype -> null
arr.map;      // found on Array.prototype
arr.toString; // found on Array.prototype (overrides Object.prototype's)
arr.hasOwnProperty; // found on Object.prototype
```

## Constructor functions and classes

Methods placed on `Constructor.prototype` are shared by every instance created with `new`, which saves memory.

```js
function Person(name) {
  this.name = name; // own property per instance
}
Person.prototype.greet = function () {
  return `Hi, I'm ${this.name}`;
};

const a = new Person('Ann');
const b = new Person('Bob');
console.log(a.greet === b.greet); // true - one shared function
```

ES6 classes use the exact same mechanism:

```js
class Animal {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound`; }
}

class Dog extends Animal {
  speak() { return `${this.name} barks`; }
}

const rex = new Dog('Rex');
console.log(rex.speak()); // "Rex barks"
// rex -> Dog.prototype -> Animal.prototype -> Object.prototype -> null
```

## Shadowing

If an object has its own property with the same name, it **shadows** the inherited one. Writing a property always creates/updates it on the object itself (unless there's an inherited setter or read-only property).

```js
const base = { greet: () => 'base' };
const child = Object.create(base);
child.greet = () => 'child'; // own property, shadows base.greet

console.log(child.greet()); // "child"
console.log(base.greet());  // "base" - unchanged
```

## Useful APIs

| API | Purpose |
| --- | --- |
| `Object.create(proto)` | Create an object with a given prototype |
| `Object.getPrototypeOf(obj)` | Read the prototype |
| `Object.setPrototypeOf(obj, proto)` | Change the prototype (slow; avoid on hot paths) |
| `Object.hasOwn(obj, key)` | Check own properties only |
| `key in obj` | Check own *and* inherited properties |
| `obj instanceof C` | Is `C.prototype` on `obj`'s chain? |

## Common pitfalls

- **Shared mutable state**: putting an array or object on the prototype means every instance shares it.
- **`for...in` iterates inherited enumerable properties**; use `Object.keys` or `Object.hasOwn` checks.
- **Long chains** make lookups slightly slower and code harder to follow; prefer composition when inheritance gets deep.

## Summary

- Every object links to a prototype; property lookups walk up this **prototype chain** until found or `null`.
- Methods on `Constructor.prototype` (or in a class body) are shared across instances.
- Classes are built on the same mechanism; use `Object.create`, `Object.getPrototypeOf` and `Object.hasOwn` to work with it.
