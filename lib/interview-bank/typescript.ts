import type { BankQuestion } from './types';

export const TYPESCRIPT: BankQuestion[] = [
  // ───────────────────────── Basics & Types ─────────────────────────
  {
    id: 'what-is-typescript',
    group: 'Basics & Types',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is TypeScript and why use it over plain JavaScript?',
    a: [
      'A statically typed superset of JavaScript by Microsoft; any valid JS is (mostly) valid TS.',
      'Types are checked at compile time and fully erased; the output is plain JS, so there is zero runtime cost.',
      'Catches bugs early (typos, null access, wrong arguments) before code runs.',
      'Great tooling: autocomplete, safe refactors, go-to-definition, inline docs.',
      'Types act as living documentation and make large codebases and teams scale.',
      'Trade-offs: build step, learning curve, types can be wrong (`any`, bad assertions) and give false confidence.',
    ],
  },
  {
    id: 'any-unknown-never',
    group: 'Basics & Types',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between `any`, `unknown` and `never`?',
    a: [
      '`any` turns off type checking: assignable to and from everything; spreads unsafety silently.',
      '`unknown` is the type-safe top type: anything can be assigned to it, but you must narrow it before use.',
      '`never` is the bottom type: no value has it; assignable to everything, nothing is assignable to it.',
      '`never` appears for functions that throw or loop forever, impossible branches and exhaustive checks.',
      'Prefer `unknown` for untrusted input (JSON, `catch` errors, API responses) and narrow with guards.',
    ],
    code: `let a: any = 1;      a.foo.bar();       // compiles, crashes at runtime
let u: unknown = 1;  // u.toFixed();     // error: must narrow first
if (typeof u === 'number') u.toFixed();  // ok

function fail(msg: string): never {
  throw new Error(msg);
}`,
  },
  {
    id: 'structural-typing',
    group: 'Basics & Types',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is structural typing (duck typing) in TypeScript?',
    a: [
      'Compatibility is based on the shape (members) of a type, not its name or declaration.',
      'If `B` has at least all the members `A` requires, a `B` can be used where an `A` is expected.',
      'Contrast with nominal typing (Java, C#) where types must be explicitly declared related.',
      'Two classes with identical members are interchangeable, even with no `extends`/`implements`.',
      'To simulate nominal types, use branded types or `private`/`#private` members.',
    ],
    code: `interface Point { x: number; y: number }
class Vec { constructor(public x: number, public y: number, public z = 0) {} }

const p: Point = new Vec(1, 2); // ok: Vec has x and y`,
  },
  {
    id: 'type-inference',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'How does type inference work and when should you annotate explicitly?',
    a: [
      'TS infers types from initializers, return statements, default params and context (contextual typing).',
      '`let x = 5` infers `number`; `const x = 5` infers the literal `5`.',
      'Callback params are contextually typed from where the function is passed, e.g. `arr.map(n => ...)`.',
      'Annotate function parameters (never inferred from usage), public API return types and empty arrays/objects.',
      'Avoid redundant annotations on simple locals; let inference do the work.',
    ],
  },
  {
    id: 'strict-mode',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'What does `strict: true` enable and why does it matter?',
    a: [
      'An umbrella flag enabling the strict family: `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, and more.',
      'Also `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `useUnknownInCatchVariables`, `alwaysStrict`.',
      '`strictNullChecks`: `null`/`undefined` are not assignable to other types, which kills the most common runtime bug.',
      '`noImplicitAny`: errors when a type silently falls back to `any`.',
      'Always use it for new projects; new strict checks added in future versions are opted into automatically.',
    ],
  },
  {
    id: 'enums',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do enums work? Enum vs `const enum` vs union of string literals?',
    a: [
      'Numeric enums auto-increment from 0 and get a reverse mapping (`Dir[0] === "Up"`); string enums do not.',
      'Regular enums emit a real JS object at runtime, one of the few TS features with runtime output.',
      '`const enum` is inlined at compile time (no object), but breaks with `isolatedModules` / per-file transpilers.',
      'Union of string literals (`"up" | "down"`) is zero-cost, works with plain strings and is often preferred.',
      'Alternative: an `as const` object plus `typeof obj[keyof typeof obj]` for a runtime object and a union type.',
      'Enums are nominal-ish: a string enum member cannot be assigned from a raw string literal.',
    ],
    code: `enum Dir { Up, Down }           // Dir.Up = 0, Dir[0] = 'Up'
type DirU = 'up' | 'down';       // no runtime code

const Status = { Ok: 'ok', Err: 'err' } as const;
type Status = typeof Status[keyof typeof Status]; // 'ok' | 'err'`,
  },
  {
    id: 'type-assertions',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are type assertions (`as`) and the non-null assertion (`!`)? When are they dangerous?',
    a: [
      '`value as T` tells the compiler to treat a value as `T`; no runtime check or conversion happens.',
      'Old syntax `<T>value` is equivalent but conflicts with JSX, so prefer `as`.',
      'Only allowed if types sufficiently overlap; otherwise you need `as unknown as T` (a red flag).',
      '`x!` removes `null | undefined` from the type; it crashes at runtime if you are wrong.',
      'Prefer narrowing, type guards or `satisfies`; assertions are an escape hatch that hides bugs.',
    ],
    code: `const el = document.getElementById('app') as HTMLDivElement;
const len = maybeStr!.length; // trust me, it is not null`,
  },
  {
    id: 'satisfies-operator',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Medium',
    q: 'What does the `satisfies` operator do and how is it different from an annotation or `as`?',
    a: [
      'Added in TS 4.9: `expr satisfies T` checks the value conforms to `T` but keeps the narrower inferred type.',
      'An annotation (`const x: T = ...`) widens the variable to `T`, losing literal/specific info.',
      '`as T` skips checking (unsafe); `satisfies` validates and catches excess or missing properties.',
      'Ideal for config objects, route maps and theme tokens where you want both validation and precise keys.',
      'Commonly combined: `as const satisfies T` for readonly literal values that are validated.',
    ],
    code: `type Colors = Record<string, string | number[]>;
const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
} satisfies Colors;

palette.green.toUpperCase(); // ok: still known as string`,
  },
  {
    id: 'as-const',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'What does `as const` do?',
    a: [
      'A const assertion: infers the narrowest literal types instead of widening.',
      'Object properties become `readonly` literals; arrays become `readonly` tuples.',
      'Useful for deriving union types from runtime values: `typeof arr[number]`.',
      'Only affects types; it does not freeze the object at runtime (use `Object.freeze` for that).',
    ],
    code: `const roles = ['admin', 'user'] as const;
type Role = typeof roles[number]; // 'admin' | 'user'

const cfg = { mode: 'dark' } as const; // { readonly mode: 'dark' }`,
  },
  {
    id: 'literal-types',
    group: 'Basics & Types',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are literal types and type widening?',
    a: [
      'Literal types represent one exact value: `"GET"`, `42`, `true`.',
      'Combined in unions they model enums cheaply: `type Method = "GET" | "POST"`.',
      'Widening: `let m = "GET"` infers `string`, because `let` can be reassigned; `const` keeps `"GET"`.',
      'Object properties also widen (`{ m: "GET" }` gives `m: string`); fix with `as const` or an annotation.',
    ],
  },
  {
    id: 'tuples',
    group: 'Basics & Types',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are tuples and how do they differ from arrays?',
    a: [
      'Fixed-length arrays where each position has its own type: `[string, number]`.',
      'Support optional (`[string, number?]`), rest (`[string, ...number[]]`) and labeled elements (`[name: string, age: number]`).',
      'Used for multiple return values, e.g. React `useState` returns `[value, setter]`.',
      'Mutating methods like `push` are still allowed on non-readonly tuples; use `readonly [A, B]` to prevent it.',
    ],
    code: `type Entry = [key: string, value: number];
const e: Entry = ['a', 1];
function useToggle(): [boolean, () => void] { /* ... */ }`,
  },
  {
    id: 'primitive-types',
    group: 'Basics & Types',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are the basic built-in types in TypeScript?',
    a: [
      'Primitives: `string`, `number`, `boolean`, `bigint`, `symbol`, `null`, `undefined`.',
      'Special: `any`, `unknown`, `never`, `void` (function returns nothing useful), `object` (non-primitive).',
      'Arrays: `number[]` or `Array<number>`; tuples: `[string, number]`.',
      'Use lowercase `string`/`number`, never wrapper types `String`/`Number`.',
      '`void` vs `undefined`: a `() => void` callback type may return a value that is ignored; `undefined` is a real value type.',
    ],
  },

  // ─────────────────── Interfaces vs Types & Objects ───────────────────
  {
    id: 'interface-vs-type',
    group: 'Interfaces vs Types & Objects',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between `interface` and `type`?',
    a: [
      'Both describe object shapes; most of the time they are interchangeable.',
      '`interface` can be re-opened (declaration merging) and `extends` other interfaces; good for public object/class contracts.',
      '`type` can alias anything: unions, intersections, tuples, primitives, mapped and conditional types.',
      '`extends` reports conflicts as errors and is cached (faster); `&` silently creates `never` members on conflicts.',
      'Rule of thumb: `interface` for object shapes you expect to extend, `type` for unions and computed types.',
    ],
  },
  {
    id: 'optional-readonly-properties',
    group: 'Interfaces vs Types & Objects',
    stars: 4,
    difficulty: 'Easy',
    q: 'How do optional (`?`) and `readonly` properties work?',
    a: [
      '`name?: string` means the property may be missing; its type becomes `string | undefined`.',
      'With `exactOptionalPropertyTypes`, `?` means "may be absent" but not "may be explicitly `undefined`".',
      '`readonly id: number` prevents reassignment through that type at compile time only.',
      '`readonly` is shallow: nested objects remain mutable.',
      'Optional params in functions: `function f(a?: number)` or default values `a = 0`.',
    ],
  },
  {
    id: 'index-signatures',
    group: 'Interfaces vs Types & Objects',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are index signatures and when do you use them vs `Record`?',
    a: [
      'Describe objects with dynamic keys: `{ [key: string]: number }`.',
      'Key types can be `string`, `number`, `symbol` or template literal patterns.',
      'All explicit properties must be compatible with the index signature value type.',
      '`Record<string, number>` is equivalent; `Record<"a" | "b", number>` requires exact keys instead.',
      'Reads return `T` (not `T | undefined`) unless `noUncheckedIndexedAccess` is on. Consider `Map` for real dictionaries.',
    ],
    code: `interface Scores {
  [player: string]: number;
  total: number; // must be number too
}`,
  },
  {
    id: 'function-overloads',
    group: 'Interfaces vs Types & Objects',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do function overloads work in TypeScript?',
    a: [
      'Write several overload signatures followed by one implementation signature.',
      'Callers only see the overload signatures; the implementation signature is hidden.',
      'The implementation must be compatible with all overloads and narrow at runtime itself.',
      'Overloads are resolved top to bottom, so put the most specific first.',
      'Prefer a union parameter or generics when the return type does not depend on the input type.',
    ],
    code: `function parse(x: string): number;
function parse(x: number): string;
function parse(x: string | number) {
  return typeof x === 'string' ? Number(x) : String(x);
}
const n = parse('42'); // number`,
  },
  {
    id: 'declaration-merging',
    group: 'Interfaces vs Types & Objects',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is declaration merging?',
    a: [
      'Multiple declarations with the same name are merged by the compiler into one definition.',
      'Interfaces merge their members; duplicate type aliases are an error.',
      'Namespaces can merge with classes, functions and enums to add static members.',
      'Used to extend third-party types: e.g. add a field to Express `Request` or to `Window`.',
      'Downside: accidental merges with global interfaces of the same name.',
    ],
    code: `interface User { name: string }
interface User { age: number }
const u: User = { name: 'a', age: 1 }; // both required`,
  },
  {
    id: 'excess-property-checks',
    group: 'Interfaces vs Types & Objects',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are excess property checks?',
    a: [
      'Object literals assigned directly to a typed target are checked for unknown properties.',
      'This catches typos like `{ colour: "red" }` for a `{ color?: string }` type.',
      'The check only applies to fresh object literals; assigning via an intermediate variable bypasses it.',
      'Structural typing still allows extra props in non-literal values.',
    ],
    code: `interface Opts { color?: string }
const a: Opts = { colour: 'red' }; // error: excess property
const tmp = { colour: 'red' };
const b: Opts = tmp;               // ok (not fresh)`,
  },
  {
    id: 'extends-vs-intersection',
    group: 'Interfaces vs Types & Objects',
    stars: 3,
    difficulty: 'Medium',
    q: 'Interface `extends` vs intersection (`&`) — what is the difference?',
    a: [
      'Both combine object shapes: `interface B extends A {}` vs `type B = A & {}`.',
      '`extends` errors if a property conflicts incompatibly; `&` silently intersects it (often to `never`).',
      'Interfaces are cached by name, making `extends` faster for the compiler in large codebases.',
      '`&` works with any type, including unions and primitives, and is needed for type aliases.',
    ],
  },
  {
    id: 'function-types',
    group: 'Interfaces vs Types & Objects',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you type functions (arrow types, call signatures, construct signatures)?',
    a: [
      'Function type expression: `type Fn = (a: number, b?: string) => boolean`.',
      'Call signature in an object type lets a function also have properties: `{ (x: number): string; id: string }`.',
      'Construct signature: `{ new (x: string): Foo }` for things called with `new`.',
      'Rest params: `(...args: number[]) => void`; `this` param: `function (this: Window) {}`.',
      'Avoid the `Function` type; it accepts any function and returns `any` when called.',
    ],
  },
  {
    id: 'object-vs-Object-vs-empty',
    group: 'Interfaces vs Types & Objects',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is the difference between `object`, `Object` and `{}`?',
    a: [
      '`object` means any non-primitive value (objects, arrays, functions).',
      '`{}` means any non-nullish value, including primitives like `5` and `"x"`.',
      '`Object` (capital) is similar to `{}`; avoid it.',
      'For "any object with unknown keys" prefer `Record<string, unknown>`.',
    ],
  },
  {
    id: 'readonly-arrays',
    group: 'Interfaces vs Types & Objects',
    stars: 2,
    difficulty: 'Easy',
    q: 'What are `readonly` arrays and `ReadonlyArray<T>`?',
    a: [
      '`readonly T[]` (or `ReadonlyArray<T>`) removes mutating methods like `push`, `splice`, `sort`.',
      'A mutable `T[]` is assignable to `readonly T[]`, but not the other way around.',
      'Good for function params to signal "I will not mutate your array".',
      'Compile-time only; runtime arrays are still mutable.',
    ],
  },

  // ──────────────── Unions, Narrowing & Type Guards ────────────────
  {
    id: 'union-vs-intersection',
    group: 'Unions, Narrowing & Type Guards',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between union (`|`) and intersection (`&`) types?',
    a: [
      'Union `A | B`: the value is either `A` or `B`; you can only access members common to both until narrowed.',
      'Intersection `A & B`: the value is both at once; it has all members of `A` and `B`.',
      'Think in sets: union widens the set of allowed values, intersection narrows it.',
      'Intersecting incompatible primitives yields `never` (`string & number`).',
    ],
    code: `type Id = string | number;
type Admin = User & { permissions: string[] };`,
  },
  {
    id: 'type-narrowing',
    group: 'Unions, Narrowing & Type Guards',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is type narrowing and what are the ways to narrow?',
    a: [
      'Control-flow analysis refines a broad type to a more specific one inside a branch.',
      '`typeof x === "string"` for primitives; `instanceof` for classes.',
      '`"prop" in obj` for object shapes; equality checks (`=== null`, `=== "a"`) for literals.',
      'Truthiness checks (`if (x)`), discriminant property checks, and `Array.isArray`.',
      'User-defined type guards (`x is T`) and assertion functions (`asserts x is T`).',
    ],
    code: `function len(x: string | string[] | null) {
  if (x === null) return 0;
  if (typeof x === 'string') return x.length; // string
  return x.length;                            // string[]
}`,
  },
  {
    id: 'user-defined-type-guards',
    group: 'Unions, Narrowing & Type Guards',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are user-defined type guards (type predicates)?',
    a: [
      'A function returning `param is T` tells the compiler the argument is `T` when it returns `true`.',
      'In the `false` branch, the type is narrowed to exclude `T`.',
      'The compiler trusts your logic; a wrong predicate is as unsafe as an `as` cast.',
      'Commonly used with `unknown` input and with `.filter()` to narrow arrays.',
    ],
    code: `interface Fish { swim(): void }
interface Bird { fly(): void }

function isFish(p: Fish | Bird): p is Fish {
  return 'swim' in p;
}
if (isFish(pet)) pet.swim();`,
  },
  {
    id: 'discriminated-unions',
    group: 'Unions, Narrowing & Type Guards',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are discriminated (tagged) unions?',
    a: [
      'A union of object types that share a common literal property (the discriminant), e.g. `kind` or `type`.',
      'Checking the discriminant (`switch (s.kind)`) narrows to the exact member.',
      'Models state machines, Redux actions, API results (`{ ok: true, data } | { ok: false, error }`).',
      'Makes impossible states unrepresentable; pair with a `never` check for exhaustiveness.',
    ],
    code: `type Shape =
  | { kind: 'circle'; r: number }
  | { kind: 'rect'; w: number; h: number };

function area(s: Shape) {
  switch (s.kind) {
    case 'circle': return Math.PI * s.r ** 2;
    case 'rect': return s.w * s.h;
  }
}`,
  },
  {
    id: 'exhaustiveness-checking',
    group: 'Unions, Narrowing & Type Guards',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you do exhaustiveness checking with `never`?',
    a: [
      'After handling every union member, the remaining type is `never`.',
      'Assign it to a `never` variable in the `default` branch; adding a new member then causes a compile error.',
      'Helper: `function assertNever(x: never): never { throw new Error(...) }`.',
      'Alternative: `satisfies never` in the default branch, or `switch-exhaustiveness-check` ESLint rule.',
    ],
    code: `default: {
  const _exhaustive: never = s; // error if a case is missing
  throw new Error('unhandled shape');
}`,
  },
  {
    id: 'optional-chaining-nullish',
    group: 'Unions, Narrowing & Type Guards',
    stars: 4,
    difficulty: 'Easy',
    q: 'How do optional chaining (`?.`) and nullish coalescing (`??`) interact with types?',
    a: [
      '`a?.b` short-circuits to `undefined` if `a` is `null`/`undefined`; result type includes `undefined`.',
      '`x ?? fallback` uses fallback only for `null`/`undefined`, unlike `||` which also replaces `0`, `""`, `false`.',
      '`??` removes `null | undefined` from the left type in the result.',
      'Also `a?.[i]`, `fn?.()` and `??=` assignment.',
    ],
  },
  {
    id: 'in-operator-narrowing',
    group: 'Unions, Narrowing & Type Guards',
    stars: 3,
    difficulty: 'Easy',
    q: 'How does the `in` operator narrow types?',
    a: [
      '`"prop" in obj` narrows a union to members that declare (or optionally declare) `prop`.',
      'Useful for unions of interfaces without a shared discriminant.',
      'Since TS 4.9, `in` on an `unknown`/`object` adds the property as `unknown` to the narrowed type.',
      'Caveat: structural typing means another type might have that prop at runtime too.',
    ],
  },
  {
    id: 'assertion-functions',
    group: 'Unions, Narrowing & Type Guards',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are assertion functions (`asserts x is T`)?',
    a: [
      'A function signature `asserts cond` or `asserts x is T` narrows the type after the call returns.',
      'The function must throw if the assertion fails; returning means it holds.',
      'Removes the need to wrap the rest of the code in an `if` block.',
      'Must be called via an explicitly typed reference (not an inferred arrow const).',
    ],
    code: `function assertIsString(v: unknown): asserts v is string {
  if (typeof v !== 'string') throw new TypeError('not a string');
}
assertIsString(input);
input.toUpperCase(); // input: string`,
  },
  {
    id: 'inferred-type-predicates',
    group: 'Unions, Narrowing & Type Guards',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you filter `null`s out of an array with correct types?',
    a: [
      'Since TS 5.5, TS infers type predicates from simple functions, so `arr.filter(x => x !== null)` narrows.',
      'Before 5.5 you needed an explicit guard: `.filter((x): x is T => x != null)`.',
      '`.filter(Boolean)` still does not narrow without a custom overload or helper.',
      'Inference only applies when the function returns a boolean that maps exactly to the narrowing.',
    ],
    code: `const xs = [1, null, 2];
const nums = xs.filter(x => x !== null); // number[] in TS 5.5+`,
  },
  {
    id: 'narrowing-in-callbacks',
    group: 'Unions, Narrowing & Type Guards',
    stars: 3,
    difficulty: 'Hard',
    q: 'Why is narrowing sometimes lost inside callbacks?',
    a: [
      'Narrowing of mutable variables (`let`, object properties) is reset inside closures because they may change before the callback runs.',
      '`const` variables and parameters that are never reassigned keep their narrowing.',
      'TS 5.4 preserves narrowing in closures created after the last assignment.',
      'Fix: copy the narrowed value into a `const` before the callback.',
    ],
    code: `let v: string | undefined = get();
if (v) {
  const s = v;               // capture
  setTimeout(() => s.length); // ok
}`,
  },
  {
    id: 'instanceof-narrowing',
    group: 'Unions, Narrowing & Type Guards',
    stars: 3,
    difficulty: 'Easy',
    q: 'When do you use `instanceof` vs `typeof` for narrowing?',
    a: [
      '`typeof` works for primitives and `"function"`/`"object"`; note `typeof null === "object"`.',
      '`instanceof` checks the prototype chain, so it only works for classes/constructor functions.',
      'Interfaces and type aliases do not exist at runtime, so `instanceof` cannot check them.',
      'Classic use: `catch (e) { if (e instanceof Error) e.message }`.',
    ],
  },
  {
    id: 'truthiness-narrowing-pitfalls',
    group: 'Unions, Narrowing & Type Guards',
    stars: 2,
    difficulty: 'Easy',
    q: 'What is the pitfall of truthiness narrowing?',
    a: [
      '`if (x)` removes `null`/`undefined` but also filters out valid falsy values `0`, `""`, `NaN`, `false`.',
      'For `number | undefined`, use `x !== undefined` or `x != null` instead.',
      '`!!x` / `Boolean(x)` narrows in a condition but has the same falsy-value problem.',
    ],
  },

  // ───────────────────────────── Generics ─────────────────────────────
  {
    id: 'what-are-generics',
    group: 'Generics',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are generics and why are they useful?',
    a: [
      'Type parameters that let a function, class or type work over many types while preserving the relationship between them.',
      'Unlike `any`, the specific type flows through: `identity<T>(x: T): T` returns the exact input type.',
      'Usually inferred from arguments; can be passed explicitly: `useState<number>(0)`.',
      'Power built-ins like `Array<T>`, `Promise<T>`, `Map<K, V>`.',
      'Rule: a type param should appear at least twice (relate input to output); otherwise use a plain type.',
    ],
    code: `function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
const n = first([1, 2]);    // number | undefined
const s = first(['a']);     // string | undefined`,
  },
  {
    id: 'generic-constraints',
    group: 'Generics',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you constrain a generic type with `extends`?',
    a: [
      '`<T extends Shape>` requires `T` to be assignable to `Shape`, so you can use its members inside.',
      'Common: `<T extends object>`, `<T extends { length: number }>`, `<K extends keyof T>`.',
      'The constraint is a lower bound: `T` can still be a more specific subtype.',
      'Without a constraint `T` is effectively `unknown` inside the function.',
    ],
    code: `function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
getProp({ a: 1, b: 'x' }, 'b'); // string
// getProp({ a: 1 }, 'z');      // error`,
  },
  {
    id: 'keyof-operator',
    group: 'Generics',
    stars: 5,
    difficulty: 'Easy',
    q: 'What does `keyof` do?',
    a: [
      '`keyof T` produces a union of the (public) property keys of `T` as literal types.',
      '`keyof { a: 1; b: 2 }` is `"a" | "b"`.',
      'With an index signature `{ [k: string]: X }`, `keyof` is `string | number`.',
      'Combined with `typeof` for runtime objects: `keyof typeof config`.',
      'Foundation of mapped types and type-safe property access helpers.',
    ],
  },
  {
    id: 'typeof-type-operator',
    group: 'Generics',
    stars: 4,
    difficulty: 'Easy',
    q: 'What does `typeof` do in a type position?',
    a: [
      'In type context, `typeof value` gets the TypeScript type of a runtime variable or property.',
      'Different from JS runtime `typeof`, which returns a string like `"object"`.',
      'Lets you derive types from values instead of duplicating them: `type Config = typeof defaultConfig`.',
      'Often chained: `ReturnType<typeof fn>`, `keyof typeof obj`, `typeof arr[number]`.',
    ],
  },
  {
    id: 'indexed-access-types',
    group: 'Generics',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are indexed access types (`T[K]`)?',
    a: [
      'Look up the type of a property: `User["address"]`.',
      'Accepts unions: `User["id" | "name"]` yields the union of their types.',
      '`T[number]` gets the element type of an array or tuple.',
      'Used with generics: `function get<T, K extends keyof T>(o: T, k: K): T[K]`.',
    ],
    code: `type User = { id: number; tags: string[] };
type Id = User['id'];          // number
type Tag = User['tags'][number]; // string`,
  },
  {
    id: 'generic-defaults',
    group: 'Generics',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are default type parameters?',
    a: [
      'Generics can have defaults: `interface Res<T = unknown> { data: T }`.',
      'Used when the param is not given explicitly and cannot be inferred.',
      'Defaulted params must come after required ones.',
      'Can combine with constraints: `<T extends object = {}>`.',
    ],
  },
  {
    id: 'const-type-parameters',
    group: 'Generics',
    stars: 3,
    difficulty: 'Hard',
    q: 'What are `const` type parameters (TS 5.0)?',
    a: [
      '`<const T>` makes inference behave as if the argument had `as const`.',
      'Callers get literal and readonly tuple types without writing `as const` themselves.',
      'Only affects literals written directly in the call, not variables passed in.',
      'Pair with `readonly` constraints (`T extends readonly unknown[]`) for arrays.',
    ],
    code: `function routes<const T extends readonly string[]>(r: T) { return r; }
const r = routes(['/home', '/about']);
// readonly ['/home', '/about']`,
  },
  {
    id: 'generic-interfaces-and-classes',
    group: 'Generics',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you write generic interfaces, types and classes?',
    a: [
      'Interfaces/types: `interface Box<T> { value: T }`, `type Result<T, E = Error> = ...`.',
      'Classes: `class Stack<T> { private items: T[] = [] }`; the param is per-instance, not usable in static members.',
      'Generic API wrapper: `async function get<T>(url: string): Promise<T>` (note: this is an unchecked cast).',
      'Multiple params are common: `Map<K, V>`, `Result<T, E>`.',
    ],
  },
  {
    id: 'noinfer-utility',
    group: 'Generics',
    stars: 2,
    difficulty: 'Hard',
    q: 'What is `NoInfer<T>` (TS 5.4)?',
    a: [
      'Marks a position so TS does not use it as an inference site for `T`.',
      'Prevents a secondary argument from widening the inferred type.',
      'Example: default value must be one of the provided options, not expand the options.',
    ],
    code: `function pick<C extends string>(opts: C[], def: NoInfer<C>) {}
pick(['a', 'b'], 'c'); // error: 'c' not in 'a' | 'b'`,
  },
  {
    id: 'variance-annotations',
    group: 'Generics',
    stars: 1,
    difficulty: 'Hard',
    q: 'What are variance annotations (`in` / `out`) on type parameters?',
    a: [
      'Since TS 4.7: `out T` = covariant (only produced), `in T` = contravariant (only consumed), `in out T` = invariant.',
      'Covariant: `Box<Dog>` assignable to `Box<Animal>`; contravariant reverses it.',
      'Mostly for performance and documenting intent on complex types; TS normally infers variance.',
    ],
  },

  // ─────────────────────────── Utility Types ───────────────────────────
  {
    id: 'partial-required-readonly',
    group: 'Utility Types',
    stars: 5,
    difficulty: 'Easy',
    q: 'What do `Partial`, `Required` and `Readonly` do?',
    a: [
      '`Partial<T>` makes all properties optional; great for update/patch payloads.',
      '`Required<T>` makes all properties required (removes `?`).',
      '`Readonly<T>` marks all properties `readonly`.',
      'All are shallow: only top-level properties are affected.',
    ],
    code: `function update(id: string, patch: Partial<User>) {}
update('1', { name: 'new' });`,
  },
  {
    id: 'pick-omit',
    group: 'Utility Types',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are `Pick` and `Omit`?',
    a: [
      '`Pick<T, K>` builds a type with only the keys `K` from `T`.',
      '`Omit<T, K>` builds a type with all keys except `K`.',
      '`Pick` requires `K extends keyof T`; `Omit` accepts any key (typos are not caught).',
      'Common: `Omit<User, "password">` for public DTOs, `Pick<User, "id" | "name">` for previews.',
      '`Omit` on a union does not distribute; it collapses to common keys. Write a distributive version if needed.',
    ],
  },
  {
    id: 'record-type',
    group: 'Utility Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is `Record<K, V>`?',
    a: [
      'An object type with keys `K` and values `V`: `Record<string, number>`.',
      'With a literal union `K`, every key is required: `Record<"a" | "b", number>`.',
      'Great for lookup tables that must cover every enum/union member.',
      'Defined as a mapped type: `{ [P in K]: V }`.',
    ],
    code: `type Role = 'admin' | 'user';
const perms: Record<Role, string[]> = {
  admin: ['*'],
  user: ['read'],
}; // missing a role -> error`,
  },
  {
    id: 'exclude-extract-nonnullable',
    group: 'Utility Types',
    stars: 4,
    difficulty: 'Medium',
    q: 'What do `Exclude`, `Extract` and `NonNullable` do?',
    a: [
      'They operate on union members (not object keys).',
      '`Exclude<U, X>` removes members of `U` assignable to `X`: `Exclude<"a" | "b", "a">` is `"b"`.',
      '`Extract<U, X>` keeps only members assignable to `X`.',
      '`NonNullable<T>` removes `null` and `undefined`.',
      'Implemented as distributive conditional types: `T extends U ? never : T`.',
    ],
  },
  {
    id: 'returntype-parameters',
    group: 'Utility Types',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are `ReturnType` and `Parameters`?',
    a: [
      '`ReturnType<F>` extracts the return type of a function type.',
      '`Parameters<F>` extracts the parameter types as a tuple.',
      'Use with `typeof` for values: `ReturnType<typeof createStore>`.',
      'Handy for typing wrappers and for libraries that do not export their types.',
      'Both are built with `infer` in a conditional type.',
    ],
    code: `function make(id: number, name: string) { return { id, name }; }
type Made = ReturnType<typeof make>;   // { id: number; name: string }
type Args = Parameters<typeof make>;   // [id: number, name: string]`,
  },
  {
    id: 'implement-utility-types',
    group: 'Utility Types',
    stars: 4,
    difficulty: 'Medium',
    q: 'Implement `Partial`, `Pick`, `Omit` and `ReturnType` yourself.',
    a: [
      'A classic live-coding question that tests mapped types, `keyof` and `infer`.',
      '`Partial` maps every key with a `?` modifier.',
      '`Pick` maps over a subset of keys `K extends keyof T`.',
      '`Omit` = `Pick` of keys that are `Exclude`d.',
      '`ReturnType` uses `infer R` in the return position.',
    ],
    code: `type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type MyOmit<T, K extends PropertyKey> = MyPick<T, Exclude<keyof T, K>>;
type MyReturn<F> = F extends (...a: any[]) => infer R ? R : never;`,
  },
  {
    id: 'awaited-type',
    group: 'Utility Types',
    stars: 3,
    difficulty: 'Medium',
    q: 'What does `Awaited<T>` do?',
    a: [
      'Recursively unwraps the resolved type of a Promise (or thenable): `Awaited<Promise<Promise<number>>>` is `number`.',
      'Mirrors how `await` works; non-promise types pass through unchanged.',
      'Common pattern: `Awaited<ReturnType<typeof fetchUser>>`.',
      'Used internally by `Promise.all` typing.',
    ],
  },
  {
    id: 'deep-partial-readonly',
    group: 'Utility Types',
    stars: 3,
    difficulty: 'Hard',
    q: 'How would you write a `DeepPartial` or `DeepReadonly` type?',
    a: [
      'Built-in utilities are shallow; recursion handles nested objects.',
      'Recurse only into objects; leave primitives and functions as is.',
      'Arrays often need special handling to keep them arrays.',
      'Deep recursion can hit "type instantiation is excessively deep" on huge types.',
    ],
    code: `type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;`,
  },
  {
    id: 'instancetype-constructorparameters',
    group: 'Utility Types',
    stars: 2,
    difficulty: 'Medium',
    q: 'What are `InstanceType` and `ConstructorParameters`?',
    a: [
      '`InstanceType<typeof C>` gets the instance type produced by a constructor.',
      '`ConstructorParameters<typeof C>` gets the constructor args as a tuple.',
      'Useful for factories and DI containers that receive class references.',
      'Also `ThisParameterType` / `OmitThisParameter` for functions with a `this` param.',
    ],
  },
  {
    id: 'readonly-vs-object-freeze',
    group: 'Utility Types',
    stars: 2,
    difficulty: 'Easy',
    q: 'What is the difference between `Readonly<T>` and `Object.freeze`?',
    a: [
      '`Readonly<T>` is compile-time only; it is erased and does nothing at runtime.',
      '`Object.freeze` actually prevents mutation at runtime (shallowly) and TS types its result as `Readonly<T>`.',
      'Both are shallow; nested objects stay mutable.',
    ],
  },
  {
    id: 'string-manipulation-types',
    group: 'Utility Types',
    stars: 1,
    difficulty: 'Easy',
    q: 'What are the intrinsic string manipulation types?',
    a: [
      '`Uppercase<S>`, `Lowercase<S>`, `Capitalize<S>`, `Uncapitalize<S>`.',
      'Operate on string literal types, typically inside template literal types.',
      'Example: `Capitalize<"click">` is `"Click"`, used to build `onClick` handler names.',
    ],
  },

  // ─────────────────────────── Advanced Types ───────────────────────────
  {
    id: 'conditional-types',
    group: 'Advanced Types',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are conditional types?',
    a: [
      'Type-level ternary: `T extends U ? X : Y`.',
      'Resolve based on assignability; deferred while `T` is still generic.',
      'Power most utility types: `Exclude`, `Extract`, `NonNullable`, `ReturnType`.',
      'Combine with `infer` to extract parts of types.',
      'Distribute over unions when `T` is a naked type parameter.',
    ],
    code: `type IsString<T> = T extends string ? true : false;
type A = IsString<'x'>; // true
type B = IsString<42>;  // false`,
  },
  {
    id: 'mapped-types',
    group: 'Advanced Types',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are mapped types?',
    a: [
      'Create a new object type by iterating over keys: `{ [K in keyof T]: ... }`.',
      'Can transform the value type (`T[K] | null`) and modifiers (`?`, `readonly`).',
      'Basis of `Partial`, `Readonly`, `Record`, `Pick`.',
      'Homomorphic mapped types (`in keyof T`) preserve original optional/readonly modifiers.',
      'Can rename keys with `as` (key remapping).',
    ],
    code: `type Nullable<T> = { [K in keyof T]: T[K] | null };
type Flags<T> = { [K in keyof T]: boolean };`,
  },
  {
    id: 'infer-keyword',
    group: 'Advanced Types',
    stars: 4,
    difficulty: 'Hard',
    q: 'What does the `infer` keyword do?',
    a: [
      'Declares a type variable to capture inside the `extends` clause of a conditional type.',
      'Lets you pattern-match and extract: return types, element types, promise values, tuple heads.',
      'Only usable in the true branch of a conditional type.',
      'Can be constrained: `infer N extends number` (TS 4.7+).',
    ],
    code: `type ElementOf<T> = T extends (infer E)[] ? E : never;
type UnwrapPromise<T> = T extends Promise<infer V> ? V : T;
type Head<T> = T extends [infer H, ...unknown[]] ? H : never;`,
  },
  {
    id: 'distributive-conditional-types',
    group: 'Advanced Types',
    stars: 4,
    difficulty: 'Hard',
    q: 'What are distributive conditional types?',
    a: [
      'When the checked type is a naked type parameter and receives a union, the conditional is applied to each member.',
      '`ToArray<string | number>` gives `string[] | number[]`, not `(string | number)[]`.',
      'Prevent distribution by wrapping both sides in a tuple: `[T] extends [U]`.',
      '`never` is an empty union, so a distributive conditional on `never` yields `never`.',
    ],
    code: `type ToArray<T> = T extends any ? T[] : never;
type A = ToArray<string | number>;   // string[] | number[]
type NoDist<T> = [T] extends [any] ? T[] : never;
type B = NoDist<string | number>;    // (string | number)[]`,
  },
  {
    id: 'template-literal-types',
    group: 'Advanced Types',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are template literal types?',
    a: [
      'Build string literal types using template syntax at the type level.',
      'Unions expand to the cross product: `${"a" | "b"}-${1 | 2}` gives 4 literals.',
      'Combine with `Capitalize` etc. to generate event names, CSS props, route params.',
      'Can be pattern-matched with `infer` to parse strings.',
    ],
    code: `type Evt = 'click' | 'focus';
type Handler = \`on\${Capitalize<Evt>}\`; // 'onClick' | 'onFocus'

type Param<S> = S extends \`:\${infer P}\` ? P : never;
type P = Param<':id'>; // 'id'`,
  },
  {
    id: 'key-remapping',
    group: 'Advanced Types',
    stars: 3,
    difficulty: 'Hard',
    q: 'What is key remapping in mapped types (`as` clause)?',
    a: [
      'Since TS 4.1: `{ [K in keyof T as NewKey]: ... }` renames keys.',
      'Map a key to `never` to filter it out.',
      'Often combined with template literal types to generate getters/setters.',
    ],
    code: `type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};
type OnlyStrings<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};`,
  },
  {
    id: 'recursive-types',
    group: 'Advanced Types',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you write recursive types (e.g. JSON)?',
    a: [
      'Type aliases and interfaces can reference themselves.',
      'Used for trees, linked lists, nested JSON, deep utility types.',
      'Recursive conditional types are supported (TS 4.1+) but have depth limits (~1000 with tail recursion).',
    ],
    code: `type Json =
  | string | number | boolean | null
  | Json[]
  | { [key: string]: Json };

interface TreeNode { value: number; children: TreeNode[] }`,
  },
  {
    id: 'branded-types',
    group: 'Advanced Types',
    stars: 3,
    difficulty: 'Hard',
    q: 'What are branded (nominal / opaque) types?',
    a: [
      'Intersect a primitive with a unique phantom property so structurally identical types are not interchangeable.',
      'Prevents mixing `UserId` and `OrderId`, or raw vs validated strings.',
      'Values are created via a validating function or a single cast; zero runtime cost.',
      'Often use a `unique symbol` key or `__brand` property.',
    ],
    code: `type UserId = string & { readonly __brand: 'UserId' };
const toUserId = (s: string) => s as UserId;

function getUser(id: UserId) {}
getUser('abc');           // error
getUser(toUserId('abc')); // ok`,
  },
  {
    id: 'mapped-type-modifiers',
    group: 'Advanced Types',
    stars: 2,
    difficulty: 'Medium',
    q: 'How do you add or remove `readonly` and `?` in mapped types?',
    a: [
      'Prefix modifiers with `+` (add, default) or `-` (remove).',
      '`-readonly` makes properties mutable; `-?` makes them required.',
      '`Required<T>` is `{ [K in keyof T]-?: T[K] }`.',
    ],
    code: `type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type Concrete<T> = { [K in keyof T]-?: T[K] };`,
  },
  {
    id: 'function-parameter-bivariance',
    group: 'Advanced Types',
    stars: 2,
    difficulty: 'Hard',
    q: 'What is `strictFunctionTypes` and why are method parameters bivariant?',
    a: [
      'Function parameters should be contravariant: a handler for `Animal` can be used where a `Dog` handler is expected, not vice versa.',
      '`strictFunctionTypes` enforces contravariance for function-type properties (`fn: (x: T) => void`).',
      'Method-syntax members (`fn(x: T): void`) stay bivariant for backward compatibility (e.g. arrays, DOM events).',
      'Prefer property syntax in interfaces to get the stricter check.',
    ],
  },
  {
    id: 'variadic-tuple-types',
    group: 'Advanced Types',
    stars: 1,
    difficulty: 'Hard',
    q: 'What are variadic tuple types?',
    a: [
      'Spreads of generic tuples inside tuples: `[...T, ...U]` (TS 4.0+).',
      'Allow typing `concat`, `curry`, `bind` and function argument manipulation precisely.',
      'Example: `type Concat<A extends unknown[], B extends unknown[]> = [...A, ...B]`.',
    ],
  },

  // ─────────────────────────── Classes & OOP ───────────────────────────
  {
    id: 'access-modifiers',
    group: 'Classes & OOP',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are `public`, `private`, `protected` and how do they differ from `#private` fields?',
    a: [
      '`public` (default): accessible anywhere. `protected`: class and subclasses. `private`: only the declaring class.',
      'TS modifiers are compile-time only; at runtime the property is fully accessible (and bracket access bypasses checks).',
      'JS `#field` is truly private at runtime (hard privacy), enforced by the engine.',
      '`private` members make classes nominal-ish: two classes with same private member are not compatible.',
      'Use `#` when real encapsulation matters; TS `private` is fine for app code.',
    ],
  },
  {
    id: 'abstract-class-vs-interface',
    group: 'Classes & OOP',
    stars: 4,
    difficulty: 'Medium',
    q: 'Abstract class vs interface — when to use which?',
    a: [
      'Interface: pure type contract, no implementation, erased at runtime; a class can implement many.',
      'Abstract class: cannot be instantiated; can have implemented methods, fields, constructors and `abstract` members.',
      'A class can extend only one abstract class.',
      'Abstract classes exist at runtime (usable with `instanceof`).',
      'Use an abstract class to share code among subclasses; interface for contracts and decoupling.',
    ],
    code: `abstract class Repo<T> {
  abstract find(id: string): Promise<T>;
  async exists(id: string) { return !!(await this.find(id)); }
}`,
  },
  {
    id: 'implements-vs-extends',
    group: 'Classes & OOP',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between `implements` and `extends` for classes?',
    a: [
      '`extends` inherits implementation from one base class (runtime prototype chain) and enables `super`.',
      '`implements` only checks the class satisfies one or more interfaces; it adds no code or types to the class.',
      '`implements` does not contextually type method params; you must still annotate them.',
      'A class can `extends` one class and `implements` many interfaces.',
    ],
  },
  {
    id: 'readonly-vs-const',
    group: 'Classes & OOP',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between `readonly` and `const`?',
    a: [
      '`const` is for variables: the binding cannot be reassigned (runtime JS feature).',
      '`readonly` is for properties: cannot be reassigned after initialization (compile-time TS feature).',
      '`readonly` class fields can be assigned in the declaration or constructor.',
      'Neither makes the referenced object immutable (both are shallow).',
    ],
  },
  {
    id: 'decorators',
    group: 'Classes & OOP',
    stars: 4,
    difficulty: 'Hard',
    q: 'What are decorators in TypeScript 5?',
    a: [
      'Functions that annotate/modify classes and their members using `@expr` syntax.',
      'TS 5.0 implements the TC39 standard (stage 3) decorators: `(value, context) => replacement`.',
      'Legacy `experimentalDecorators` (used by Angular, NestJS, TypeORM) has a different signature and supports parameter decorators.',
      'Standard decorators do not support parameter decorators or `emitDecoratorMetadata`.',
      'Use cases: logging, memoization, DI, validation, route registration.',
    ],
    code: `function log(fn: any, ctx: ClassMethodDecoratorContext) {
  return function (this: any, ...args: any[]) {
    console.log('call', String(ctx.name));
    return fn.apply(this, args);
  };
}
class Svc { @log run() {} }`,
  },
  {
    id: 'parameter-properties',
    group: 'Classes & OOP',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are parameter properties in constructors?',
    a: [
      'Prefixing a constructor param with `public`/`private`/`protected`/`readonly` declares and assigns the field automatically.',
      'Reduces boilerplate: no separate field declaration and `this.x = x`.',
      'It is TS-only runtime syntax, so it is disallowed under `erasableSyntaxOnly` / Node type stripping.',
    ],
    code: `class User {
  constructor(private readonly id: string, public name: string) {}
}`,
  },
  {
    id: 'override-keyword',
    group: 'Classes & OOP',
    stars: 2,
    difficulty: 'Easy',
    q: 'What does the `override` keyword do?',
    a: [
      'Marks a method that overrides a base class member (TS 4.3+).',
      'Errors if the base member does not exist, catching renames and typos.',
      '`noImplicitOverride` requires `override` on every overriding member.',
    ],
  },
  {
    id: 'static-members',
    group: 'Classes & OOP',
    stars: 2,
    difficulty: 'Easy',
    q: 'How do static members and static blocks work in TS classes?',
    a: [
      '`static` members belong to the class constructor, not instances: `Counter.count`.',
      'They can use access modifiers: `private static instance` for singletons.',
      'Static members cannot reference class type params.',
      '`static {}` blocks run once for complex static initialization.',
    ],
  },
  {
    id: 'polymorphic-this',
    group: 'Classes & OOP',
    stars: 1,
    difficulty: 'Medium',
    q: 'What is the polymorphic `this` type?',
    a: [
      'Returning `this` in a method type refers to the type of the current (possibly subclass) instance.',
      'Enables fluent builder APIs where subclass methods remain chainable.',
      'Also used for `this is T` guards on class methods.',
    ],
  },

  // ─────────────────── Modules, Declarations & Config ───────────────────
  {
    id: 'tsconfig-key-options',
    group: 'Modules, Declarations & Config',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are the most important `tsconfig.json` options?',
    a: [
      '`strict`: enables all strict checks. `target`: JS version to emit (e.g. `ES2022`).',
      '`module` / `moduleResolution`: module system and how imports are resolved (`nodenext`, `bundler`).',
      '`lib`: built-in type libraries (`DOM`, `ES2023`). `jsx`: how JSX is handled (`react-jsx`, `preserve`).',
      '`outDir`, `rootDir`, `declaration`, `sourceMap`, `noEmit` (when a bundler emits).',
      '`paths` + `baseUrl` for aliases; `esModuleInterop`, `skipLibCheck`, `isolatedModules`, `noUncheckedIndexedAccess`.',
      '`include` / `exclude` / `files` decide which files are part of the program; `extends` shares base configs.',
    ],
  },
  {
    id: 'how-ts-compiles',
    group: 'Modules, Declarations & Config',
    stars: 4,
    difficulty: 'Medium',
    q: 'How is TypeScript compiled and what is type erasure?',
    a: [
      '`tsc` type-checks and emits JS; types are erased, so they never exist at runtime.',
      'Tools like esbuild, SWC, Babel and Vite strip types per file without type-checking (fast).',
      'So run `tsc --noEmit` separately (CI, editor) to actually check types.',
      '`isolatedModules` flags code that per-file transpilers cannot handle (e.g. re-exporting types without `export type`).',
      'Node 22.6+ / 23 can run `.ts` directly via type stripping; only erasable syntax works (no enums, namespaces).',
    ],
  },
  {
    id: 'declaration-files',
    group: 'Modules, Declarations & Config',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are `.d.ts` declaration files?',
    a: [
      'Files containing only type declarations, no implementation; they describe the shape of existing JS.',
      'Generated by `tsc` with `declaration: true` when publishing libraries.',
      'Used to type untyped JS libraries, globals and non-code imports (`declare module "*.svg"`).',
      'Libraries ship them via the `types` field or `exports` conditions in `package.json`.',
      '`skipLibCheck` skips type-checking `.d.ts` files to speed up builds.',
    ],
  },
  {
    id: 'declare-keyword',
    group: 'Modules, Declarations & Config',
    stars: 3,
    difficulty: 'Medium',
    q: 'What does the `declare` keyword do (ambient declarations)?',
    a: [
      'Tells TS something exists at runtime without emitting code for it.',
      '`declare const __DEV__: boolean;` for globals injected by bundlers.',
      '`declare module "lib" { ... }` types an untyped package; `declare module "*.css"` types asset imports.',
      '`declare global { ... }` inside a module adds to the global scope.',
    ],
  },
  {
    id: 'module-augmentation',
    group: 'Modules, Declarations & Config',
    stars: 3,
    difficulty: 'Hard',
    q: 'What is module augmentation? How do you add a property to Express `Request`?',
    a: [
      'Re-open an existing module declaration and add members via interface merging.',
      'The file must be a module (have an import/export) for `declare module` to augment rather than replace.',
      'Global augmentation: `declare global { interface Window { myApp: App } }`.',
      'Common for Express `req.user`, Vue/Pinia plugins, styled-components themes.',
    ],
    code: `import 'express';
declare global {
  namespace Express {
    interface Request { user?: { id: string } }
  }
}`,
  },
  {
    id: 'definitely-typed',
    group: 'Modules, Declarations & Config',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is DefinitelyTyped and `@types/*`?',
    a: [
      'A community repo of type declarations for JS packages that do not ship their own types.',
      'Installed as dev deps: `npm i -D @types/lodash @types/node`.',
      'TS auto-includes `node_modules/@types`; control with `types` / `typeRoots` in tsconfig.',
      'Many modern packages bundle their own types, so `@types` is not needed for them.',
    ],
  },
  {
    id: 'module-resolution',
    group: 'Modules, Declarations & Config',
    stars: 3,
    difficulty: 'Hard',
    q: 'What are the `moduleResolution` modes and which should you use?',
    a: [
      '`node16` / `nodenext`: follow Node ESM/CJS rules, respect `package.json` `exports` and require file extensions in ESM.',
      '`bundler`: for Vite/webpack/Next; supports `exports` but allows extensionless imports.',
      '`node10` (old `node`): legacy CommonJS resolution, ignores `exports`.',
      'Rule: Node apps/libraries use `nodenext`; bundled frontend apps use `bundler`.',
    ],
  },
  {
    id: 'esm-cjs-interop',
    group: 'Modules, Declarations & Config',
    stars: 3,
    difficulty: 'Medium',
    q: 'What do `esModuleInterop` and `allowSyntheticDefaultImports` do?',
    a: [
      'CommonJS modules have no real default export; `module.exports = fn` is the whole module.',
      '`esModuleInterop` emits helpers so `import fs from "fs"` works with CJS modules.',
      '`allowSyntheticDefaultImports` allows that syntax type-wise (implied by `esModuleInterop`).',
      'Without them you must write `import * as express from "express"`.',
    ],
  },
  {
    id: 'type-only-imports',
    group: 'Modules, Declarations & Config',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are type-only imports/exports and `verbatimModuleSyntax`?',
    a: [
      '`import type { User } from "./user"` is always fully erased, never producing a runtime import.',
      'Inline form: `import { type User, createUser } from "./user"`.',
      'Avoids side-effect imports and circular dependency issues; needed by single-file transpilers.',
      '`verbatimModuleSyntax` (TS 5.0): imports without `type` are kept as written, type ones are dropped; replaces older flags.',
    ],
  },
  {
    id: 'namespaces-vs-modules',
    group: 'Modules, Declarations & Config',
    stars: 2,
    difficulty: 'Easy',
    q: 'Namespaces vs ES modules?',
    a: [
      '`namespace X {}` (formerly internal modules) groups code under a global object; pre-ES-modules pattern.',
      'Modern code should use ES modules (`import`/`export`); each file is its own scope.',
      'Namespaces still appear in `.d.ts` files to describe global libraries and in declaration merging.',
      'Non-erasable runtime syntax, so it is avoided with Node type stripping and Babel.',
    ],
  },
  {
    id: 'project-references',
    group: 'Modules, Declarations & Config',
    stars: 2,
    difficulty: 'Hard',
    q: 'What are project references and `composite` builds?',
    a: [
      'Split a large repo/monorepo into smaller TS projects that reference each other via `references`.',
      'Each referenced project needs `composite: true` (enables `declaration` and incremental info).',
      'Build with `tsc --build` (`-b`), which only rebuilds changed projects; faster checks and editor perf.',
    ],
  },

  // ─────────────────────────── TS with React & Node ───────────────────────────
  {
    id: 'typing-react-props',
    group: 'TS with React & Node',
    stars: 5,
    difficulty: 'Easy',
    q: 'How do you type React component props?',
    a: [
      'Define a props `type`/`interface` and annotate the parameter: `function Btn({ label }: BtnProps)`.',
      '`React.FC` is optional and no longer recommended by many; it no longer adds implicit `children` (React 18+).',
      'Extend native element props: `React.ComponentProps<"button">` or `ButtonHTMLAttributes<HTMLButtonElement>`.',
      'Optional props with `?` and default values via destructuring defaults.',
      'Use discriminated unions for variant props that require different fields.',
    ],
    code: `type BtnProps = React.ComponentProps<'button'> & {
  variant?: 'primary' | 'ghost';
};
function Btn({ variant = 'primary', ...rest }: BtnProps) {
  return <button data-variant={variant} {...rest} />;
}`,
  },
  {
    id: 'typing-react-hooks',
    group: 'TS with React & Node',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you type `useState`, `useRef` and `useReducer`?',
    a: [
      '`useState` infers from the initial value; pass a generic when it starts empty: `useState<User | null>(null)`.',
      'DOM refs: `useRef<HTMLInputElement>(null)`; then `ref.current?.focus()`.',
      'Mutable value refs: `useRef<number>(0)`; in React 19 `useRef` always requires an argument.',
      '`useReducer`: type state and use a discriminated union for actions; the reducer return type drives inference.',
      'Custom hooks returning tuples should use `as const` to keep tuple types.',
    ],
  },
  {
    id: 'runtime-validation',
    group: 'TS with React & Node',
    stars: 4,
    difficulty: 'Medium',
    q: 'TS types are erased — how do you validate data from APIs at runtime?',
    a: [
      'Types do not check JSON from `fetch`, forms, env vars or DBs; `res.json() as User` is just a promise.',
      'Use a schema library (Zod, Valibot, ArkType, io-ts) to validate and infer types from one source.',
      '`z.infer<typeof schema>` derives the TS type so schema and type never drift.',
      'Validate at boundaries (API handlers, config loading); trust types internally.',
    ],
    code: `import { z } from 'zod';
const User = z.object({ id: z.string(), age: z.number() });
type User = z.infer<typeof User>;

const user = User.parse(await res.json()); // throws if invalid`,
  },
  {
    id: 'typing-react-events',
    group: 'TS with React & Node',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you type event handlers in React?',
    a: [
      'Inline handlers are contextually typed; no annotation needed.',
      'Separate handlers: `(e: React.ChangeEvent<HTMLInputElement>) => void`.',
      'Others: `React.MouseEvent<HTMLButtonElement>`, `React.FormEvent<HTMLFormElement>`, `React.KeyboardEvent`.',
      'Or type the whole handler: `const onChange: React.ChangeEventHandler<HTMLInputElement> = e => ...`.',
    ],
  },
  {
    id: 'react-children-types',
    group: 'TS with React & Node',
    stars: 3,
    difficulty: 'Medium',
    q: '`ReactNode` vs `ReactElement` vs `JSX.Element`?',
    a: [
      '`ReactNode`: anything renderable (elements, strings, numbers, arrays, `null`, `undefined`, booleans). Use for `children`.',
      '`ReactElement`: an object created by JSX / `createElement` with `type`, `props`, `key`.',
      '`JSX.Element` is essentially `ReactElement<any, any>`; the return type of a JSX expression.',
      '`PropsWithChildren<P>` adds `children?: ReactNode` to props.',
    ],
  },
  {
    id: 'typing-express',
    group: 'TS with React & Node',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you type Express handlers and request data?',
    a: [
      'Install `@types/express`; use `Request`, `Response`, `NextFunction` types.',
      'Generics on `Request<Params, ResBody, ReqBody, Query>` type `req.params`, `req.body`, `req.query`.',
      'Body typing is not validation; still validate with a schema.',
      'Extend `req` (e.g. `req.user`) via global `Express.Request` augmentation.',
    ],
    code: `import type { Request, Response } from 'express';

app.post('/users/:id', (req: Request<{ id: string }, {}, { name: string }>, res: Response) => {
  res.json({ id: req.params.id, name: req.body.name });
});`,
  },
  {
    id: 'generic-components',
    group: 'TS with React & Node',
    stars: 2,
    difficulty: 'Hard',
    q: 'How do you write a generic React component?',
    a: [
      'Declare a type param on the function: `function List<T>(props: ListProps<T>)`.',
      'T is inferred from props like `items`, so `renderItem` gets the right item type.',
      'In `.tsx` arrow functions, write `<T,>` (trailing comma) to avoid JSX parsing ambiguity.',
    ],
    code: `type ListProps<T> = { items: T[]; render: (item: T) => React.ReactNode };
function List<T>({ items, render }: ListProps<T>) {
  return <ul>{items.map(render)}</ul>;
}`,
  },
  {
    id: 'typing-env-variables',
    group: 'TS with React & Node',
    stars: 2,
    difficulty: 'Medium',
    q: 'How do you type `process.env` in Node?',
    a: [
      'By default every `process.env.X` is `string | undefined`.',
      'Augment `NodeJS.ProcessEnv` in a `.d.ts` to declare known keys (types only, no guarantee).',
      'Better: parse env once at startup with a schema (e.g. Zod) and export a typed config object.',
    ],
  },

  // ───────────────────────── Tricky & Output Questions ─────────────────────────
  {
    id: 'types-at-runtime',
    group: 'Tricky & Output Questions',
    stars: 5,
    difficulty: 'Medium',
    q: 'Can you check whether a value is of an interface type at runtime?',
    a: [
      'No. Interfaces and type aliases are erased; `x instanceof User` fails if `User` is an interface.',
      'You must check structure manually (type guard) or use a schema validator.',
      'Classes and enums do exist at runtime, so `instanceof` works for classes.',
      'Generic type params are also erased: you cannot do `typeof T` or `new T()` inside a function.',
    ],
  },
  {
    id: 'let-const-widening',
    group: 'Tricky & Output Questions',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are the inferred types here: `let a = "x"`, `const b = "x"`, `const c = { d: "x" }`, `const e = [1, "a"]`?',
    a: [
      '`a`: `string` (let widens because it can be reassigned).',
      '`b`: the literal `"x"`.',
      '`c`: `{ d: string }` (object properties are mutable, so they widen).',
      '`e`: `(string | number)[]`, not a tuple; use `as const` to get `readonly [1, "a"]`.',
    ],
  },
  {
    id: 'object-keys-string',
    group: 'Tricky & Output Questions',
    stars: 4,
    difficulty: 'Medium',
    q: 'Why does `Object.keys(obj)` return `string[]` instead of `(keyof T)[]`?',
    a: [
      'Because of structural typing, an object may have more properties at runtime than its type declares.',
      'Returning `keyof T` would be unsound: you could get keys the type does not know about.',
      'Workarounds: `Object.keys(o) as (keyof typeof o)[]` when you know it is exact, or iterate with a typed key list.',
      'Same reason `for (const k in obj)` gives `k: string`.',
    ],
  },
  {
    id: 'no-unchecked-indexed-access',
    group: 'Tricky & Output Questions',
    stars: 3,
    difficulty: 'Medium',
    q: 'Why does `const x = arr[10]` have type `number` instead of `number | undefined`?',
    a: [
      'By default TS assumes index access is in bounds for arrays and index signatures.',
      'This is a known unsoundness; out-of-range reads give `undefined` at runtime.',
      'Enable `noUncheckedIndexedAccess` to add `| undefined` to such reads.',
      'Tuples with known length and `for...of` loops are unaffected.',
    ],
  },
  {
    id: 'enum-reverse-mapping-output',
    group: 'Tricky & Output Questions',
    stars: 2,
    difficulty: 'Medium',
    q: 'Given `enum E { A, B = 5, C }`, what are `E.C`, `E[5]` and `Object.keys(E)`?',
    a: [
      '`E.C` is `6` (auto-increments from the previous value).',
      '`E[5]` is `"B"` via the numeric reverse mapping.',
      '`Object.keys(E)` is `["0", "5", "6", "A", "B", "C"]`: numeric enums contain both directions.',
      'String enum members have no reverse mapping.',
    ],
  },
  {
    id: 'is-typescript-sound',
    group: 'Tricky & Output Questions',
    stars: 1,
    difficulty: 'Hard',
    q: 'Is the TypeScript type system sound? Give examples of unsoundness.',
    a: [
      'No, by design; it trades soundness for productivity and JS compatibility.',
      'Examples: `any`, type assertions, unchecked index access, method parameter bivariance.',
      'Array covariance: a `Dog[]` passed as `Animal[]` can have a `Cat` pushed into it.',
      'Wrong type predicates and `Object.keys` workarounds also let incorrect types through.',
    ],
  },
];
