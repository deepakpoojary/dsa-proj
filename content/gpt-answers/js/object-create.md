`Object.create(proto)` creates a **new object whose prototype is `proto`**, without running any constructor function. It's the most direct way to set up prototypal inheritance in JavaScript.

## Basic usage

```js
const animal = {
  speak() {
    return `${this.name} makes a sound`;
  },
};

const dog = Object.create(animal);
dog.name = 'Rex';

console.log(dog.speak());                          // "Rex makes a sound"
console.log(Object.getPrototypeOf(dog) === animal); // true
console.log(Object.hasOwn(dog, 'speak'));           // false - inherited
```

`dog` starts out empty; `speak` is found by walking up the prototype chain to `animal`.

## Syntax

```js
Object.create(proto);
Object.create(proto, propertiesObject);
```

- `proto`: the object to use as the prototype, or `null`. Anything else throws a `TypeError`.
- `propertiesObject` (optional): property **descriptors** to define on the new object, in the same format as `Object.defineProperties`.

## Using the second argument

```js
const user = Object.create(Object.prototype, {
  name: {
    value: 'Ann',
    writable: true,
    enumerable: true,
  },
  id: {
    value: 42, // writable/enumerable/configurable default to false
  },
});

console.log(user.name);        // "Ann"
console.log(Object.keys(user)); // ["name"] - id is non-enumerable
user.id = 7;
console.log(user.id);          // 42 - not writable
```

## `Object.create(null)`: a truly empty object

Passing `null` creates an object with **no prototype at all**, so it doesn't inherit `toString`, `hasOwnProperty`, `constructor`, or `__proto__`.

```js
const plain = {};
const bare = Object.create(null);

console.log('toString' in plain); // true
console.log('toString' in bare);  // false

// Safe dictionary: keys like "__proto__" or "constructor" are just keys
bare['__proto__'] = 'value';
console.log(bare['__proto__']); // "value"
```

This is useful for lookup tables and caches where user-provided keys could collide with inherited properties (and it helps avoid **prototype pollution**). A `Map` is often an even better choice.

## Classic inheritance pattern (pre-ES6)

Before classes, `Object.create` was how you linked a child constructor to a parent:

```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function () {
  return `${this.name} makes a sound`;
};

function Dog(name) {
  Animal.call(this, name); // call parent constructor
}
Dog.prototype = Object.create(Animal.prototype); // inherit methods
Dog.prototype.constructor = Dog;                 // restore constructor
Dog.prototype.bark = function () {
  return `${this.name} barks`;
};

const rex = new Dog('Rex');
console.log(rex.speak());          // "Rex makes a sound"
console.log(rex.bark());           // "Rex barks"
console.log(rex instanceof Animal); // true
```

Why not `Dog.prototype = new Animal()`? Because that would **run the Animal constructor** (with no arguments) just to set up inheritance, possibly causing side effects and adding unwanted own properties.

## `Object.create` vs other ways to create objects

| Approach | Prototype | Runs constructor? |
| --- | --- | --- |
| `{}` literal | `Object.prototype` | No |
| `new Foo()` | `Foo.prototype` | Yes |
| `Object.create(proto)` | `proto` (any object) | No |
| `Object.create(null)` | none | No |
| `{ __proto__: proto }` | `proto` | No |

## A simplified polyfill

```js
function create(proto) {
  function F() {}
  F.prototype = proto;
  return new F();
}
```

This shows the idea, though it can't handle `null` the way the real method does.

## Summary

- `Object.create(proto)` makes a new object linked to `proto` without calling a constructor.
- The optional second argument defines properties via descriptors.
- `Object.create(null)` gives a prototype-less dictionary; it was also the standard way to wire up inheritance before ES6 classes.
