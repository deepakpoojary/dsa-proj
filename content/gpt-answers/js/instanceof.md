`obj instanceof Constructor` returns `true` if `Constructor.prototype` appears **anywhere in `obj`'s prototype chain**. It doesn't check how the object was created; it only walks the chain of `[[Prototype]]` links.

## How it works

```js
class Animal {}
class Dog extends Animal {}

const rex = new Dog();

console.log(rex instanceof Dog);    // true  - Dog.prototype is rex's prototype
console.log(rex instanceof Animal); // true  - Animal.prototype is further up
console.log(rex instanceof Object); // true  - Object.prototype is at the top
console.log(rex instanceof Array);  // false

// rex -> Dog.prototype -> Animal.prototype -> Object.prototype -> null
```

The algorithm (simplified):

1. If the right-hand side has a `Symbol.hasInstance` method, call it and return its result.
2. If the left-hand side is a primitive, return `false`.
3. Walk `Object.getPrototypeOf(obj)` repeatedly; if any link equals `Constructor.prototype`, return `true`.
4. If you reach `null`, return `false`.

## Implementing it

```js
function myInstanceOf(obj, C) {
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) return false;
  let proto = Object.getPrototypeOf(obj);
  while (proto) {
    if (proto === C.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}

class A {}
class B extends A {}

console.log(myInstanceOf(new B(), A));      // true
console.log(myInstanceOf(new A(), B));      // false
console.log(myInstanceOf([], Object));      // true
console.log(myInstanceOf(42, Number));      // false
console.log(myInstanceOf(() => {}, Function)); // true
```

A more complete version would also validate that `C` is callable (the real operator throws `TypeError: Right-hand side of 'instanceof' is not callable`) and respect `Symbol.hasInstance`.

## Primitives return `false`

```js
console.log(1 instanceof Number);             // false
console.log('hi' instanceof String);          // false
console.log(new Number(1) instanceof Number); // true - wrapper object
```

Use `typeof` for primitives.

## It's based on the prototype, not the constructor

Because it only compares against `C.prototype`, changing prototypes changes the result:

```js
function Foo() {}
const f = new Foo();

console.log(f instanceof Foo); // true
Foo.prototype = {};            // replace the prototype object
console.log(f instanceof Foo); // false - f still links to the OLD prototype

const fake = Object.create(Array.prototype);
console.log(fake instanceof Array); // true - but it's not a real array!
console.log(Array.isArray(fake));   // false
```

## Customising with `Symbol.hasInstance`

```js
class Even {
  static [Symbol.hasInstance](n) {
    return Number.isInteger(n) && n % 2 === 0;
  }
}

console.log(2 instanceof Even); // true
console.log(3 instanceof Even); // false
```

## Pitfall: multiple realms

Each iframe, window, Node `vm` context or worker has its own set of built-ins. An array created in an iframe has a different `Array.prototype`, so `instanceof Array` fails:

```js
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const IframeArray = iframe.contentWindow.Array;
const arr = new IframeArray();

console.log(arr instanceof Array); // false
console.log(Array.isArray(arr));   // true - realm-safe
```

## `instanceof` vs alternatives

| Check | Good for | Notes |
| --- | --- | --- |
| `instanceof` | Class/constructor membership | Walks the prototype chain; fails across realms |
| `typeof` | Primitives, functions | `typeof null === 'object'` quirk |
| `Array.isArray` | Arrays | Works across realms |
| `C.prototype.isPrototypeOf(obj)` | Same as `instanceof` | Ignores `Symbol.hasInstance` |
| `#field in obj` | Brand checks for your own classes | Can't be faked with `Object.create` |

## Summary

- `instanceof` checks whether `C.prototype` is somewhere on `obj`'s prototype chain.
- Implement it by looping with `Object.getPrototypeOf` until you find `C.prototype` or hit `null`.
- It returns `false` for primitives, can be customised with `Symbol.hasInstance`, and breaks across realms (use `Array.isArray` for arrays).
