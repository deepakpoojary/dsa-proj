import type { BankQuestion } from './types';

// Fresher-friendly rewrite of TypeScript questions 1-50 (same ids, order and metadata
// as lib/interview-bank/typescript.ts). Each answer: ELI5 -> concept -> mechanics ->
// walkthrough -> use cases -> mistakes -> interview script.

export const TYPESCRIPT_1: BankQuestion[] = [
  // ───────────────────────── Basics & Types ─────────────────────────
  {
    id: 'what-is-typescript',
    group: 'Basics & Types',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is TypeScript and why use it over plain JavaScript?',
    a: [
      '# ELI5',
      'Imagine writing a letter and having a friend proofread it before you post it, pointing out spelling mistakes and missing addresses.',
      'The friend never changes what the letter says; they only warn you about mistakes before it goes out.',
      'Once the letter is checked, you post the plain letter; the friend does not travel with it.',
      'Mapping: JavaScript is the letter, TypeScript is the proofreading friend, and the post office (browser or Node.js) only ever receives plain JavaScript.',
      '# What it is',
      'TypeScript (TS) is a programming language made by Microsoft that adds types on top of JavaScript (JS).',
      'A type is a label that says what kind of value something holds, for example `string` (text), `number` or `boolean` (true/false).',
      'TS is a superset of JS — every valid JS program is (almost always) valid TS, and TS only adds extra syntax.',
      'TS is statically typed — types are checked before the program runs (at compile time), not while it runs (at runtime).',
      'The TypeScript compiler (`tsc`) reads your `.ts` files, reports type errors, then outputs plain `.js` files with all types removed. This removal is called type erasure.',
      'Because types are erased, TypeScript adds zero runtime cost: the code that runs is just JavaScript.',
      '# How it works',
      'You write code with type annotations, e.g. `function add(a: number, b: number): number`.',
      'The compiler builds a model of your program and checks each use of a value against its type:',
      '  Calling `add("1", 2)` is flagged because `"1"` is a string, not a number.',
      '  Accessing `user.nmae` is flagged because the property does not exist on the type.',
      'Your editor runs the same checker in the background, giving red squiggles, autocomplete and safe rename.',
      'At build time `tsc` (or a fast transpiler like esbuild, swc or Node 22+ type stripping) removes the types and outputs JS.',
      'Node.js or the browser runs that JS; no type information exists at runtime.',
      '# Example walkthrough',
      'Line 2 declares a `User` type: an object with `id` (number) and `name` (string).',
      'The `greet` function promises to take a `User` and return a string.',
      'The call `greet({ id: 1, name: "Asha" })` type-checks and at runtime prints `Hello, Asha`.',
      'The commented-out lines show bugs TS catches before running: a typo in `nmae` and passing a number instead of a `User`.',
      'In plain JS those bugs would only show up at runtime as `undefined` output or a crash.',
      '# Why it matters / when to use',
      'Backend APIs pass data through many layers (routes, services, database); types make sure each layer agrees on the data shape.',
      'Refactoring is safer: rename a field and the compiler lists every place that must change.',
      'Teams scale better because types act as living documentation of what each function expects and returns.',
      'Trade-offs: a build step, a learning curve, and types can lie if you abuse `any` or `as`.',
      '# Common mistakes',
      'Thinking TS checks data at runtime — it does not; validate untrusted input (request bodies, JSON) with a library like Zod.',
      'Using `any` everywhere to silence errors, which switches off the checker and throws away the benefit.',
      'Not enabling `strict: true` in `tsconfig.json`, so many null-related bugs are still allowed.',
      '# Say this in the interview',
      'TypeScript is a statically typed superset of JavaScript. It adds compile-time type checking and great editor tooling, then erases the types so the output is plain JavaScript with no runtime cost. I use it because it catches bugs like typos, wrong arguments and null access before the code runs, and it makes large codebases much safer to refactor.',
      'Follow-up: Does TypeScript validate API input at runtime?',
      '  No. Types are erased, so you need runtime validation (e.g. Zod) at trust boundaries like HTTP bodies.',
      'Follow-up: Can Node run TypeScript directly?',
      '  Node 22.6+ can strip types (default-on in Node 23.6+), but it does not type-check; you still run `tsc --noEmit` for checking.',
    ],
    code: `// A type describing the shape of a user object
type User = { id: number; name: string };

// Parameter type and return type are both declared
function greet(user: User): string {
  return "Hello, " + user.name;
}

console.log(greet({ id: 1, name: "Asha" })); // → Hello, Asha

// Bugs TypeScript catches BEFORE the code runs:
// console.log(user.nmae);          // error: Property 'nmae' does not exist
// greet(42);                       // error: number is not assignable to User
// greet({ id: "1", name: "Asha" }); // error: string is not assignable to number

// After compiling, the output JS is just:
// function greet(user) { return "Hello, " + user.name; }
`,
  },
  {
    id: 'any-unknown-never',
    group: 'Basics & Types',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between `any`, `unknown` and `never`?',
    a: [
      '# ELI5',
      '`any` is like a box with no label that everyone is allowed to open and use however they like — even if it holds a snake.',
      '`unknown` is a box with a warning sticker: "check what is inside before using it". You can put anything in, but you must look first.',
      '`never` is an empty box that can never be filled — it represents something that can never happen.',
      'Mapping: `any` = no safety, `unknown` = safe "anything", `never` = "impossible".',
      '# What it is',
      'A top type is a type that every value fits into. Both `any` and `unknown` are top types.',
      'A bottom type is a type that no value fits into. `never` is the bottom type.',
      'Comparison row — assigning a value TO it: `any` accepts anything; `unknown` accepts anything; `never` accepts nothing.',
      'Comparison row — using it: `any` lets you do anything (call it, read properties) with no checks; `unknown` lets you do nothing until you narrow it; `never` can be assigned to every type.',
      'Comparison row — safety: `any` is unsafe and spreads (anything touching it becomes `any`); `unknown` is safe; `never` is used by the compiler to prove code is complete.',
      'Narrowing means using a runtime check (like `typeof x === "string"`) so the compiler knows a more specific type inside that branch.',
      '# How it works',
      'With `any`, the checker simply stops checking that value:',
      '  `a.foo.bar()` compiles even if `a` is a number, then crashes at runtime.',
      'With `unknown`, every operation is an error until you prove the type:',
      '  After `if (typeof u === "number")`, the compiler treats `u` as `number` inside that block.',
      'With `never`, the compiler uses it to mean "this point is unreachable":',
      '  A function that always throws returns `never`.',
      '  After all union cases are handled in a `switch`, the leftover type is `never`.',
      '# Example walkthrough',
      '`let a: any = 1; a.foo.bar();` compiles fine but throws `TypeError` at runtime because `a.foo` is `undefined`.',
      '`let u: unknown = JSON.parse(text)` stores anything; calling `u.toFixed()` directly is a compile error.',
      'Inside `if (typeof u === "number")`, `u.toFixed(1)` is allowed and prints `42.0`.',
      '`fail("boom")` returns `never` because it always throws; the caller code after it is unreachable.',
      '# Why it matters / when to use',
      'Use `unknown` for anything you do not control: `JSON.parse` output, request bodies, `catch (err)` values, third-party data.',
      'Use `never` for exhaustiveness checks and for helper functions that always throw (e.g. `assertNever`).',
      'Use `any` only as a temporary escape hatch during migration from JS, and prefer `unknown` even then.',
      '# Common mistakes',
      'Typing JSON responses as `any`, which hides typos and shape changes; type them `unknown` and validate.',
      'Thinking `never` means "nothing returned" — that is `void`; `never` means "never returns at all".',
      'Using `as SomeType` on `unknown` instead of actually checking it; that is just `any` in disguise.',
      '# Say this in the interview',
      '`any` disables type checking entirely, so it is unsafe and spreads. `unknown` also accepts any value but forces you to narrow it before use, so it is the safe choice for untrusted data. `never` is the bottom type with no values; it is used for functions that never return and for proving a switch handles every case.',
      'Follow-up: What type is the error in `catch (err)`?',
      '  `unknown` when `useUnknownInCatchVariables` (part of `strict`) is on, so you check `err instanceof Error` first.',
      'Follow-up: What is `void` vs `never`?',
      '  `void` returns normally with no useful value; `never` does not return at all (throws or loops forever).',
    ],
    code: `// any: the checker gives up
let a: any = 1;
// a.foo.bar();               // compiles, but crashes at runtime: TypeError

// unknown: you must check before using
let u: unknown = JSON.parse("42");
// u.toFixed(1);              // compile error: 'u' is of type 'unknown'
if (typeof u === "number") {
  console.log(u.toFixed(1));  // → 42.0  (u is number here)
}

// never: a function that never returns normally
function fail(message: string): never {
  throw new Error(message);
}

try {
  fail("boom");
} catch (err: unknown) {
  if (err instanceof Error) console.log(err.message); // → boom
}
`,
  },
  {
    id: 'structural-typing',
    group: 'Basics & Types',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is structural typing (duck typing) in TypeScript?',
    a: [
      '# ELI5',
      'A swimming pool lifeguard only checks: "Can you swim?" They do not care what your name is or which school you come from.',
      'If you can swim, you are allowed in the deep end.',
      'Old saying: "If it walks like a duck and quacks like a duck, it is a duck."',
      'Mapping: TypeScript checks what properties a value has (can it swim?), not what the type is called (your name).',
      '# What it is',
      'Structural typing means two types are compatible if their structure (their properties and methods) matches, regardless of their names.',
      'The opposite is nominal typing (used by Java and C#), where types are only compatible if they are declared related with `extends` or `implements`.',
      'Rule: a value of type `B` can be used where `A` is expected if `B` has at least every member `A` requires (extra members are fine).',
      'Duck typing is the runtime version of the same idea in JS; TypeScript checks it at compile time.',
      '# How it works',
      'When you assign or pass a value, the compiler compares shapes:',
      '  It looks at each property required by the target type.',
      '  It checks the source has that property with a compatible type.',
      '  Extra properties on the source are ignored (except for fresh object literals, see excess property checks).',
      'Names of interfaces or classes play no part in this check.',
      'Classes are compared by their public instance members, so two unrelated classes with the same members are interchangeable.',
      'Exception: classes with `private` or `#private` fields are only compatible with themselves, which gives nominal-like behaviour.',
      '# Example walkthrough',
      '`Point` requires `x` and `y`. `Vec` is a class with `x`, `y` and `z`, but never mentions `Point`.',
      '`const p: Point = new Vec(1, 2)` compiles because `Vec` has everything `Point` needs.',
      '`printPoint(p)` prints `(1, 2)`.',
      'The branded `UserId` type adds a fake `__brand` property, so a plain number cannot be passed where a `UserId` is required.',
      '# Why it matters / when to use',
      'You can pass objects from any library to your functions as long as they have the right shape — no adapter classes needed.',
      'Mocks in tests are easy: a plain object with the right methods can replace a real database client.',
      'When you need to prevent mixing up values of the same shape (e.g. `UserId` vs `OrderId`, both numbers), use branded types.',
      '# Common mistakes',
      'Expecting `instanceof` checks to work on interfaces — interfaces do not exist at runtime.',
      'Assuming two different ID types are protected from mix-ups just because they have different names; `type UserId = number` is still just `number`.',
      'Being surprised that an object with extra fields is accepted; that is by design.',
      '# Say this in the interview',
      'TypeScript uses structural typing: compatibility depends on the shape of a type, not its name. If an object has at least all the members the target type requires, it is accepted, even without `implements` or `extends`. When I need nominal behaviour, like keeping `UserId` and `OrderId` apart, I use branded types or private class fields.',
      'Follow-up: What is a branded type?',
      '  An intersection like `number & { readonly __brand: "UserId" }` that plain numbers do not satisfy, so you must create it through a function.',
    ],
    code: `interface Point { x: number; y: number }

// Vec never says "implements Point"
class Vec {
  constructor(public x: number, public y: number, public z = 0) {}
}

function printPoint(p: Point) {
  console.log("(" + p.x + ", " + p.y + ")");
}

const p: Point = new Vec(1, 2); // ok: Vec has x and y (extra z is fine)
printPoint(p);                  // → (1, 2)
printPoint({ x: 5, y: 6 });     // → (5, 6)  plain object works too

// Simulating nominal types with a "brand"
type UserId = number & { readonly __brand: "UserId" };
const toUserId = (n: number) => n as UserId;

function loadUser(id: UserId) { console.log("loading", id); }
loadUser(toUserId(7));          // → loading 7
// loadUser(7);                 // error: number is not assignable to UserId
`,
  },
  {
    id: 'type-inference',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'How does type inference work and when should you annotate explicitly?',
    a: [
      '# ELI5',
      'If you see a friend carrying a football, you guess they are going to play football — nobody has to tell you.',
      'But for a stranger at your door, you ask "who are you?" because you cannot guess.',
      'Mapping: TypeScript guesses types when it can see the value (inference) and needs you to tell it when it cannot (annotation).',
      '# What it is',
      'Type inference is the compiler working out a type automatically from the code, without you writing it.',
      'A type annotation is when you write the type yourself, like `let age: number = 30`.',
      'Contextual typing is inference that flows from where something is used, e.g. a callback passed to `arr.map` gets its parameter type from the array.',
      'Widening is when the compiler picks a broader type, e.g. `let x = 5` becomes `number` (not the exact value `5`) because `let` can change.',
      '# How it works',
      'From initializers: `let count = 0` gives `count: number`.',
      'From `const`: `const port = 3000` gives the literal type `3000` because it can never change.',
      'From return statements: a function returning `a + b` of two numbers gets return type `number`.',
      'From default parameters: `function f(retries = 3)` gives `retries: number`.',
      'From context: in `[1, 2].map(n => n * 2)`, `n` is inferred as `number`.',
      'From multiple values: `[1, "a"]` is inferred as `(string | number)[]`, the best common type.',
      'Parameters of standalone functions are never inferred from how they are called — without an annotation they become `any` (an error under `strict`).',
      '# Example walkthrough',
      '`let count = 0` → `number`; `const port = 3000` → literal `3000`.',
      '`const doubled = nums.map(n => n * 2)` → `number[]`; `n` is contextually typed.',
      '`function add(a: number, b: number)` annotates the params; the return type `number` is inferred.',
      '`const items: string[] = []` needs an annotation, otherwise an empty array would be poorly typed.',
      'The exported `getUser` function annotates its return type so a mistake inside cannot silently change the public contract.',
      '# Why it matters / when to use',
      'Let inference handle local variables — less noise, same safety.',
      'Annotate: function parameters, empty arrays/objects, exported/public function return types, and values whose type should be wider than the first assignment.',
      'Explicit return types on API handlers and services stop accidental changes from leaking to callers.',
      '# Common mistakes',
      'Over-annotating every variable (`const name: string = "x"`), which adds clutter.',
      'Leaving `[]` unannotated and later being surprised by `never[]` or `any[]` errors.',
      'Forgetting to annotate parameters, getting implicit `any` when `strict` is off.',
      '# Say this in the interview',
      'TypeScript infers types from initializers, return statements, default values and context such as callback parameters. I let it infer local variables, but I always annotate function parameters, empty collections, and return types of exported or public functions, because those form the contract other code relies on.',
      'Follow-up: Why does `let x = "a"` give `string` but `const x = "a"` gives `"a"`?',
      '  `let` can be reassigned so TS widens it; `const` cannot, so it keeps the exact literal.',
    ],
    code: `let count = 0;             // inferred: number
const port = 3000;          // inferred: 3000 (literal type)

const nums = [1, 2, 3];     // inferred: number[]
const doubled = nums.map(n => n * 2); // n: number (contextual), result: number[]
console.log(doubled);       // → [ 2, 4, 6 ]

// Parameters MUST be annotated; return type is inferred as number
function add(a: number, b: number) {
  return a + b;
}
console.log(add(2, 3));     // → 5

// Empty array: annotate, otherwise TS cannot know what goes in
const items: string[] = [];
items.push("pen");
console.log(items);         // → [ 'pen' ]

// Public function: explicit return type locks the contract
type User = { id: number; name: string };
export function getUser(id: number): User {
  return { id, name: "Asha" };
}
console.log(getUser(1));    // → { id: 1, name: 'Asha' }
`,
  },
  {
    id: 'strict-mode',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'What does `strict: true` enable and why does it matter?',
    a: [
      '# ELI5',
      'A driving instructor can be relaxed ("eh, close enough") or strict ("stop fully at every stop sign").',
      'The strict instructor annoys you a little more now, but you crash far less later.',
      'Mapping: `strict: true` turns the TypeScript checker from relaxed to strict, catching many more bugs before they reach production.',
      '# What it is',
      '`strict` is a single option in `tsconfig.json` (the TypeScript project config file) that switches on a whole family of stricter checks at once.',
      '`strictNullChecks` — `null` and `undefined` are no longer allowed in every type; you must handle them explicitly.',
      '`noImplicitAny` — error when TS cannot infer a type and would silently use `any`.',
      '`strictFunctionTypes` — function parameters are checked more correctly when assigning one function type to another.',
      '`strictBindCallApply` — checks arguments passed to `fn.call`, `fn.apply` and `fn.bind`.',
      '`strictPropertyInitialization` — class properties must be set in the constructor or declared optional.',
      '`noImplicitThis` — error when `this` has an implicit `any` type.',
      '`useUnknownInCatchVariables` — the error in `catch (err)` is `unknown` instead of `any`.',
      '`alwaysStrict` — emits `"use strict"` and parses files in JS strict mode.',
      '# How it works',
      'You add `"strict": true` under `compilerOptions` in `tsconfig.json`.',
      'The compiler turns on every flag in the strict family.',
      'You can still turn one off individually, e.g. `"strict": true, "strictPropertyInitialization": false`.',
      'When a new TS version adds a new strict-family flag, projects with `strict: true` get it automatically.',
      '# Example walkthrough',
      '`findUser` returns `User | undefined` because `Array.find` may find nothing.',
      'Without strict null checks, `user.name` would compile and crash at runtime when no user exists.',
      'With strict on, `user.name` is an error until you check `if (user)`; the code then safely prints `Asha` or `not found`.',
      'The `catch (err)` block must check `err instanceof Error` because `err` is `unknown`.',
      '# Why it matters / when to use',
      'Null/undefined access ("Cannot read properties of undefined") is the most common JS runtime crash; `strictNullChecks` prevents most of them.',
      'Always enable it for new projects; for old JS migrations, enable it gradually, flag by flag.',
      'Related extra flags many teams also add: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`.',
      '# Common mistakes',
      'Starting a project without `strict` and finding hundreds of errors when turning it on later.',
      'Silencing new null errors with `!` everywhere instead of handling the missing case.',
      'Assuming `strict` includes `noUncheckedIndexedAccess` — it does not; enable that separately.',
      '# Say this in the interview',
      '`strict: true` is an umbrella flag that enables the whole strict family, most importantly `strictNullChecks` and `noImplicitAny`, plus stricter checks on functions, class initialization and catch variables. It matters because it eliminates the most common runtime bugs like reading properties of undefined, and new strict checks are adopted automatically.',
      'Follow-up: Is `noUncheckedIndexedAccess` part of strict?',
      '  No. It makes `arr[i]` and `record[key]` include `undefined`, and must be enabled separately.',
    ],
    code: `// tsconfig.json → { "compilerOptions": { "strict": true } }

type User = { id: number; name: string };
const users: User[] = [{ id: 1, name: "Asha" }];

function findUser(id: number): User | undefined {
  return users.find(u => u.id === id);
}

const user = findUser(2);
// console.log(user.name);    // strict error: 'user' is possibly 'undefined'

if (user) {
  console.log(user.name);     // safe: user is User here
} else {
  console.log("not found");   // → not found
}

try {
  throw new Error("db down");
} catch (err) {               // err: unknown (useUnknownInCatchVariables)
  if (err instanceof Error) console.log(err.message); // → db down
}

// noImplicitAny: function log(msg) {}  → error: parameter implicitly has 'any' type
`,
  },
  {
    id: 'enums',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do enums work? Enum vs `const enum` vs union of string literals?',
    a: [
      '# ELI5',
      'A traffic light has only three allowed colours: red, yellow, green. You cannot have "purple".',
      'You could write the colours on a printed card you carry around (a real object), or just agree on the words in your head (no card).',
      'Mapping: an enum is a named, fixed list of allowed values; a regular enum is the printed card (exists at runtime), a string-literal union is just the agreement (types only).',
      '# What it is',
      'An enum is a TypeScript feature that defines a set of named constants, like `enum Dir { Up, Down }`.',
      'Numeric enum: members get numbers starting at 0 (`Up = 0`, `Down = 1`) and also get a reverse mapping, so `Dir[0]` is `"Up"`.',
      'String enum: each member is given a string, e.g. `enum Status { Ok = "ok" }`; no reverse mapping.',
      'Regular enums are one of the few TS features that emit real JS code — an object exists at runtime.',
      '`const enum`: the compiler replaces each use with the literal value (inlining) and emits no object.',
      'Union of string literals: `type Dir = "up" | "down"` — pure types, nothing emitted, works with plain strings.',
      'Comparison row — runtime object: enum yes; const enum no; union no.',
      'Comparison row — plain string assignable: enum no (must use `Status.Ok`); union yes (`"ok"` works).',
      'Comparison row — works with per-file transpilers (esbuild, swc, Node type stripping): union yes; enum not with Node type stripping; const enum is unsafe across files.',
      '# How it works',
      'For `enum Dir { Up, Down }` the compiler emits roughly `Dir[Dir["Up"] = 0] = "Up"`, building a two-way object.',
      'For `const enum`, every `Dir.Up` in your code is replaced by `0` at compile time.',
      'Per-file transpilers compile one file at a time, so they cannot see a `const enum` from another file; that is why `isolatedModules` forbids using them across files.',
      'Node 22+ type stripping (`--experimental-strip-types`) only deletes type syntax; enums need code generation, so they are not supported in that mode (they need `--experimental-transform-types`).',
      'The modern alternative: an `as const` object gives a runtime object AND a union type with no enum.',
      '# Example walkthrough',
      '`enum Dir { Up, Down }` gives `Dir.Up === 0` and `Dir[0] === "Up"`.',
      '`type DirU = "up" | "down"` accepts the plain string `"up"`.',
      '`const Status = { Ok: "ok", Err: "err" } as const` creates a frozen-typed runtime object.',
      '`type Status = (typeof Status)[keyof typeof Status]` extracts `"ok" | "err"` from it.',
      'Printing `Object.values(Status)` gives `[ "ok", "err" ]`, useful for validation lists.',
      '# Why it matters / when to use',
      'Use string-literal unions for most cases (status fields, HTTP methods) — zero runtime cost, works with JSON data.',
      'Use an `as const` object when you also need to loop over the values at runtime (e.g. validation, dropdowns).',
      'Enums are fine in existing codebases; many teams avoid new ones for compatibility with modern tooling.',
      '# Common mistakes',
      'Comparing a string from JSON (`"ok"`) to a string enum without converting — the types do not match.',
      'Using numeric enums and getting surprised that any number is accepted in older TS versions (TS 5.0+ is stricter).',
      'Using `const enum` in a library or with esbuild/swc and getting runtime `undefined` errors.',
      '# Say this in the interview',
      'Enums define named constants and, unlike most TS features, emit a real object at runtime; numeric enums even get a reverse mapping. A `const enum` inlines values and emits nothing, but breaks with per-file transpilers. In modern code I usually prefer a union of string literals, or an `as const` object when I need runtime values too, because they are zero-cost and work with plain strings.',
      'Follow-up: How do you get a union type from an `as const` object?',
      '  `type Status = (typeof Status)[keyof typeof Status]`.',
    ],
    code: `// 1) Numeric enum: emits an object with reverse mapping
enum Dir { Up, Down }
console.log(Dir.Up, Dir[0]);      // → 0 Up

// 2) String enum: no reverse mapping, plain strings NOT assignable
enum Level { Info = "info", Warn = "warn" }
const lvl: Level = Level.Warn;     // const bad: Level = "warn"; → error
console.log(lvl);                  // → warn

// 3) Union of string literals: no runtime code at all
type DirU = "up" | "down";
const move: DirU = "up";           // plain string is fine
console.log(move);                 // → up

// 4) as const object: runtime values + union type
const Status = { Ok: "ok", Err: "err" } as const;
type Status = (typeof Status)[keyof typeof Status]; // "ok" | "err"

function isStatus(x: string): x is Status {
  return (Object.values(Status) as string[]).includes(x);
}
console.log(Object.values(Status)); // → [ 'ok', 'err' ]
console.log(isStatus("ok"));        // → true
`,
  },
  {
    id: 'type-assertions',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are type assertions (`as`) and the non-null assertion (`!`)? When are they dangerous?',
    a: [
      '# ELI5',
      'A security guard checks bags at the door. You say "trust me, this bag only has books" and the guard waves you through without looking.',
      'If the bag actually has something dangerous, nobody notices until it is too late.',
      'Mapping: `as` and `!` are you telling the compiler "trust me" — it stops checking, and if you are wrong the program crashes at runtime.',
      '# What it is',
      'A type assertion (`value as T`) tells the compiler to treat a value as type `T`. It does not change or check the value at runtime.',
      'The older syntax `<T>value` means the same thing but clashes with JSX (React markup), so `as` is preferred.',
      'The non-null assertion operator (`value!`) removes `null` and `undefined` from a type, e.g. `string | undefined` becomes `string`.',
      'Both are compile-time only: after compilation, `x as Foo` becomes `x` and `x!` becomes `x`.',
      'A double assertion (`x as unknown as T`) forces any conversion and is a red flag in code review.',
      '# How it works',
      'The compiler allows `x as T` only if the types sufficiently overlap (one is assignable to the other):',
      '  `"hello" as string` is fine; `"hello" as number` is an error.',
      '  `as unknown as number` bypasses that check because everything converts to and from `unknown`.',
      'For `x!`, the compiler simply deletes `null | undefined` from the type.',
      'At runtime nothing happens — no check, no conversion — so a wrong assertion becomes a crash later.',
      '# Example walkthrough',
      '`JSON.parse(body)` returns `any`; `as User` makes the compiler treat it as `User`.',
      'The JSON actually has a typo (`nmae`), so `user.name` prints `undefined` even though TS thinks it is a string.',
      '`env["PORT"]!` claims the value is never undefined; it is missing, so `parseInt` gets `undefined` and returns `NaN`.',
      'The safe `getPort` checks `if (port === undefined)` and the compiler narrows `port` to `string` on its own, printing `3000`.',
      '# Why it matters / when to use',
      'Legitimate uses: DOM elements you know the type of, tests, and narrowing that the compiler cannot follow.',
      'In backend code prefer runtime validation (Zod, type guards) for request bodies instead of `as`.',
      'Prefer `satisfies` when you only want to check a value against a type without changing its type.',
      '# Common mistakes',
      'Casting API/JSON data with `as` and assuming it is validated — it is not.',
      'Sprinkling `!` to silence `strictNullChecks` errors instead of handling the missing case.',
      'Using `as unknown as T` to force incompatible types, hiding a real design problem.',
      '# Say this in the interview',
      'A type assertion with `as` tells the compiler to treat a value as a given type, and `!` removes null and undefined, but neither does any runtime check. They are dangerous because if I am wrong the code compiles and then crashes. I prefer narrowing, type guards, runtime validation or `satisfies`, and keep assertions as a rare escape hatch.',
      'Follow-up: When would you use `as const` vs `as T`?',
      '  `as const` only makes types narrower and readonly (safe); `as T` overrides the type (unsafe).',
    ],
    code: `type User = { id: number; name: string };

// "Trust me" — no runtime check happens
const body = '{"id": 1, "nmae": "typo"}';
const user = JSON.parse(body) as User;
console.log(user.name);            // → undefined  (compiler thought it was string!)
// user.name.toUpperCase();        // TypeError at runtime

// Non-null assertion: removes undefined from the type
const env: Record<string, string | undefined> = {};
const portBad = env["PORT"]!;      // type string, but value is undefined
console.log(parseInt(portBad));    // → NaN

// Safer: actually check, and TS narrows for you
function getPort(): number {
  const port = env["PORT"];
  if (port === undefined) return 3000; // fallback
  return parseInt(port, 10);           // port: string here
}
console.log(getPort());            // → 3000

// Not allowed without a double assertion (red flag):
// const n = "hello" as number;            // error
// const n = "hello" as unknown as number; // compiles, but is a lie
`,
  },
  {
    id: 'satisfies-operator',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Medium',
    q: 'What does the `satisfies` operator do and how is it different from an annotation or `as`?',
    a: [
      '# ELI5',
      'A teacher checks your homework against the rules ("must have 5 answers") and hands back your exact homework, with all your details intact.',
      'An annotation is like the teacher replacing your homework with a blank template that only says "5 answers" — the details are lost.',
      '`as` is like the teacher not checking at all and just stamping "approved".',
      'Mapping: `satisfies` checks a value against a type but keeps the exact, detailed type TypeScript inferred.',
      '# What it is',
      '`expr satisfies T` (added in TS 4.9) checks that `expr` matches type `T`, but the resulting type is still the narrow type inferred from `expr`.',
      'Comparison row — annotation `const x: T = value`: checks the value, but the variable type becomes exactly `T` (details lost).',
      'Comparison row — `value as T`: barely checks, and the type becomes `T` (unsafe).',
      'Comparison row — `value satisfies T`: checks fully (including excess and missing properties) and keeps the precise inferred type.',
      'A "precise inferred type" means TS remembers, for example, that `green` is a `string` and `red` is a `number[]`, not just `string | number[]`.',
      '# How it works',
      'The compiler infers the type of the expression as usual.',
      'It then checks that inferred type is assignable to `T`, reporting typos, missing keys or wrong value types.',
      'The expression keeps its inferred type, so later code gets precise autocomplete.',
      'Combine with `as const` (`as const satisfies T`) to get readonly literal types that are also validated.',
      '# Example walkthrough',
      '`Colors` says every value is a `string` or an array of numbers.',
      'With `satisfies Colors`, `palette.green` is still known to be a `string`, so `.toUpperCase()` works and prints `#00FF00`.',
      '`palette.red` is still known to be `number[]`, so `.map` works and prints `[ 254, 0, 0 ]`.',
      'With an annotation (`const p2: Colors`), `p2.green` is `string | number[]` and `.toUpperCase()` is an error.',
      'The `Route` example shows `as` letting a missing `auth` property through, printing `undefined`.',
      'The `routes` object uses `as const satisfies` so the paths stay exact literals and each one is checked to start with `/`.',
      '# Why it matters / when to use',
      'Config objects, route tables, error-code maps, and feature-flag lists where you want validation and exact keys.',
      'Keeps autocomplete on specific keys (`routes.home`) instead of a generic `Record<string, string>`.',
      '# Common mistakes',
      'Using `as` to "check" a config object — `as` does not catch missing properties.',
      'Expecting `satisfies` to change the variable type; it never does.',
      'Annotating with `Record<string, X>` and losing the specific key names.',
      '# Say this in the interview',
      '`satisfies` validates that a value conforms to a type while keeping the narrower type TypeScript inferred. An annotation also validates but widens the variable to the declared type, and `as` just overrides the type with almost no checking. I use `satisfies` for config objects and lookup maps where I want both validation and precise keys.',
      'Follow-up: Does `satisfies` emit any code?',
      '  No. Like all type syntax it is erased; the output is just the object.',
    ],
    code: `type Colors = Record<string, string | number[]>;

// satisfies: checked against Colors, but precise types are kept
const palette = {
  red: [254, 0, 0],
  green: "#00ff00",
} satisfies Colors;

console.log(palette.green.toUpperCase()); // → #00FF00 (known: string)
console.log(palette.red.map(n => n));     // → [ 254, 0, 0 ] (known: number[])

// Annotation: checked, but widened to Colors
const p2: Colors = { green: "#00ff00" };
// p2.green.toUpperCase();   // error: string | number[] has no toUpperCase

// as: NOT really checked (missing keys pass)
type Route = { path: string; auth: boolean };
const r = { path: "/x" } as Route; // no error even though auth is missing
console.log(r.auth);                // → undefined

// as const + satisfies: readonly literals AND validation
const routes = {
  home: "/",
  users: "/users",
} as const satisfies Record<string, \`/\${string}\`>;
type Path = (typeof routes)[keyof typeof routes]; // "/" | "/users"
console.log(routes.users);          // → /users
`,
  },
  {
    id: 'as-const',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'What does `as const` do?',
    a: [
      '# ELI5',
      'Writing "my favourite colour is blue" in pen instead of pencil — it cannot be changed, and everyone knows it is exactly "blue", not just "some colour".',
      'Mapping: `as const` tells TypeScript the value is exact and unchangeable, so it keeps the most specific type.',
      '# What it is',
      '`as const` is a const assertion — a special assertion that makes TypeScript infer the narrowest possible types.',
      'A literal type is a type for one exact value, like `"admin"` or `42`, instead of the general `string` or `number`.',
      'Strings and numbers become literal types: `"dark"` instead of `string`.',
      'Object properties become `readonly` (cannot be reassigned through the type).',
      'Arrays become `readonly` tuples — a tuple is a fixed-length array with a known type at each position.',
      'It is compile-time only: the object is NOT frozen at runtime (use `Object.freeze` for that).',
      '# How it works',
      'Normally TS widens values: `["admin", "user"]` becomes `string[]`.',
      'With `as const`, TS stops widening:',
      '  `["admin", "user"] as const` becomes `readonly ["admin", "user"]`.',
      '  `{ mode: "dark" } as const` becomes `{ readonly mode: "dark" }`.',
      'You can then derive a union type from the runtime values with `(typeof arr)[number]`.',
      '  `typeof roles` gets the TS type of the `roles` variable; `[number]` reads the type of any element.',
      '# Example walkthrough',
      '`roles` is `readonly ["admin", "user"]`, so `Role` is `"admin" | "user"`.',
      '`hasRole("admin")` compiles and prints `true`; `hasRole("root")` would be a compile error.',
      '`cfg.mode = "light"` is a compile error because `mode` is readonly.',
      'Looping `for (const r of roles)` prints `admin` then `user` — the runtime array is still there.',
      'The last lines prove nothing is frozen: pushing into `loose` works and `Object.isFrozen(cfg)` is `false`.',
      '# Why it matters / when to use',
      'One source of truth: define a list of allowed values once, use it at runtime (validation) and as a type.',
      'Defining constants like HTTP methods, event names, permission lists, and route maps.',
      'Returning tuples from functions: `return [value, setValue] as const` so callers get exact positions.',
      '# Common mistakes',
      'Thinking it freezes the object at runtime — it does not; JS code can still mutate it.',
      'Passing an `as const` array to a function expecting `string[]` (mutable) — fails because readonly is not assignable to mutable; make the parameter `readonly string[]`.',
      'Confusing `as const` with `const` declarations; `const` only stops reassigning the variable, not widening of its properties.',
      '# Say this in the interview',
      '`as const` is a const assertion that tells TypeScript to infer the narrowest literal types and make everything readonly: strings become literal types, objects get readonly properties and arrays become readonly tuples. I use it to define a list of allowed values once and derive a union type from it with `(typeof arr)[number]`. It does not freeze anything at runtime.',
      'Follow-up: How is it different from `Object.freeze`?',
      '  `Object.freeze` blocks mutation at runtime (shallowly); `as const` only affects types.',
    ],
    code: `// Without as const: widened types
const loose = ["admin", "user"];          // string[]

// With as const: exact readonly tuple
const roles = ["admin", "user"] as const; // readonly ["admin", "user"]
type Role = (typeof roles)[number];       // "admin" | "user"

function hasRole(role: Role) {
  return roles.includes(role);
}
console.log(hasRole("admin"));            // → true
// hasRole("root");                       // compile error

const cfg = { mode: "dark", retries: 3 } as const;
// type: { readonly mode: "dark"; readonly retries: 3 }
// cfg.mode = "light";                    // compile error: read-only

for (const r of roles) console.log(r);    // → admin, then user

// Runtime is NOT frozen:
loose.push("guest");
console.log(loose.length);                // → 3
console.log(Object.isFrozen(cfg));        // → false
`,
  },
  {
    id: 'literal-types',
    group: 'Basics & Types',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are literal types and type widening?',
    a: [
      '# ELI5',
      'A lift (elevator) button labelled "3" only takes you to floor 3 — not "any floor".',
      'A literal type is like that button: it allows one exact value.',
      'Widening is like TypeScript deciding "this button could be relabelled later, so I will treat it as any floor".',
      'Mapping: literal type = one exact value; widening = TS generalising to the broader type.',
      '# What it is',
      'A literal type represents exactly one value: `"GET"`, `42` or `true`.',
      'Unions of literals model a fixed set of choices cheaply: `type Method = "GET" | "POST"`.',
      'Type widening is when TS infers a broader type than the literal, e.g. `string` instead of `"GET"`.',
      '`let` variables widen (they can be reassigned); `const` variables keep the literal (they cannot).',
      'Object properties widen too, because properties can be reassigned: `{ m: "GET" }` gives `{ m: string }`.',
      '# How it works',
      '`const m = "GET"` → type `"GET"`.',
      '`let m = "GET"` → type `string`.',
      '`const req = { method: "GET" }` → `{ method: string }`.',
      'When you then pass `req.method` to a function needing `Method`, TS complains because `string` is too broad.',
      'Fixes:',
      '  Annotate: `const req: { method: Method } = { method: "GET" }`.',
      '  Use `as const` on the object or on the value: `{ method: "GET" as const }`.',
      '  Use `satisfies` to check while keeping literals.',
      '# Example walkthrough',
      '`send(m1)` compiles because `m1` kept the literal `"GET"`, and prints `sending GET`.',
      '`send(m2)` would fail because `let m2` widened to `string`.',
      '`send(req.method)` would fail because the property widened to `string`.',
      'The `as const` version keeps `"POST"` and `send(fixed.method)` prints `sending POST`.',
      'The annotated `typed` object also works because its property type is declared as `Method`.',
      '# Why it matters / when to use',
      'HTTP methods, status values, event names and log levels are naturally literal unions.',
      'Understanding widening explains many confusing "string is not assignable to ..." errors.',
      '# Common mistakes',
      'Building an options object first, then passing it to a typed function, and getting a widening error.',
      'Using a plain `string` where only a few values are valid, losing autocomplete and safety.',
      '# Say this in the interview',
      'A literal type is a type for one exact value like `"GET"` or `42`, and unions of literals model a fixed set of options. Widening is TypeScript inferring the broader type, which happens for `let` variables and object properties because they can change. I fix widening with annotations, `as const` or `satisfies`.',
      'Follow-up: Why does `const x = { a: "y" }` widen `a`?',
      '  `const` only protects the variable binding; the property `a` can still be reassigned, so TS widens it to `string`.',
    ],
    code: `type Method = "GET" | "POST";

function send(method: Method) {
  console.log("sending " + method);
}

const m1 = "GET";       // type "GET"   (const keeps the literal)
let m2 = "GET";         // type string  (let widens)

send(m1);               // → sending GET
// send(m2);            // error: string is not assignable to Method

const req = { method: "POST" };      // { method: string } (property widened)
// send(req.method);                 // error

const fixed = { method: "POST" } as const; // { readonly method: "POST" }
send(fixed.method);                  // → sending POST

const typed: { method: Method } = { method: "GET" };
send(typed.method);                  // → sending GET
`,
  },
  {
    id: 'tuples',
    group: 'Basics & Types',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are tuples and how do they differ from arrays?',
    a: [
      '# ELI5',
      'An egg carton has identical slots — that is an array: any number of the same kind of thing.',
      'A lunchbox has exactly one slot for a sandwich and one slot for an apple — that is a tuple: fixed slots, each with its own kind of thing.',
      'Mapping: arrays are "many of one type"; tuples are "a fixed list where each position has its own type".',
      '# What it is',
      'An array type like `number[]` holds any number of values of the same type.',
      'A tuple type like `[string, number]` has a fixed length, and each position has its own type.',
      'Optional elements: `[string, number?]` — the second slot may be missing.',
      'Rest elements: `[string, ...number[]]` — a string followed by any number of numbers.',
      'Labeled elements: `[name: string, age: number]` — the labels are documentation only and show up in editor hints.',
      'Readonly tuples: `readonly [string, number]` — no `push`, no reassigning slots.',
      'At runtime a tuple is just a normal JS array; the fixed structure exists only in the types.',
      '# How it works',
      'TS knows the type at each index: in `[string, number]`, `t[0]` is `string` and `t[1]` is `number`.',
      'Accessing `t[2]` is a compile error because the tuple has length 2.',
      'Destructuring works naturally: `const [name, age] = t` gives each variable its own type.',
      'Non-readonly tuples still allow `push` (a known gap), so use `readonly` if you want true fixed size.',
      '# Example walkthrough',
      '`Entry` is a labeled tuple; `e[0]` is `string` and `e[1]` is `number`, so it prints `APPLES 4`.',
      '`useToggle` returns a `[boolean, () => void]` pair; destructuring gives `on` and `toggle`.',
      '`on` prints `false`; calling `toggle()` flips the inner state and prints `true`.',
      '`Point` has an optional third slot and `Row` uses a rest element, so their lengths print `2 4`.',
      '`Object.entries` returns `[string, number][]` — an array of tuples — which is why destructuring `[k, v]` is typed.',
      '# Why it matters / when to use',
      'Returning multiple values from a function without creating an object (like React `useState`).',
      'Representing key/value pairs, coordinates `[x, y]`, CSV rows, or `Promise.all` results (which are typed as tuples).',
      'Typing function argument lists: `Parameters<typeof fn>` is a tuple.',
      '# Common mistakes',
      'Forgetting the annotation: `const pair = ["a", 1]` infers `(string | number)[]`, not a tuple; use a type or `as const`.',
      'Using tuples with many positions — after 3 elements, an object with named fields is clearer.',
      'Expecting tuples to be fixed at runtime; they are normal arrays.',
      '# Say this in the interview',
      'A tuple is a fixed-length array type where each position has its own type, like `[string, number]`, while an array is any length of one type. Tuples support optional, rest and labeled elements, and I use `readonly` tuples to prevent mutation. They are great for small multi-value returns, like a `[value, setter]` pair.',
      'Follow-up: What type does `Promise.all([fetchUser(), fetchOrders()])` return?',
      '  A promise of a tuple, e.g. `Promise<[User, Order[]]>`, so each result keeps its own type.',
    ],
    code: `type Entry = [key: string, value: number];   // labeled tuple
const e: Entry = ["apples", 3];
console.log(e[0].toUpperCase(), e[1] + 1);   // → APPLES 4
// e[2];                                     // error: no element at index 2

// Returning two values as a tuple
function useToggle(initial = false): [boolean, () => void] {
  let state = initial;
  return [state, () => { state = !state; console.log(state); }];
}
const [on, toggle] = useToggle();
console.log(on);       // → false
toggle();              // → true

// Optional and rest elements
type Point = [x: number, y: number, z?: number];
type Row = [id: string, ...scores: number[]];
const p: Point = [1, 2];
const row: Row = ["u1", 90, 85, 77];
console.log(p.length, row.length);           // → 2 4

// Arrays of tuples: Object.entries
for (const [k, v] of Object.entries({ a: 1, b: 2 })) {
  console.log(k, v);                         // → a 1, then b 2
}

const fixed: readonly [string, number] = ["x", 1];
// fixed.push(2);                            // error: readonly
`,
  },
  {
    id: 'primitive-types',
    group: 'Basics & Types',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are the basic built-in types in TypeScript?',
    a: [
      '# ELI5',
      'Think of a toolbox with labelled drawers: one for text, one for numbers, one for yes/no switches, and a few special drawers.',
      'Each drawer only accepts the right kind of item.',
      'Mapping: TypeScript built-in types are the drawer labels that say what kind of value a variable can hold.',
      '# What it is',
      'Primitive types (simple single values, not objects):',
      '  `string` — text like `"hello"`.',
      '  `number` — all numbers, integers and decimals (JS has one number type).',
      '  `boolean` — `true` or `false`.',
      '  `bigint` — very large whole numbers, written like `10n`.',
      '  `symbol` — unique identifiers created with `Symbol()`.',
      '  `null` and `undefined` — "no value" (null is usually set on purpose, undefined usually means "not set").',
      'Special types:',
      '  `any` — turns off checking; `unknown` — safe "anything"; `never` — impossible value.',
      '  `void` — a function returns nothing useful.',
      '  `object` — any non-primitive value (objects, arrays, functions).',
      'Arrays: `number[]` or `Array<number>`; tuples: `[string, number]`.',
      '# How it works',
      'TS maps these types onto the values JS really has at runtime.',
      'Always use lowercase names (`string`, `number`); the capitalised `String`, `Number` refer to wrapper objects you almost never want.',
      '`void` vs `undefined`: a callback typed `() => void` may return something and the caller will ignore it; a function typed `() => undefined` must return `undefined`.',
      'With `strictNullChecks` on, `null` and `undefined` are separate types and must be added explicitly, e.g. `string | null`.',
      '# Example walkthrough',
      'The first block declares one variable of each primitive type and prints them.',
      '`big * 2n` works on `bigint`; mixing `bigint` and `number` (`big + 1`) is a compile error.',
      '`typeof id` prints `symbol`; `nothing` and `notSet` print `null` and `undefined`.',
      '`log` returns `void` — it only prints.',
      '`forEach` accepts `(n) => out.push(n)` even though `push` returns a number, because the callback type returns `void`.',
      '`nickname ?? "no nickname"` handles the explicit `null` case.',
      '# Why it matters / when to use',
      'Every type you write is built from these basics.',
      'Choosing `string | null` explicitly documents that a database column can be empty.',
      '`bigint` matters for IDs or amounts larger than `Number.MAX_SAFE_INTEGER` (9,007,199,254,740,991).',
      '# Common mistakes',
      'Writing `String` or `Number` (wrapper types) instead of `string` or `number`.',
      'Storing money as `number` floats; prefer integers of the smallest unit (paise/cents) or a decimal library.',
      'Forgetting `null` in types for nullable DB columns, then crashing on `null.length`.',
      '# Say this in the interview',
      'The primitives are `string`, `number`, `boolean`, `bigint`, `symbol`, `null` and `undefined`. On top of those there are special types: `any`, `unknown`, `never`, `void` and `object`, plus arrays and tuples. I always use the lowercase forms and, with strict null checks, I model optional data explicitly with unions like `string | null`.',
      'Follow-up: Difference between `void` and `undefined` as a return type?',
      '  `void` means "ignore the return value" and lets callbacks return anything; `undefined` requires the value to actually be `undefined`.',
    ],
    code: `const name: string = "Asha";
const age: number = 30.5;            // integers and decimals share one type
const active: boolean = true;
const big: bigint = 9007199254740993n;
const id: symbol = Symbol("id");
const nothing: null = null;
let notSet: undefined;               // undefined until assigned

console.log(name, age, active);      // → Asha 30.5 true
console.log(big * 2n);               // → 18014398509481986n
// big + 1;                          // error: cannot mix bigint and number
console.log(typeof id, nothing, notSet); // → symbol null undefined

// void: the function returns nothing useful
function log(msg: string): void {
  console.log("[log] " + msg);
}
log("started");                      // → [log] started

// A void callback may still return a value (it is ignored)
const out: number[] = [];
[1, 2].forEach(n => out.push(n));    // push returns a number; fine
console.log(out);                    // → [ 1, 2 ]

// Nullable value modelled explicitly
const nickname: string | null = null;
console.log(nickname ?? "no nickname"); // → no nickname
`,
  },

  // ─────────────────── Interfaces vs Types & Objects ───────────────────
  {
    id: 'interface-vs-type',
    group: 'Interfaces vs Types & Objects',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between `interface` and `type`?',
    a: [
      '# ELI5',
      'An `interface` is like a club membership form that other people can add new fields to later ("add your phone number too").',
      'A `type` is like a sticky label you can put on anything — a box, a bag, or "either a box or a bag" — but once written, it cannot be reopened.',
      'Mapping: both describe the shape of data; interfaces are extendable object contracts, type aliases can name any type expression.',
      '# What it is',
      '`interface` declares the shape of an object (its properties and methods).',
      '`type` creates a type alias — a name for any type, including objects, unions, tuples, primitives and computed types.',
      'Comparison row — object shapes: both work and are mostly interchangeable.',
      'Comparison row — unions (`A | B`), tuples, primitives: only `type` can do these.',
      'Comparison row — mapped and conditional types (types computed from other types): only `type`.',
      'Comparison row — declaration merging (reopening with the same name to add fields): only `interface`.',
      'Comparison row — extending: `interface B extends A` vs `type B = A & {...}` (an intersection).',
      'Comparison row — conflicts: `extends` reports an error on incompatible properties; `&` silently produces `never` for that property.',
      'Comparison row — compiler speed: interfaces are cached by name, so large `extends` hierarchies check slightly faster.',
      '# How it works',
      'Both are erased at compile time; neither exists at runtime.',
      'Because TS is structural, an `interface User` and a `type User` with the same fields are fully compatible.',
      'Two `interface Window` declarations merge into one; two `type X` declarations are a "Duplicate identifier" error.',
      'Classes can `implements` either an interface or an object type alias.',
      '# Example walkthrough',
      '`UserI` (interface) and `UserT` (type) describe the same shape; `const a: UserI = b` works because shapes match.',
      '`Admin extends UserI` adds `role`; printing the admin shows all three fields.',
      '`Id`, `Pair` and `Status` can only be written with `type` because they are a union, a tuple and a literal union.',
      'The second `interface UserI` declaration adds `email?` to the first — that is declaration merging.',
      '# Why it matters / when to use',
      'Common team rule: `interface` for object shapes and public contracts (especially ones that may be extended or augmented, like Express `Request`).',
      '`type` for unions, tuples, function types, mapped/conditional types and DTO compositions.',
      'Consistency within a codebase matters more than which one you pick for plain objects.',
      '# Common mistakes',
      'Trying to write a union with `interface` — impossible; use `type`.',
      'Accidentally merging with a global interface of the same name (e.g. `interface Request`) and getting strange extra fields.',
      'Using `&` to combine conflicting shapes and getting a silent `never` property instead of an error.',
      '# Say this in the interview',
      'Both describe object shapes and are mostly interchangeable. Interfaces can be reopened through declaration merging and extended with `extends`, which reports conflicts clearly, so I use them for object contracts. Type aliases can name anything, including unions, tuples, and mapped or conditional types, so I use `type` for those.',
      'Follow-up: Can a class implement a type alias?',
      '  Yes, if the alias is an object type (not a union).',
      'Follow-up: Which is faster for the compiler?',
      '  Interfaces with `extends` are cached and usually check faster than big intersections.',
    ],
    code: `interface UserI { id: number; name: string }
type UserT = { id: number; name: string };

const b: UserT = { id: 1, name: "Asha" };
const a: UserI = b;                    // ok: same shape (structural typing)

// Extending
interface Admin extends UserI { role: "admin" }
const admin: Admin = { id: 2, name: "Ravi", role: "admin" };
console.log(admin);                    // → { id: 2, name: 'Ravi', role: 'admin' }

type AdminT = UserT & { role: "admin" }; // same idea with an intersection

// Only type aliases can do these:
type Id = string | number;             // union
type Pair = [string, number];          // tuple
type Status = "ok" | "error";          // literal union
const pair: Pair = ["x", 1];
const st: Status = "ok";
console.log(pair, st);                 // → [ 'x', 1 ] ok

// Only interfaces can merge:
interface UserI { email?: string }     // adds a field to UserI above
const merged: UserI = { id: 3, name: "Mia", email: "m@x.io" };
console.log(merged.email);             // → m@x.io
`,
  },
  {
    id: 'optional-readonly-properties',
    group: 'Interfaces vs Types & Objects',
    stars: 4,
    difficulty: 'Easy',
    q: 'How do optional (`?`) and `readonly` properties work?',
    a: [
      '# ELI5',
      'A job application form has some fields marked "optional" (like a middle name) — you can leave them blank.',
      'Some fields are printed in ink by the office (like your application number) — you can read them but not change them.',
      'Mapping: `?` marks a property that may be missing; `readonly` marks a property you can read but not reassign.',
      '# What it is',
      'An optional property `name?: string` may be absent from the object; when read, its type is `string | undefined`.',
      'A `readonly` property `readonly id: number` cannot be reassigned through that type after the object is created.',
      '`readonly` is compile-time only: JS can still change it at runtime, and it is shallow — nested objects stay mutable.',
      '`exactOptionalPropertyTypes` (an optional compiler flag) makes `?` mean "may be absent" but NOT "may be set to `undefined` explicitly".',
      'Optional function parameters work similarly: `function f(a?: number)` or with a default value `function f(a = 0)`.',
      '# How it works',
      'For `email?: string`, TS allows objects with or without `email`.',
      'Reading `user.email` gives `string | undefined`, so you must handle `undefined` before calling string methods.',
      'For `readonly id`, an assignment `user.id = 5` is a compile error.',
      '  The underlying JS object is unchanged; only the type forbids the write.',
      '  Another type without `readonly` pointing to the same object could still change it.',
      'Shallow means: `readonly address: Address` stops replacing `address`, but `user.address.city = "x"` is still allowed.',
      '# Example walkthrough',
      '`u1` omits `email` — allowed because it is optional.',
      '`u1.email?.toUpperCase()` uses optional chaining and prints `undefined`; `u2` prints `A@X.IO`.',
      '`u1.id = 99` is a compile error because `id` is readonly.',
      '`u1.address.city = "Pune"` compiles because readonly is shallow, and prints `Pune`.',
      '`greet()` uses a default parameter and prints `Hello, guest`.',
      '# Why it matters / when to use',
      'Optional properties model partial data: PATCH request bodies, optional config fields, nullable DB columns.',
      '`readonly` documents that IDs, timestamps or config values should not be changed after creation.',
      'Use `Readonly<T>` or deep-readonly helpers for immutable state objects.',
      '# Common mistakes',
      'Calling a method on an optional property without checking: `user.email.trim()` — handle `undefined` first.',
      'Believing `readonly` protects nested objects or protects at runtime; use `Object.freeze` or deep-readonly types if needed.',
      'Confusing `email?: string` (may be missing) with `email: string | undefined` (must be present, may be undefined).',
      '# Say this in the interview',
      'A `?` makes a property optional, so it may be missing and reads as `T | undefined`. `readonly` prevents reassignment through that type at compile time only, and it is shallow, so nested objects can still be mutated. I use optional properties for partial payloads and readonly for IDs and config.',
      'Follow-up: Difference between `a?: string` and `a: string | undefined`?',
      '  With `?` the key may be omitted entirely; with `| undefined` the key is required but its value can be `undefined`.',
    ],
    code: `interface Address { city: string }
interface User {
  readonly id: number;
  name: string;
  email?: string;              // optional: may be missing
  readonly address: Address;
}

const u1: User = { id: 1, name: "Asha", address: { city: "Mumbai" } };
const u2: User = { id: 2, name: "Ravi", email: "a@x.io", address: { city: "Delhi" } };

console.log(u1.email?.toUpperCase()); // → undefined
console.log(u2.email?.toUpperCase()); // → A@X.IO

// u1.id = 99;                 // error: cannot assign to 'id' (read-only)
u1.address.city = "Pune";      // allowed: readonly is shallow
console.log(u1.address.city);  // → Pune

function greet(name = "guest", title?: string) {
  console.log("Hello, " + (title ? title + " " : "") + name);
}
greet();                       // → Hello, guest
greet("Asha", "Dr.");          // → Hello, Dr. Asha
`,
  },
  {
    id: 'index-signatures',
    group: 'Interfaces vs Types & Objects',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are index signatures and when do you use them vs `Record`?',
    a: [
      '# ELI5',
      'A phone contacts list can hold any names you like — you do not know the names in advance, but every entry is a phone number.',
      'Mapping: an index signature says "this object can have any keys of this kind, and every value has this type".',
      '# What it is',
      'An index signature describes objects whose keys are not known ahead of time: `{ [key: string]: number }`.',
      'The key name (`key`, `player`) is just a label for readability.',
      'Allowed key types: `string`, `number`, `symbol`, or template literal patterns such as data-${string} (any key starting with "data-").',
      'Any explicitly listed property must have a value type compatible with the index signature.',
      '`Record<K, V>` is a built-in utility type: `Record<string, number>` is the same as `{ [key: string]: number }`.',
      'Difference: `Record<"a" | "b", number>` with a union of literal keys requires exactly those keys; an index signature cannot express that.',
      '`noUncheckedIndexedAccess` is a compiler flag that makes reads like `obj[key]` return `V | undefined`, which is more honest.',
      '`Map` is a built-in JS class for real dictionaries with any key type and safe methods like `has`.',
      '# How it works',
      'TS allows any key when writing: `scores["anyone"] = 5`.',
      'When reading, TS by default assumes the key exists and returns `number` (even if it does not exist at runtime).',
      'With `noUncheckedIndexedAccess`, the read type becomes `number | undefined`, forcing a check.',
      'Numeric index signatures `[i: number]: T` model array-like objects.',
      '# Example walkthrough',
      '`Scores` has a string index signature and a fixed `total` property, which must also be a number.',
      'Adding `scores["asha"] = 10` and reading it back prints `10`.',
      '`scores["nobody"]` prints `undefined` at runtime even though the type says `number` — the classic trap.',
      '`Record<Role, string[]>` forces both `admin` and `user` keys to exist.',
      'The `Map` version uses `.get()`, which is correctly typed as `number | undefined`.',
      '# Why it matters / when to use',
      'Caches, lookup tables keyed by ID, HTTP headers, translation dictionaries, and counting occurrences.',
      'Use `Record<Union, V>` when the set of keys is known and every key must be present.',
      'Use `Map` when keys are added and removed often, or keys are not strings.',
      '# Common mistakes',
      'Trusting `obj[key]` to always exist; enable `noUncheckedIndexedAccess` or check with `in`.',
      'Adding a property of a different type (e.g. `name: string`) next to a `[k: string]: number` signature — compile error.',
      'Using objects as dictionaries with user-provided keys like `"__proto__"`; prefer `Map` or `Object.create(null)`.',
      '# Say this in the interview',
      'An index signature like `{ [key: string]: number }` describes an object with arbitrary keys whose values share one type. `Record<string, number>` is equivalent, but `Record` with a literal union of keys requires every key to be present, which is great for exhaustive lookup tables. I enable `noUncheckedIndexedAccess` so reads include `undefined`, and use `Map` for true dynamic dictionaries.',
      'Follow-up: What is `keyof` of an index signature type?',
      '  For `{ [k: string]: X }`, `keyof` is `string | number`, because numeric keys are converted to strings in JS.',
    ],
    code: `interface Scores {
  [player: string]: number;    // any string key -> number
  total: number;               // fixed props must match the value type
}

const scores: Scores = { total: 0 };
scores["asha"] = 10;
scores.total += 10;
console.log(scores["asha"]);   // → 10
console.log(scores["nobody"]); // → undefined (but typed as number!)

// Record with a literal union: every key is required
type Role = "admin" | "user";
const perms: Record<Role, string[]> = {
  admin: ["*"],
  user: ["read"],
};                             // leaving out "user" would be an error
console.log(perms.user);       // → [ 'read' ]

// Template literal key pattern
type DataAttrs = { [key: \`data-\${string}\`]: string };
const attrs: DataAttrs = { "data-id": "42" };
console.log(attrs["data-id"]); // → 42

// Map: safer dictionary, get() returns number | undefined
const visits = new Map<string, number>();
visits.set("home", 3);
console.log(visits.get("home") ?? 0, visits.get("about") ?? 0); // → 3 0
`,
  },
  {
    id: 'function-overloads',
    group: 'Interfaces vs Types & Objects',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do function overloads work in TypeScript?',
    a: [
      '# ELI5',
      'A cafe menu says: "Give us a coin, get a sweet. Give us a note, get a sandwich."',
      'There is only one cashier behind the counter, but the menu tells you exactly what you get for each kind of payment.',
      'Mapping: overload signatures are the menu lines; the single implementation is the cashier who handles every case.',
      '# What it is',
      'Function overloading lets one function have several call signatures, each with its own parameter and return types.',
      'An overload signature is a function header with no body, e.g. `function parse(x: string): number;`.',
      'The implementation signature is the final declaration with a body; its parameters must accept all overload cases.',
      'Callers only see the overload signatures — the implementation signature is hidden from them.',
      'JS has no real overloading; at runtime there is just one function that checks its arguments itself.',
      '# How it works',
      'You write two or more overload signatures, then one implementation:',
      '  The compiler checks each overload is compatible with the implementation.',
      '  At a call site, TS tries overloads top to bottom and picks the first one that matches.',
      '  The return type of the chosen overload becomes the type of the call expression.',
      'Inside the implementation, you narrow the arguments yourself (with `typeof`, etc.).',
      'Because of top-to-bottom matching, put the most specific overloads first.',
      '# Example walkthrough',
      '`parse("42")` matches the first overload, so `n` is typed `number` and prints `42` as a number.',
      '`parse(7)` matches the second overload, so `s` is typed `string` and prints `"7"`.',
      'Calling `parse(true)` would fail because no overload accepts a boolean (the implementation signature does not count).',
      '`getUser` shows a real use: with an `id` it returns one `User`; with no arguments it returns `User[]`.',
      '# Why it matters / when to use',
      'When the return type depends on the argument type, e.g. `createElement("div")` returns `HTMLDivElement`.',
      'Library APIs like `find(id)` vs `find()` returning one item vs a list.',
      'Prefer a union parameter or generics when the return type does NOT depend on the input — overloads are more code to maintain.',
      '# Common mistakes',
      'Expecting callers to be able to use the implementation signature directly — they cannot.',
      'Putting a broad overload first so the specific one is never selected.',
      'Writing an implementation that forgets one case; the compiler only checks compatibility, not that every branch is handled correctly.',
      '# Say this in the interview',
      'Overloads are multiple call signatures declared above a single implementation. Callers only see the overloads, TypeScript picks the first one that matches top to bottom, and the implementation must narrow the arguments at runtime. I use them when the return type depends on the argument type, and otherwise prefer unions or generics.',
      'Follow-up: Can arrow functions have overloads?',
      '  Not with the `function` syntax; you describe them with a type that has multiple call signatures instead.',
    ],
    code: `// Overload signatures (what callers see)
function parse(x: string): number;
function parse(x: number): string;
// Implementation signature (hidden from callers)
function parse(x: string | number): number | string {
  return typeof x === "string" ? Number(x) : String(x);
}

const n = parse("42");   // n: number
const s = parse(7);      // s: string
console.log(n + 1);      // → 43
console.log(s + "!");    // → 7!
// parse(true);          // error: no overload matches this call

type User = { id: number; name: string };
const db: User[] = [{ id: 1, name: "Asha" }, { id: 2, name: "Ravi" }];

function getUser(id: number): User | undefined;
function getUser(): User[];
function getUser(id?: number): User | User[] | undefined {
  return id === undefined ? db : db.find(u => u.id === id);
}

console.log(getUser(2)?.name);  // → Ravi   (typed User | undefined)
console.log(getUser().length);  // → 2      (typed User[])
`,
  },
  {
    id: 'declaration-merging',
    group: 'Interfaces vs Types & Objects',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is declaration merging?',
    a: [
      '# ELI5',
      'Two teachers each write notes about the same student in separate notebooks. At the end of the year, the school staples both notebooks into one report.',
      'Mapping: when you declare the same interface (or namespace) name twice, TypeScript staples the declarations together into one type.',
      '# What it is',
      'Declaration merging is the compiler combining multiple declarations with the same name into a single definition.',
      'Interfaces merge: all members from every `interface User` declaration are combined.',
      'Type aliases do NOT merge: declaring `type User` twice is a "Duplicate identifier" error.',
      'Namespaces (an older TS feature for grouping code under a name) can merge with classes, functions and enums to add static members.',
      'Module augmentation is using merging to add fields to types from another package, via `declare module "pkg" { ... }`.',
      'Global augmentation adds to global types (like `Window` or `ProcessEnv`) via `declare global { ... }`.',
      '# How it works',
      'The compiler collects every declaration with the same name in the same scope.',
      'For interfaces, it combines the property lists:',
      '  Non-function properties with the same name must have the same type, or it is an error.',
      '  Methods with the same name become overloads.',
      'For augmentation, the file containing `declare module` must itself be a module (have an import or export) and be included in the compilation.',
      '# Example walkthrough',
      'Two `interface User` declarations merge, so `u` must have both `name` and `age`; it prints `Asha 30`.',
      'The `declare global` block adds `DATABASE_URL` to `NodeJS.ProcessEnv`, so `process.env.DATABASE_URL` is typed `string | undefined` with autocomplete (requires `@types/node`).',
      'In a real Express app you would write `declare module "express-serve-static-core" { interface Request { user?: User } }` to add `req.user`.',
      '# Why it matters / when to use',
      'Adding `req.user` to Express `Request` after authentication middleware.',
      'Typing environment variables on `process.env`.',
      'Extending library types (e.g. adding custom fields to a session or JWT payload type).',
      '# Common mistakes',
      'Naming your own interface the same as a global one (like `Response` or `Request`) and accidentally merging with DOM types.',
      'Putting augmentation in a file with no imports/exports, so it becomes a global script and does not augment the module.',
      'Forgetting the augmentation file is not included by `tsconfig.json`, so the extra fields "disappear".',
      '# Say this in the interview',
      'Declaration merging is when TypeScript combines multiple declarations with the same name into one, most commonly interfaces whose members get combined. Type aliases cannot merge. It is how we augment third-party types, for example adding `user` to the Express `Request` or typing `process.env` variables.',
      'Follow-up: Why do some teams prefer `type` because of this?',
      '  Merging can happen accidentally; a `type` alias cannot be silently extended elsewhere.',
    ],
    code: `// 1) Two interfaces with the same name merge into one
interface User { name: string }
interface User { age: number }

const u: User = { name: "Asha", age: 30 }; // both fields required
console.log(u.name, u.age);                // → Asha 30

// 2) Global augmentation: type your env variables (needs @types/node)
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL?: string;
    }
  }
}
console.log(process.env.DATABASE_URL ?? "not set"); // → not set

// 3) Typical Express augmentation (in its own .d.ts / module file):
// declare module "express-serve-static-core" {
//   interface Request { user?: { id: string } }
// }
// app.get("/me", (req, res) => res.json(req.user)); // req.user is typed

// Type aliases cannot merge:
// type T = { a: 1 }; type T = { b: 2 }; // error: Duplicate identifier 'T'

export {}; // makes this file a module so "declare global" is allowed
`,
  },
  {
    id: 'excess-property-checks',
    group: 'Interfaces vs Types & Objects',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are excess property checks?',
    a: [
      '# ELI5',
      'When you hand a filled-in form directly to the clerk, they read it and say "you wrote colour, but our form says color — typo?"',
      'If instead the form goes through a sorting machine first, the clerk only checks the required boxes and ignores extra scribbles.',
      'Mapping: TypeScript strictly checks object literals written directly in place (fresh objects), but not objects that come from a variable.',
      '# What it is',
      'An excess property check is an extra rule: an object literal assigned straight to a typed target may not contain properties the type does not know about.',
      'A fresh object literal is an object written inline, e.g. `const a: Opts = { colour: "red" }`, as opposed to one stored in a variable first.',
      'It exists to catch typos, especially in types with optional properties where a misspelled key would otherwise be silently ignored.',
      'It is a special case on top of structural typing, which normally allows extra properties.',
      '# How it works',
      'When TS sees a fresh object literal being assigned or passed to a typed target, it compares its keys with the target:',
      '  Any unknown key → error "Object literal may only specify known properties".',
      'If the object was stored in a variable first, it is no longer fresh, and normal structural rules apply (extra keys allowed).',
      'Index signatures on the target allow extra keys, so no excess check error occurs.',
      '# Example walkthrough',
      '`const a: Opts = { colour: "red" }` errors because `colour` is not in `Opts` (the real key is `color`).',
      '`const tmp = { colour: "red" }` then `const b: Opts = tmp` compiles — `tmp` is not fresh.',
      '`render(b)` prints `color = default` because `b.color` is `undefined` — the typo slipped through.',
      'Using `satisfies Opts` on `tmp` would have caught the typo at the definition.',
      '# Why it matters / when to use',
      'Catches misspelled options in config objects, query builders and API client calls.',
      'Explains why the same object sometimes errors and sometimes does not.',
      '# Common mistakes',
      'Silencing the error with `as Opts` instead of fixing the typo.',
      'Assuming the check protects data from variables or API responses — it does not.',
      '# Say this in the interview',
      'Excess property checks are an extra rule for fresh object literals: when you write an object directly where a type is expected, any property the type does not declare is an error. This catches typos, especially with optional properties. Objects that come from a variable skip the check, because structural typing normally allows extra properties.',
      'Follow-up: How do you allow extra properties intentionally?',
      '  Add an index signature like `[key: string]: unknown`, or pass the object via a variable.',
    ],
    code: `interface Opts { color?: string; size?: number }

function render(o: Opts) {
  console.log("color = " + (o.color ?? "default"));
}

// const a: Opts = { colour: "red" };
// error: Object literal may only specify known properties,
//        and 'colour' does not exist in type 'Opts'

const tmp = { colour: "red" };   // not "fresh" any more
const b: Opts = tmp;             // ok: no excess property check
render(b);                       // → color = default  (typo slipped through)

render({ color: "blue" });       // → color = blue
// render({ colr: "blue" });     // error: excess property

// satisfies catches it at the definition site
// const checked = { colour: "red" } satisfies Opts; // error

// Index signature allows extra keys on purpose
interface Loose { color?: string; [key: string]: unknown }
const l: Loose = { color: "red", anything: 1 };
console.log(Object.keys(l));     // → [ 'color', 'anything' ]
`,
  },
  {
    id: 'extends-vs-intersection',
    group: 'Interfaces vs Types & Objects',
    stars: 3,
    difficulty: 'Medium',
    q: 'Interface `extends` vs intersection (`&`) — what is the difference?',
    a: [
      '# ELI5',
      '`extends` is like a careful builder adding a new floor to a house — if the new plans clash with the old ones, they stop and tell you.',
      '`&` is like gluing two blueprints together — if they clash, the glue quietly makes that part impossible to build.',
      'Mapping: both combine shapes, but `extends` reports conflicts loudly while `&` can silently create `never`.',
      '# What it is',
      '`interface B extends A { ... }` creates a new interface containing all members of `A` plus new ones.',
      'An intersection type `A & B` is a type that is both `A` and `B` at once — it has all members of both.',
      'Comparison row — conflicting property types: `extends` gives a compile error at the declaration; `&` intersects the property types (e.g. `string & number` becomes `never`) with no error until you try to use it.',
      'Comparison row — what you can combine: `extends` only works with object-like types; `&` works with any types, including unions.',
      'Comparison row — performance: interfaces are cached by name so `extends` checks faster in large codebases.',
      'Comparison row — readability: error messages and hover info show the interface name, which is often clearer.',
      '# How it works',
      'For `extends`, the compiler checks each overridden property is compatible with the base:',
      '  Narrowing is allowed (`id: string | number` to `id: string`).',
      '  Incompatible changes (`id: number` to `id: string`) are an error right there.',
      'For `&`, the compiler intersects each shared property type:',
      '  `{ id: number } & { id: string }` gives `id: never`, so no real value can satisfy it.',
      '# Example walkthrough',
      '`Admin extends User` adds `role`; creating an admin works and prints it.',
      '`interface Bad extends User { id: string }` would be a compile error, pointing out the conflict.',
      '`type Weird = User & { id: string }` compiles, but its `id` is `never` — you can never create a valid `Weird`.',
      '`type WithMeta = User & ({ kind: "a" } | { kind: "b" })` shows `&` combined with a union, which `extends` cannot do.',
      '# Why it matters / when to use',
      'Use `extends` for stable domain models (User → Admin) where clear errors matter.',
      'Use `&` to compose types ad hoc: mixing in timestamps, adding fields to a union, or combining utility types.',
      '# Common mistakes',
      'Intersecting two types with a conflicting field and spending time debugging a mysterious `never`.',
      'Trying to `extends` a union type alias — not allowed; use `&` instead.',
      '# Say this in the interview',
      'Both combine object shapes. `interface extends` checks compatibility and reports conflicting properties as errors, and it is cached so it is faster for the compiler. An intersection with `&` works on any types, including unions, but conflicting properties silently become `never`. I prefer `extends` for object hierarchies and `&` for composing type aliases.',
      'Follow-up: Can an interface extend a type alias?',
      '  Yes, if the alias is an object type (not a union).',
    ],
    code: `interface User { id: number; name: string }

// extends: adds members, checks conflicts
interface Admin extends User { role: "admin" }
const admin: Admin = { id: 1, name: "Asha", role: "admin" };
console.log(admin.role);          // → admin

// interface Bad extends User { id: string }
// error: Interface 'Bad' incorrectly extends interface 'User'

// &: intersects; conflicting props silently become never
type Weird = User & { id: string };
type WeirdId = Weird["id"];       // never
// const w: Weird = { id: 1, name: "x" }; // error: number not assignable to never

// & works with unions too (extends cannot do this)
type Timestamps = { createdAt: Date };
type AuthEvent = Timestamps & ({ kind: "login" } | { kind: "logout"; reason: string });
const e: AuthEvent = { createdAt: new Date(0), kind: "logout", reason: "timeout" };
console.log(e.kind, e.createdAt.toISOString()); // → logout 1970-01-01T00:00:00.000Z
`,
  },
  {
    id: 'function-types',
    group: 'Interfaces vs Types & Objects',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you type functions (arrow types, call signatures, construct signatures)?',
    a: [
      '# ELI5',
      'A job advert says: "We need someone who takes in two numbers and gives back a yes/no answer." Anyone who can do that job fits.',
      'Mapping: a function type describes what goes in (parameters) and what comes out (return type), so any matching function can be used.',
      '# What it is',
      'Function type expression: `type Fn = (a: number, b?: string) => boolean` — the most common way.',
      'Call signature: written inside an object type, `{ (x: number): string; id: string }`, which lets a function also have properties.',
      'Construct signature: `{ new (x: string): Foo }` describes something you call with `new` (a class or constructor function).',
      'Rest parameters: `(...args: number[]) => void` accepts any number of arguments.',
      '`this` parameter: `function (this: HTMLElement) {}` declares what `this` must be; it is a fake first parameter that is erased.',
      'The `Function` type accepts any function but calling it returns `any` — avoid it.',
      '# How it works',
      'TS compares function types by parameters and return type:',
      '  Parameter names do not matter, only their types and positions.',
      '  A function with fewer parameters is assignable to a type with more (extra arguments are ignored, as in JS).',
      '  The return type must be compatible (a `void` return accepts anything).',
      'Optional parameters (`b?`) must come after required ones.',
      '# Example walkthrough',
      '`BinaryOp` is an arrow type; `add` and `mul` both fit it and print `5` and `6`.',
      '`Counter` has a call signature plus a `count` property; we build it with `Object.assign` and calling it twice prints `2`.',
      '`Ctor<T>` is a construct signature; `create(Point, 1, 2)` calls `new` and prints `Point { x: 1, y: 2 }`.',
      '`sum(...nums)` uses a rest parameter and prints `10`.',
      '# Why it matters / when to use',
      'Typing callbacks: Express middleware `(req, res, next) => void`, event handlers, retry functions.',
      'Dependency injection or factories that accept a class (construct signatures).',
      'Higher-order functions that take and return functions.',
      '# Common mistakes',
      'Using `Function` or `any` for callbacks, losing argument checking.',
      'Forgetting that a callback with fewer params is allowed, then being confused why `arr.forEach(() => ...)` compiles.',
      'Mixing up `(x: number) => string` (type) with `(x: number): string` (call signature syntax inside an object type).',
      '# Say this in the interview',
      'Most functions are typed with an arrow type like `(a: number) => string`. If a function also needs properties, I use an object type with a call signature, and for things called with `new` I use a construct signature like `new (...args) => T`. I avoid the `Function` type because it accepts anything and returns `any`.',
      'Follow-up: Why can I pass `(a) => ...` where `(a, b) => ...` is expected?',
      '  JS ignores extra arguments, so TS allows functions with fewer parameters.',
    ],
    code: `// 1) Arrow function type
type BinaryOp = (a: number, b: number) => number;
const add: BinaryOp = (a, b) => a + b;     // a, b inferred as number
const mul: BinaryOp = (x, y) => x * y;     // names do not matter
console.log(add(2, 3), mul(2, 3));        // → 5 6

// 2) Call signature + property
type Counter = { (): number; count: number };
const counter: Counter = Object.assign(() => ++counter.count, { count: 0 });
counter();
console.log(counter());                   // → 2

// 3) Construct signature (anything usable with "new")
type Ctor<T> = new (...args: any[]) => T;
class Point { constructor(public x: number, public y: number) {} }
function create<T>(C: Ctor<T>, ...args: any[]): T {
  return new C(...args);
}
console.log(create(Point, 1, 2));         // → Point { x: 1, y: 2 }

// 4) Rest parameters
function sum(...nums: number[]): number {
  return nums.reduce((t, n) => t + n, 0);
}
console.log(sum(1, 2, 3, 4));             // → 10
`,
  },
  {
    id: 'object-vs-Object-vs-empty',
    group: 'Interfaces vs Types & Objects',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is the difference between `object`, `Object` and `{}`?',
    a: [
      '# ELI5',
      'A sign saying "boxes only" (`object`) lets in boxes, bags and crates but not loose pebbles.',
      'A sign saying "anything that is not empty air" (`{}`) lets in boxes AND pebbles — almost everything.',
      'Mapping: `object` means non-primitive values; `{}` and `Object` mean "anything except null and undefined".',
      '# What it is',
      'A primitive is a simple value: string, number, boolean, bigint, symbol, null, undefined. Everything else (objects, arrays, functions) is non-primitive.',
      'Comparison row — `object` (lowercase): any non-primitive value; `5` and `"x"` are rejected.',
      'Comparison row — `{}` (empty object type): any value that is not `null` or `undefined`, including primitives like `5` and `"x"`.',
      'Comparison row — `Object` (capital): almost the same as `{}`, plus it checks members against `Object.prototype` methods; linters recommend never using it.',
      'Comparison row — `Record<string, unknown>`: an object with string keys and values of unknown type; the usual choice for "some plain object".',
      'Comparison row — `unknown`: truly anything, including `null` and `undefined`.',
      '# How it works',
      '`{}` is an object type with zero required properties, and structural typing says any value with at least zero properties fits — primitives have properties too (like `"x".length`), so they fit.',
      'Only `null` and `undefined` have no properties, so they are excluded (under `strictNullChecks`).',
      '`object` was added specifically to mean "not a primitive".',
      'Since TS 4.8, `{}` combined with narrowing helps: `unknown` narrowed by `x != null` becomes `{}`.',
      '# Example walkthrough',
      '`acceptsObject([1])` and `acceptsObject(() => 1)` are fine; `acceptsObject(5)` is an error.',
      '`acceptsEmpty(5)` and `acceptsEmpty("x")` compile because `{}` allows primitives; `acceptsEmpty(null)` errors.',
      '`acceptsRecord({ a: 1 })` works; values are `unknown`, so you narrow before using them.',
      '# Why it matters / when to use',
      'Use `Record<string, unknown>` for "a plain JSON object of unknown shape" (e.g. log metadata).',
      'Use `object` when you need any non-primitive, e.g. a `WeakMap` key or a generic constraint `T extends object`.',
      'Use `unknown` for truly unknown input.',
      '# Common mistakes',
      'Using `{}` thinking it means "an empty object" or "any object" — it allows strings and numbers too.',
      'Using `Object` or `{}` as a parameter type and accidentally accepting primitives.',
      '# Say this in the interview',
      '`object` means any non-primitive value. `{}` means any value except null and undefined, so it even accepts strings and numbers, and `Object` is roughly the same and should be avoided. For an arbitrary plain object I use `Record<string, unknown>`, and for truly unknown input I use `unknown`.',
      'Follow-up: How do you type "an object with no properties at all"?',
      '  `Record<string, never>` — any property would have to be `never`, so none can exist.',
    ],
    code: `function acceptsObject(x: object) { return typeof x; }
function acceptsEmpty(x: {}) { return typeof x; }
function acceptsRecord(x: Record<string, unknown>) { return Object.keys(x); }

console.log(acceptsObject([1]));        // → object
console.log(acceptsObject(() => 1));    // → function
// acceptsObject(5);                    // error: number is not assignable to object

console.log(acceptsEmpty(5));           // → number  (primitives allowed!)
console.log(acceptsEmpty("x"));         // → string
// acceptsEmpty(null);                  // error under strictNullChecks

console.log(acceptsRecord({ a: 1, b: "x" })); // → [ 'a', 'b' ]

// Values in Record<string, unknown> must be narrowed before use
const meta: Record<string, unknown> = { retries: 3 };
const r = meta["retries"];
if (typeof r === "number") console.log(r + 1); // → 4

// A truly empty object type
const empty: Record<string, never> = {};
// const notEmpty: Record<string, never> = { a: 1 }; // error
console.log(Object.keys(empty).length); // → 0
`,
  },
  {
    id: 'readonly-arrays',
    group: 'Interfaces vs Types & Objects',
    stars: 2,
    difficulty: 'Easy',
    q: 'What are `readonly` arrays and `ReadonlyArray<T>`?',
    a: [
      '# ELI5',
      'A museum lets you look at a display case of items, but you cannot add, remove or rearrange them.',
      'Mapping: a readonly array lets code read the items but hides every method that would change the array.',
      '# What it is',
      '`readonly T[]` and `ReadonlyArray<T>` are two spellings of the same type: an array you can read but not modify.',
      'Mutating methods are removed from the type: `push`, `pop`, `splice`, `sort`, `reverse`, `fill`, and index assignment `arr[0] = x`.',
      'Non-mutating methods remain: `map`, `filter`, `slice`, `concat`, `includes`, and the newer copy methods `toSorted`, `toReversed` (ES2023).',
      'Assignability: a mutable `T[]` can be passed where `readonly T[]` is expected, but NOT the other way round.',
      'It is compile-time only — the actual array at runtime is still a normal mutable array.',
      '# How it works',
      'The compiler swaps the array type to an interface that simply does not declare the mutating methods.',
      'So `nums.push(4)` is an error because `push` does not exist on `ReadonlyArray`.',
      'Passing a readonly array to a function expecting mutable `T[]` is rejected, because that function could mutate it.',
      '`as const` arrays are readonly tuples, so they also need `readonly` parameters.',
      '# Example walkthrough',
      '`total` takes `readonly number[]`, signalling it will not mutate the input; it prints `6`.',
      'Inside `total`, `nums.push(4)` would be an error.',
      '`[...nums].sort()` copies first and then sorts the copy — allowed and prints sorted values.',
      '`badSort(frozen)` is rejected because `badSort` wants a mutable array.',
      '# Why it matters / when to use',
      'Function parameters: say "I will not mutate your array", preventing accidental side effects (a classic bug with `.sort()`).',
      'Shared configuration lists, constant lookup arrays, and state in reducers.',
      '# Common mistakes',
      'Calling `.sort()` on an array passed in (mutates the caller data); use `toSorted()` or copy first.',
      'Expecting runtime protection — use `Object.freeze` for that.',
      'Typing parameters as mutable `string[]` and then being unable to pass `as const` arrays.',
      '# Say this in the interview',
      '`readonly T[]` or `ReadonlyArray<T>` is an array type without mutating methods like push, splice or sort, and with no index assignment. A mutable array can be passed where a readonly one is expected but not vice versa. I use it on function parameters to promise I will not mutate the input; it is compile-time only.',
      'Follow-up: How do you sort a readonly array?',
      '  Use `toSorted()` (Node 20+) or `[...arr].sort()`, both of which return a new array.',
    ],
    code: `function total(nums: readonly number[]): number {
  // nums.push(4);           // error: 'push' does not exist on readonly number[]
  // nums[0] = 10;           // error: index signature only permits reading
  return nums.reduce((a, b) => a + b, 0);
}

const data = [3, 1, 2];      // mutable number[]
console.log(total(data));    // → 6  (mutable -> readonly is fine)

const sorted = [...data].sort((a, b) => a - b); // copy, then sort
console.log(sorted, data);   // → [ 1, 2, 3 ] [ 3, 1, 2 ]

const frozen: ReadonlyArray<number> = [5, 4];
console.log(frozen.toSorted()); // → [ 4, 5 ]  (ES2023, returns a new array)

function badSort(arr: number[]) { return arr.sort(); }
// badSort(frozen);          // error: readonly number[] not assignable to number[]

const roles = ["admin", "user"] as const; // readonly tuple
function printAll(items: readonly string[]) { console.log(items.join(",")); }
printAll(roles);             // → admin,user
`,
  },

  // ──────────────── Unions, Narrowing & Type Guards ────────────────
  {
    id: 'union-vs-intersection',
    group: 'Unions, Narrowing & Type Guards',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between union (`|`) and intersection (`&`) types?',
    a: [
      '# ELI5',
      'Union: "You can pay with cash OR card." Any one of them is fine, but the shop can only do things that work for both until it knows which one you used.',
      'Intersection: "To enter, you need a ticket AND an ID." You must have everything from both lists.',
      'Mapping: `A | B` means "one of these"; `A & B` means "all of these at once".',
      '# What it is',
      'A union type `A | B` describes a value that is either an `A` or a `B`.',
      'An intersection type `A & B` describes a value that is both an `A` and a `B` at the same time, so it has all members of both.',
      'Comparison row — meaning: union = OR; intersection = AND.',
      'Comparison row — what you can access: union — only members common to all options, until you narrow; intersection — every member of every part.',
      'Comparison row — set view: think of a type as the set of values it allows; a union is a bigger set (more values allowed), an intersection is a smaller set (fewer values qualify).',
      'Comparison row — incompatible parts: `string | number` is fine; `string & number` is `never` (no value is both).',
      'Narrowing means using a runtime check to tell TS which member of a union you have.',
      '# How it works',
      'Union access rule: if `x: string | number`, you can call `x.toString()` (exists on both) but not `x.toUpperCase()` (only on string).',
      'After `if (typeof x === "string")`, TS narrows `x` to `string` inside the block.',
      'Intersection of objects merges properties: `{ a: 1 } & { b: 2 }` requires both `a` and `b`.',
      'Intersecting objects with the same key intersects that key type too (can produce `never`).',
      'Counter-intuitive bit: a union of objects has fewer accessible keys, while an intersection has more keys — because a union allows more values, so less is guaranteed.',
      '# Example walkthrough',
      '`format(id)` accepts `string | number`; it narrows with `typeof` and prints `#42` and `#ABC`.',
      '`Admin = User & { permissions: string[] }` requires `id`, `name` and `permissions`; printing shows `["*"]`.',
      '`type Impossible = string & number` is `never` — a variable of that type can never be created.',
      '# Why it matters / when to use',
      'Unions: IDs that can be string or number, nullable values (`User | null`), API results (`Success | Failure`), status literals.',
      'Intersections: adding fields to a type (timestamps, auth info), mixing in behaviours, and branded types.',
      '# Common mistakes',
      'Accessing a property that exists only on one union member without narrowing.',
      'Expecting `&` of two object types with conflicting properties to error — it silently creates `never`.',
      'Confusing the set view: "union has fewer properties available" feels backwards at first.',
      '# Say this in the interview',
      'A union `A | B` means the value is one of the types, so I can only use common members until I narrow it. An intersection `A & B` means the value is all of them at once, so it has every member. In set terms a union widens the allowed values and an intersection narrows them, and intersecting incompatible types like `string & number` gives `never`.',
      'Follow-up: What is `keyof (A | B)` vs `keyof (A & B)`?',
      '  `keyof (A | B)` is the common keys only; `keyof (A & B)` is all keys from both.',
    ],
    code: `// Union: one OR the other
type Id = string | number;

function format(id: Id): string {
  // id.toUpperCase();                 // error: not on number
  if (typeof id === "number") return "#" + id;
  return "#" + id.toUpperCase();       // id: string here
}
console.log(format(42), format("abc")); // → #42 #ABC

// Intersection: both at once
type User = { id: number; name: string };
type Admin = User & { permissions: string[] };

const admin: Admin = { id: 1, name: "Asha", permissions: ["*"] };
// const bad: Admin = { id: 1, name: "Asha" }; // error: permissions missing
console.log(admin.permissions);        // → [ '*' ]

// Incompatible primitives intersect to never
type Impossible = string & number;     // never

// Union of objects: only common keys are accessible
type Cat = { name: string; meow(): void };
type Dog = { name: string; bark(): void };
function petName(p: Cat | Dog) {
  return p.name;                       // ok: on both
  // p.meow();                         // error: not on Dog
}
console.log(petName({ name: "Tom", meow() {} })); // → Tom
`,
  },
  {
    id: 'type-narrowing',
    group: 'Unions, Narrowing & Type Guards',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is type narrowing and what are the ways to narrow?',
    a: [
      '# ELI5',
      'A mystery parcel could be a book or a ball. You shake it: if it rattles, it is a ball, so now you know how to play with it.',
      'Each test you do rules out possibilities, and inside that "if" you know exactly what you have.',
      'Mapping: narrowing is TypeScript following your runtime checks to work out the more specific type inside each branch.',
      '# What it is',
      'Narrowing is refining a broad type (like `string | number | null`) to a more specific one (like `string`) within a block of code.',
      'TS does this with control-flow analysis — it follows `if`, `switch`, `return`, `throw` and loops to know which checks have passed at each line.',
      'Ways to narrow:',
      '  `typeof x === "string"` — for primitives (`string`, `number`, `boolean`, `bigint`, `symbol`, `undefined`, `function`, `object`).',
      '  `x instanceof Date` — for class instances (checks the prototype chain).',
      '  `"swim" in animal` — checks a property exists, for object unions.',
      '  Equality: `x === null`, `x !== undefined`, `x === "a"` — for literals and null checks.',
      '  Truthiness: `if (x)` — removes `null`, `undefined` and other falsy values.',
      '  Discriminant property: `if (shape.kind === "circle")` — for tagged unions.',
      '  `Array.isArray(x)` — for arrays.',
      '  User-defined type guards (`x is T`) and assertion functions (`asserts x is T`).',
      '# How it works',
      'TS starts with the declared type at the top of the function.',
      'Each check splits the type: the `true` branch gets the matching part, the `false` branch gets the rest.',
      'An early `return` or `throw` removes that part for all following lines.',
      'At a join point (after an if/else), TS merges the types from the branches back into a union.',
      'Assigning a new value to the variable resets its narrowed type.',
      '# Example walkthrough',
      '`len(null)` hits `x === null` and returns `0`.',
      'For `"hello"`, `typeof x === "string"` is true, so `x` is `string` and it returns `5`.',
      'For `["a", "b"]`, both checks fail, so by elimination `x` is `string[]` and it returns `2`.',
      '`describe(new Date(0))` uses `instanceof` and prints the year `1970`.',
      '`describe({ msg: "hi" })` falls through to the `in` check and prints `hi`.',
      '# Why it matters / when to use',
      'Handling optional values from databases (`User | null`).',
      'Processing request input that can arrive in several forms (string or array query params).',
      'Making error handling type-safe: `if (err instanceof HttpError)`.',
      '# Common mistakes',
      '`typeof null === "object"` — a `typeof x === "object"` check does not exclude `null`.',
      'Truthiness checks removing valid values like `0` or `""`.',
      'Narrowing a `let` variable and then losing the narrowing inside a callback.',
      '# Say this in the interview',
      'Narrowing is how TypeScript refines a broad type to a specific one inside a branch, using control-flow analysis. I narrow with `typeof` for primitives, `instanceof` for classes, `in` for object shapes, equality and truthiness checks, discriminant properties for tagged unions, and custom type guards or assertion functions for complex cases.',
      'Follow-up: What is control-flow analysis?',
      '  The compiler tracking which checks have passed on every path through the code, so each line knows the possible types.',
    ],
    code: `function len(x: string | string[] | null): number {
  if (x === null) return 0;                    // x: null
  if (typeof x === "string") return x.length;  // x: string
  return x.length;                             // x: string[] (by elimination)
}
console.log(len(null), len("hello"), len(["a", "b"])); // → 0 5 2

type Input = Date | { msg: string } | number[];
function describe(v: Input): string {
  if (v instanceof Date) return String(v.getUTCFullYear()); // v: Date
  if (Array.isArray(v)) return "array of " + v.length;      // v: number[]
  if ("msg" in v) return v.msg;                              // v: { msg: string }
  return "unreachable";
}
console.log(describe(new Date(0)));    // → 1970
console.log(describe([1, 2, 3]));      // → array of 3
console.log(describe({ msg: "hi" }));  // → hi

// Pitfall: typeof null is "object"
function keys(o: object | null) {
  if (typeof o === "object") {
    // o is still object | null here!
    return o ? Object.keys(o) : [];
  }
  return [];
}
console.log(keys(null));               // → []
`,
  },
  {
    id: 'user-defined-type-guards',
    group: 'Unions, Narrowing & Type Guards',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are user-defined type guards (type predicates)?',
    a: [
      '# ELI5',
      'At a zoo gate, a keeper looks at each animal and shouts "This one is a fish!" From then on, everyone treats it as a fish and sends it to the pool.',
      'If the keeper shouts the wrong thing, the poor bird ends up in the pool — nobody double-checks.',
      'Mapping: a type guard is a function you write that tells TypeScript "if I return true, this value is type T", and TS trusts you completely.',
      '# What it is',
      'A user-defined type guard is a function whose return type is a type predicate of the form `param is T`.',
      'A type predicate is a special boolean return type that also carries type information for the caller.',
      'When the function returns `true`, TS narrows the argument to `T` in that branch.',
      'When it returns `false`, TS narrows the argument to "everything except `T`".',
      'The compiler does NOT verify that your function body is correct — a wrong guard is as unsafe as an `as` cast.',
      'Since TS 5.5, simple functions like `x => x !== null` can have their predicate inferred automatically.',
      '# How it works',
      'You write `function isFish(p: Fish | Bird): p is Fish { return "swim" in p; }`.',
      'At a call site `if (isFish(pet))`:',
      '  TS sees the predicate in the return type.',
      '  Inside the `if`, `pet` is `Fish`.',
      '  In the `else`, `pet` is `Bird`.',
      'Works with array methods: `arr.filter(isFish)` returns `Fish[]` instead of `(Fish | Bird)[]`.',
      'Combining with `unknown`: a guard like `isUser(x: unknown): x is User` is how you safely check untrusted data.',
      '# Example walkthrough',
      '`isFish` checks for a `swim` property; `move(nemo)` takes the `if` branch and prints `swimming`.',
      '`move(tweety)` takes the `else` branch where `pet` is `Bird`, printing `flying`.',
      '`pets.filter(isFish)` returns a `Fish[]`, so its length prints `1`.',
      '`isUser` checks every field of an `unknown` value; the valid JSON passes and prints the name, the bad one prints `invalid`.',
      '# Why it matters / when to use',
      'Validating request bodies, webhook payloads and message-queue events typed as `unknown`.',
      'Filtering mixed arrays into specific types.',
      'Encapsulating complex checks in one reusable, well-named function.',
      'For large schemas, validation libraries like Zod generate the guard and the type together.',
      '# Common mistakes',
      'Writing a guard that does not actually check enough (e.g. only checks `typeof x === "object"`), giving false confidence.',
      'Returning `boolean` instead of `x is T`, so no narrowing happens.',
      'Forgetting `x !== null` before `in` checks — `"a" in null` throws at runtime.',
      '# Say this in the interview',
      'A user-defined type guard is a function returning a type predicate like `value is User`. When it returns true, TypeScript narrows the argument to that type, and in the false branch it excludes it. The compiler trusts the implementation completely, so a wrong guard is as unsafe as a cast. I use them for validating `unknown` input and for filtering arrays.',
      'Follow-up: What is the difference between a type guard and an assertion function?',
      '  A guard returns a boolean and narrows inside an `if`; an assertion function throws on failure and narrows everything after the call.',
    ],
    code: `interface Fish { swim(): void }
interface Bird { fly(): void }

function isFish(p: Fish | Bird): p is Fish {
  return "swim" in p;
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) pet.swim();   // pet: Fish
  else pet.fly();                // pet: Bird
}
const nemo: Fish = { swim: () => console.log("swimming") };
const tweety: Bird = { fly: () => console.log("flying") };
move(nemo);                      // → swimming
move(tweety);                    // → flying

const pets = [nemo, tweety];
const fishes = pets.filter(isFish); // Fish[]
console.log(fishes.length);      // → 1

// Guarding untrusted data
type User = { id: number; name: string };
function isUser(x: unknown): x is User {
  return typeof x === "object" && x !== null &&
    typeof (x as Record<string, unknown>).id === "number" &&
    typeof (x as Record<string, unknown>).name === "string";
}
for (const raw of ['{"id":1,"name":"Asha"}', '{"id":"1"}']) {
  const data: unknown = JSON.parse(raw);
  console.log(isUser(data) ? data.name : "invalid"); // → Asha, then invalid
}
`,
  },
  {
    id: 'discriminated-unions',
    group: 'Unions, Narrowing & Type Guards',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are discriminated (tagged) unions?',
    a: [
      '# ELI5',
      'Parcels at a post office each have a coloured sticker: red means "letter", blue means "box", green means "fragile".',
      'The worker only has to look at the sticker to know exactly what is inside and how to handle it.',
      'Mapping: a discriminated union is a union of object types that each carry a "sticker" property (like `kind`) with a unique value, so checking it tells TS exactly which type you have.',
      '# What it is',
      'A discriminated union (or tagged union) is a union of object types that all share one property — the discriminant — whose value is a different literal in each member.',
      'A literal is an exact value type like `"circle"` or `true`.',
      'Typical discriminant names: `kind`, `type`, `status`, `ok`.',
      'Checking the discriminant (with `if` or `switch`) narrows the union to exactly one member.',
      'This lets you model data where different variants have different fields, and makes invalid combinations impossible to represent.',
      '# How it works',
      'Define each variant with its own literal tag and its own fields:',
      '  `{ kind: "circle"; r: number }`',
      '  `{ kind: "rect"; w: number; h: number }`',
      'In `switch (s.kind)`, each `case` narrows `s`:',
      '  In `case "circle"`, TS knows `s.r` exists.',
      '  In `case "rect"`, TS knows `s.w` and `s.h` exist.',
      'Accessing `s.r` before checking `kind` is an error, because `rect` has no `r`.',
      'Add a `never` check in `default` to get a compile error when a new variant is added but not handled.',
      '# Example walkthrough',
      '`area({ kind: "circle", r: 1 })` goes to the circle branch and prints `3.14` (rounded).',
      '`area({ kind: "rect", w: 2, h: 3 })` prints `6`.',
      '`Result<T>` models an API outcome: `ok: true` has `data`; `ok: false` has `error`.',
      'In `handle`, `if (res.ok)` narrows so `res.data` is accessible; the else branch accesses `res.error`.',
      '# Why it matters / when to use',
      'API responses (`success` vs `error`), payment states (`pending`, `paid`, `failed` with a reason), WebSocket or queue messages, and Redux/reducer actions.',
      'Replacing bags of optional fields (`data?`, `error?`, `loading?`) that allow nonsense combinations like having both `data` and `error`.',
      '# Common mistakes',
      'Using `string` instead of literal types for the tag — narrowing then cannot work.',
      'Destructuring the tag into a separate variable in old TS versions (TS 4.6+ now handles destructured discriminants for `const`).',
      'Forgetting the exhaustiveness check, so adding a new variant silently falls through.',
      '# Say this in the interview',
      'A discriminated union is a union of object types that share a literal tag property like `kind`. Checking that tag with `if` or `switch` narrows the value to exactly one variant, so TypeScript knows which fields exist. I use them for API results, state machines and event messages, and pair them with a `never` exhaustiveness check.',
      'Follow-up: Why is this better than optional fields?',
      '  Optional fields allow impossible states (both `data` and `error`); a tagged union makes each valid state explicit and forces callers to handle each one.',
    ],
    code: `type Shape =
  | { kind: "circle"; r: number }
  | { kind: "rect"; w: number; h: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.r ** 2; // s: circle variant
    case "rect":   return s.w * s.h;          // s: rect variant
  }
}
console.log(area({ kind: "circle", r: 1 }).toFixed(2)); // → 3.14
console.log(area({ kind: "rect", w: 2, h: 3 }));        // → 6

// API result modelled as a tagged union
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function handle(res: Result<{ name: string }>) {
  if (res.ok) {
    console.log("user: " + res.data.name);  // data only exists when ok
  } else {
    console.log("failed: " + res.error);    // error only exists when !ok
  }
}
handle({ ok: true, data: { name: "Asha" } }); // → user: Asha
handle({ ok: false, error: "404" });          // → failed: 404
// handle({ ok: true, error: "x" });          // error: impossible state
`,
  },
  {
    id: 'exhaustiveness-checking',
    group: 'Unions, Narrowing & Type Guards',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you do exhaustiveness checking with `never`?',
    a: [
      '# ELI5',
      'A teacher takes attendance by ticking names off a list. When every name is ticked, the "still missing" pile is empty.',
      'If a new student joins and the teacher forgets them, the missing pile is not empty — and an alarm goes off.',
      'Mapping: after handling every member of a union, the leftover type is `never` (the empty pile); if you forget a case, the leftover is not `never` and the compiler raises an error.',
      '# What it is',
      'Exhaustiveness checking means making the compiler prove that every possible case of a union has been handled.',
      '`never` is the type with no values. After all union members are narrowed away, the remaining type of the variable is `never`.',
      'You force a check by assigning the leftover value to something typed `never`; only `never` is assignable to `never`.',
      'A common helper: `function assertNever(x: never): never { throw new Error(...) }`.',
      '# How it works',
      'Start with `s: Shape` where `Shape = Circle | Rect | Triangle`.',
      'Each `case` removes one member:',
      '  After `case "circle"`, the remaining type is `Rect | Triangle`.',
      '  After `case "rect"`, the remaining type is `Triangle`.',
      '  After `case "triangle"`, the remaining type is `never`.',
      'In `default`, calling `assertNever(s)` compiles only if `s` is `never`.',
      'If someone adds `Square` to `Shape` and forgets a case, `s` in `default` is `Square`, and the call becomes a compile error pointing at the missing case.',
      'At runtime, `assertNever` throws if unexpected data (e.g. from an old client) somehow reaches it.',
      '# Example walkthrough',
      '`area` handles three variants; `assertNever(s)` in `default` compiles because `s` is `never` there.',
      'Calling `area` on a triangle prints `6`.',
      'The commented `Square` scenario shows the error message you would get: "Argument of type Square is not assignable to parameter of type never".',
      'The `satisfies never` variant does the same check without a helper function.',
      '# Why it matters / when to use',
      'Reducers, state machines, event handlers and message routers where new variants are added over time.',
      'It turns "forgot to handle the new status" from a production bug into a compile error.',
      'ESLint rule `@typescript-eslint/switch-exhaustiveness-check` can enforce it automatically.',
      '# Common mistakes',
      'Using a `default` that just returns a fallback, which hides missing cases.',
      'Forgetting to `return` or `break` in each case, so narrowing does not reach `never`.',
      'Not throwing in `assertNever` — invalid runtime data then continues silently.',
      '# Say this in the interview',
      'After every member of a union is handled, the remaining type is `never`. I put `assertNever(x)` or `const _exhaustive: never = x` in the default branch; if someone adds a new variant without handling it, the leftover type is not `never` and the code no longer compiles. At runtime the helper throws, protecting against unexpected data.',
      'Follow-up: What if you have no `switch`, just if/else?',
      '  Same idea: after the last `if`, call `assertNever(x)` with the remaining value.',
    ],
    code: `type Shape =
  | { kind: "circle"; r: number }
  | { kind: "rect"; w: number; h: number }
  | { kind: "triangle"; b: number; h: number };

function assertNever(x: never): never {
  throw new Error("Unhandled case: " + JSON.stringify(x));
}

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":   return Math.PI * s.r ** 2;
    case "rect":     return s.w * s.h;
    case "triangle": return (s.b * s.h) / 2;
    default:         return assertNever(s); // s: never here
  }
}
console.log(area({ kind: "triangle", b: 4, h: 3 })); // → 6

// If someone adds { kind: "square"; side: number } to Shape and
// forgets a case, the default line errors at compile time:
//   Argument of type '{ kind: "square"; ... }' is not assignable
//   to parameter of type 'never'.

// Alternative without a helper (TS 4.9+):
function label(s: Shape): string {
  switch (s.kind) {
    case "circle": return "round";
    case "rect": case "triangle": return "pointy";
    default:
      s satisfies never;
      throw new Error("unreachable");
  }
}
console.log(label({ kind: "rect", w: 1, h: 1 })); // → pointy
`,
  },
  {
    id: 'optional-chaining-nullish',
    group: 'Unions, Narrowing & Type Guards',
    stars: 4,
    difficulty: 'Easy',
    q: 'How do optional chaining (`?.`) and nullish coalescing (`??`) interact with types?',
    a: [
      '# ELI5',
      'Optional chaining: walking through a house, you peek into a room only if the door exists; if there is no door, you just say "nothing here" instead of crashing into a wall.',
      'Nullish coalescing: "If the fridge is empty, use the backup snack" — but a fridge with a single zero-calorie item still counts as not empty.',
      'Mapping: `?.` stops safely at `null`/`undefined` and gives `undefined`; `??` supplies a fallback only for `null`/`undefined`.',
      '# What it is',
      'Optional chaining `a?.b` reads `b` only if `a` is not `null` or `undefined`; otherwise the whole expression is `undefined`.',
      'Forms: `a?.b` (property), `a?.[key]` (computed key), `fn?.()` (call only if the function exists).',
      'Nullish means exactly `null` or `undefined`.',
      'Nullish coalescing `x ?? y` returns `x` unless `x` is nullish, in which case it returns `y`.',
      '`??=` assigns only if the left side is nullish: `opts.retries ??= 3`.',
      'Comparison row — `x || y`: falls back for ANY falsy value (`0`, `""`, `false`, `NaN`, `null`, `undefined`).',
      'Comparison row — `x ?? y`: falls back only for `null` and `undefined`; keeps `0`, `""` and `false`.',
      '# How it works',
      'Types with `?.`: if `user: User | undefined`, then `user?.name` has type `string | undefined`.',
      'Short-circuiting: in `a?.b.c.d`, if `a` is nullish, the whole chain stops and returns `undefined` — `.c.d` is not evaluated.',
      'Types with `??`: `x ?? y` has type `NonNullable<typeof x> | typeof y`, i.e. `null`/`undefined` are removed from the left side.',
      'So `user?.name ?? "guest"` has type `string`.',
      'Both are compiled to plain JS (supported natively in Node 14+), so they work at runtime too.',
      '# Example walkthrough',
      '`cfg.db?.host` returns `undefined` because `db` is missing; the type is `string | undefined`.',
      '`cfg.db?.host ?? "localhost"` prints `localhost`, and its type is `string`.',
      '`cfg.port || 3000` wrongly replaces the valid port `0` and prints `3000`; `cfg.port ?? 3000` keeps `0`.',
      '`cfg.onReady?.()` does nothing because there is no callback.',
      '`cfg.retries ??= 3` sets the default and prints `3`.',
      '# Why it matters / when to use',
      'Reading deep optional fields from config files, API responses or DB rows with nullable relations.',
      'Applying defaults to settings where `0`, `false` or `""` are valid (port 0, timeout 0, feature flag false).',
      'Calling optional hooks or callbacks.',
      '# Common mistakes',
      'Using `||` for defaults and losing valid falsy values like `0` or `""`.',
      'Overusing `?.` on values that should never be missing, hiding real bugs as silent `undefined`.',
      'Mixing `??` with `||` or `&&` without parentheses — that is a syntax error; add parentheses.',
      '# Say this in the interview',
      'Optional chaining `?.` short-circuits to `undefined` when the left side is null or undefined, so the result type includes `undefined`. Nullish coalescing `??` gives a fallback only for null or undefined, unlike `||` which also replaces `0`, `""` and `false`, and it removes null and undefined from the resulting type. Together, `a?.b ?? fallback` gives a safe, non-nullable value.',
      'Follow-up: What does `??=` do?',
      '  It assigns the right side only when the variable is currently null or undefined.',
    ],
    code: `type Config = {
  port?: number;
  db?: { host: string };
  retries?: number;
  onReady?: () => void;
};

const cfg: Config = { port: 0 };

const host = cfg.db?.host;                 // string | undefined
console.log(host);                         // → undefined
const safeHost = cfg.db?.host ?? "localhost"; // string
console.log(safeHost);                     // → localhost

console.log(cfg.port || 3000);            // → 3000  (bug: 0 is a valid port)
console.log(cfg.port ?? 3000);            // → 0     (correct)

cfg.onReady?.();                           // nothing happens: no callback

cfg.retries ??= 3;                         // assign only if nullish
console.log(cfg.retries);                  // → 3

const tags: string[] | undefined = undefined;
console.log(tags?.[0] ?? "no tags");       // → no tags
`,
  },
  {
    id: 'in-operator-narrowing',
    group: 'Unions, Narrowing & Type Guards',
    stars: 3,
    difficulty: 'Easy',
    q: 'How does the `in` operator narrow types?',
    a: [
      '# ELI5',
      'You meet someone and want to know if they are a swimmer or a pilot. You ask: "Do you have a swimming badge?" If yes, they are the swimmer.',
      'Mapping: `"prop" in obj` asks whether an object has a property, and TS uses the answer to pick the matching type from a union.',
      '# What it is',
      '`in` is a JavaScript operator: `"key" in obj` returns `true` if `obj` (or its prototype chain) has that property.',
      'TypeScript uses it for narrowing: in the `true` branch, the union is narrowed to members that declare (or optionally declare) that property.',
      'In the `false` branch, it narrows to members that do not have that property as required.',
      'Useful for unions of object types that have no shared discriminant (tag) property.',
      'Since TS 4.9, using `in` on a value of type `object` (or narrowed `unknown`) adds the property to the type as `unknown`, e.g. `obj & Record<"id", unknown>`.',
      '# How it works',
      'Given `type Pet = Fish | Bird` where only `Fish` has `swim`:',
      '  `if ("swim" in pet)` → `pet: Fish`.',
      '  `else` → `pet: Bird`.',
      'If a property is optional on one member, that member appears in both branches.',
      'For `unknown` data: first narrow to a non-null object (`typeof x === "object" && x !== null`), then `"id" in x` lets you read `x.id` as `unknown`.',
      '# Example walkthrough',
      '`move` takes `Fish | Bird`; for `nemo`, `"swim" in pet` is true and it prints `swim`.',
      'For `tweety`, the else branch runs with `pet: Bird` and prints `fly`.',
      '`getId` checks an `unknown` value step by step: object, not null, has `id`, `id` is a number; then prints `7`, otherwise `-1`.',
      '# Why it matters / when to use',
      'Distinguishing error shapes from different libraries (e.g. `"code" in err`).',
      'Handling payloads from different API versions where one has a field the other lacks.',
      'Safely probing `unknown` JSON before a full validation.',
      '# Common mistakes',
      'Using `in` on a primitive or `null` — it throws a `TypeError` at runtime; check `typeof x === "object" && x !== null` first.',
      'Assuming `in` proves the type: because of structural typing, a `Bird` object could still have an extra `swim` property at runtime.',
      'Confusing `in` (checks keys) with `includes` (checks array values).',
      '# Say this in the interview',
      'The `in` operator checks if a property exists, and TypeScript narrows a union to the members that have that property in the true branch and the others in the false branch. It is handy when there is no shared tag property. Since TS 4.9 it also works on `unknown`-like objects, adding the checked key as `unknown` so you can inspect it further.',
      'Follow-up: When would you prefer a discriminant instead?',
      '  When you control the types; a literal tag is more reliable and explicit than probing for keys.',
    ],
    code: `type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(pet: Fish | Bird) {
  if ("swim" in pet) {
    pet.swim();          // pet: Fish
  } else {
    pet.fly();           // pet: Bird
  }
}
move({ swim: () => console.log("swim") }); // → swim
move({ fly: () => console.log("fly") });   // → fly

// Probing unknown data safely (TS 4.9+)
function getId(x: unknown): number {
  if (typeof x === "object" && x !== null && "id" in x) {
    // x: object & Record<"id", unknown>
    if (typeof x.id === "number") return x.id;
  }
  return -1;
}
console.log(getId({ id: 7 }));    // → 7
console.log(getId({ id: "7" }));  // → -1
console.log(getId(null));         // → -1  (no crash: null checked first)
// "id" in null;                  // would throw TypeError at runtime
`,
  },
  {
    id: 'assertion-functions',
    group: 'Unions, Narrowing & Type Guards',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are assertion functions (`asserts x is T`)?',
    a: [
      '# ELI5',
      'A bouncer at a club door checks your ID. If you are too young, you are thrown out immediately. If you get past the bouncer, everyone inside knows you are an adult.',
      'Mapping: an assertion function throws if a condition fails; if it returns normally, TypeScript knows the condition is true for all the following code.',
      '# What it is',
      'An assertion function is a function whose return type is an assertion signature:',
      '  `asserts value is T` — after the call, `value` is narrowed to `T`.',
      '  `asserts condition` — after the call, the boolean `condition` is known to be true.',
      'The function must throw an error when the check fails; returning normally means "the assertion holds".',
      'Like type guards, the compiler trusts your implementation and does not verify the body.',
      'Difference from a type guard: a guard returns `true`/`false` and narrows only inside an `if`; an assertion narrows the rest of the scope after the call.',
      '# How it works',
      'You declare `function assertIsString(v: unknown): asserts v is string`.',
      'Inside, you check and throw: `if (typeof v !== "string") throw new TypeError(...)`.',
      'At the call site, every line after `assertIsString(input)` sees `input` as `string`.',
      'Rule: the function must be called through an explicitly typed reference — a function declaration, or a `const` with an explicit type annotation. An inferred arrow function `const assert = (v) => {...}` will not work.',
      'Node built-in `assert` from `node:assert` is typed as `asserts value`, so `assert(user)` narrows too.',
      '# Example walkthrough',
      '`assertIsString(input)` passes for `"hello"`, so `input.toUpperCase()` compiles and prints `HELLO`.',
      'For the number `42`, the function throws and the `catch` prints `not a string: 42`.',
      '`assert(user, "user missing")` from `node:assert` narrows `user` from `User | undefined` to `User`, so `user.name` compiles and prints `Asha`.',
      '# Why it matters / when to use',
      'Validating environment variables at startup (`assertDefined(process.env.DB_URL)`).',
      'Checking invariants in service code without nesting the rest of the function in an `if`.',
      'Test helpers that narrow results before assertions.',
      '# Common mistakes',
      'Forgetting to throw on failure — then the type is narrowed but the value is wrong.',
      'Declaring the assertion as an untyped arrow function and getting error "Assertions require every name in the call target to be declared with an explicit type annotation".',
      'Using assertions where a recoverable branch is needed; assertions are for "this must be true or we stop".',
      '# Say this in the interview',
      'An assertion function has a return type like `asserts value is T`. It throws if the check fails, and if it returns, TypeScript narrows the value for the rest of the scope, so I do not need to wrap code in an `if`. Like type guards, the compiler trusts the implementation, and the function must be declared with an explicit type.',
      'Follow-up: Is Node `assert` an assertion function?',
      '  Yes, `assert(value)` from `node:assert` is typed `asserts value`, so it narrows out null and undefined.',
    ],
    code: `import assert from "node:assert";

function assertIsString(v: unknown): asserts v is string {
  if (typeof v !== "string") {
    throw new TypeError("not a string: " + String(v));
  }
}

function shout(input: unknown) {
  assertIsString(input);         // throws if not a string
  return input.toUpperCase();    // input: string from here on
}

console.log(shout("hello"));     // → HELLO
try {
  shout(42);
} catch (e) {
  if (e instanceof Error) console.log(e.message); // → not a string: 42
}

// Node's built-in assert narrows too: (value: unknown) => asserts value
type User = { name: string };
const users = new Map<number, User>([[1, { name: "Asha" }]]);
const user = users.get(1);       // User | undefined
assert(user, "user missing");
console.log(user.name);          // → Asha  (user: User)
`,
  },
  {
    id: 'inferred-type-predicates',
    group: 'Unions, Narrowing & Type Guards',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you filter `null`s out of an array with correct types?',
    a: [
      '# ELI5',
      'You sort a basket of fruit and throw out the empty wrappers. Afterwards, you know the basket has only real fruit.',
      'Older TypeScript was like a forgetful helper: even after you removed the wrappers, it still said "might contain wrappers".',
      'Mapping: since TS 5.5 the helper remembers — `filter(x => x !== null)` gives an array type without `null`.',
      '# What it is',
      'Problem: `[1, null, 2].filter(x => x !== null)` contains only numbers at runtime, but old TS typed the result as `(number | null)[]`.',
      'Reason: `filter` only narrows the array type if its callback is a type predicate (`(x): x is T => ...`); a plain boolean-returning arrow function was not.',
      'Inferred type predicates (TS 5.5+): the compiler now looks at a simple function body and infers `x is number` automatically when the boolean result exactly matches a narrowing.',
      'Before 5.5 (or in complex cases) you write the predicate explicitly: `.filter((x): x is number => x !== null)`.',
      '`.filter(Boolean)` still does NOT narrow, because `Boolean` is a constructor with no predicate signature, and it would also remove `0` and `""`.',
      '# How it works',
      'TS 5.5 infers a predicate `x is T` for a function when:',
      '  It has no explicit return type annotation.',
      '  It has a single `return` statement and no mutation of the parameter.',
      '  It returns a boolean expression that narrows the parameter.',
      '  "If true then x is T" AND "if false then x is not T" both hold.',
      'The last rule is why `x => !!x` on `number | null` is NOT inferred: false could also mean `x` is `0`, which is still a number.',
      'Once inferred, the predicate flows into `Array.prototype.filter`, whose overload `filter<S extends T>(pred: (v: T) => v is S): S[]` returns the narrowed array.',
      '# Example walkthrough',
      '`nums` comes from `xs.filter(x => x !== null)` and is typed `number[]` in TS 5.5+; doubling works and prints `[ 2, 4 ]`.',
      '`explicit` uses a hand-written predicate, which works in every TS version.',
      '`truthy` uses `filter(Boolean)`; the type stays `(number | null)[]` and the valid `0` is dropped at runtime, printing `[ 1, 2 ]`.',
      '`isDefined` is a reusable generic guard for `null` and `undefined`.',
      '# Why it matters / when to use',
      'Cleaning results of `Promise.allSettled`, optional DB lookups, or parsed rows where some entries are `null`.',
      'Avoids sprinkling `!` or `as` after a filter.',
      '# Common mistakes',
      'Using `.filter(Boolean)` and losing valid falsy values like `0` or `""`.',
      'Adding an explicit `: boolean` return type, which stops the inference.',
      'Running an older TypeScript version (check `tsc -v`) and expecting the 5.5 behaviour.',
      '# Say this in the interview',
      'Since TypeScript 5.5 the compiler infers type predicates from simple functions, so `arr.filter(x => x !== null)` returns a non-null array type. Before that, or when the logic is complex, I write an explicit guard such as `(x): x is T => x != null` or a reusable `isDefined` helper. I avoid `filter(Boolean)` because it does not narrow and drops valid falsy values.',
      'Follow-up: Why does `x => !!x` not get a predicate?',
      '  Because returning false does not prove `x` is null; `x` could be `0`, which is still a number.',
    ],
    code: `const xs: (number | null)[] = [1, null, 2, 0];

// TS 5.5+: predicate inferred automatically -> number[]
const nums = xs.filter(x => x !== null);
console.log(nums.map(n => n * 2));      // → [ 2, 0, 4, 0 ]

// Works in every version: explicit type predicate
const explicit = xs.filter((x): x is number => x !== null);
console.log(explicit.length);           // → 3

// filter(Boolean): does not narrow AND drops the valid 0
const truthy = xs.filter(Boolean);      // still (number | null)[]
console.log(truthy);                    // → [ 1, 2 ]

// Reusable generic helper
function isDefined<T>(v: T | null | undefined): v is T {
  return v !== null && v !== undefined;
}
const names = ["Asha", undefined, "Ravi", null].filter(isDefined); // string[]
console.log(names.join(" & "));         // → Asha & Ravi
`,
  },
  {
    id: 'narrowing-in-callbacks',
    group: 'Unions, Narrowing & Type Guards',
    stars: 3,
    difficulty: 'Hard',
    q: 'Why is narrowing sometimes lost inside callbacks?',
    a: [
      '# ELI5',
      'You check the fridge at 9am and see milk. You leave a note for a friend who will come at 5pm: "use the milk".',
      'But someone else might drink the milk before 5pm, so your 9am check cannot be trusted at 5pm.',
      'Mapping: a callback runs later; if the variable can be changed in between, TypeScript forgets the earlier narrowing to be safe.',
      '# What it is',
      'A callback is a function you pass to be run later, e.g. to `setTimeout`, `arr.map`, an event listener or a promise `.then`.',
      'A closure is a function that remembers variables from the scope where it was created.',
      'TS narrows variables based on checks (e.g. `if (v)`), but it does not know WHEN a callback will run.',
      'If the variable is mutable (`let`, a `var`, or an object property) and could be reassigned before the callback runs, TS resets the narrowing inside the callback.',
      '`const` variables and parameters that are never reassigned keep their narrowing, because they cannot change.',
      'TS 5.4 improved this: narrowing of a `let` or parameter is preserved in closures created after the last assignment to it.',
      '# How it works',
      'TS sees `let v: string | undefined` and an `if (v)` check — inside the block, `v` is `string`.',
      'You create `() => v.length` inside the block.',
      'TS asks: "is there any assignment to `v` that could happen after this closure is created?"',
      '  If yes (e.g. `v = undefined` later in the function), the closure sees the declared type `string | undefined` → error.',
      '  If no (TS 5.4+), narrowing is kept.',
      'Object properties (`obj.prop`) are almost always reset in callbacks, since any code could change them.',
      '# Example walkthrough',
      'In `example1`, `v` is reassigned at the end of the function, so inside `setTimeout`, `v.length` would be an error.',
      'Copying into `const s = v` captures the narrowed value; `s.length` is safe and prints `5`.',
      'In `example2`, there are no assignments after the closure is created, so TS 5.4+ keeps the narrowing and prints `HI`.',
      '`config.name` is a property; copying it into a `const` before `forEach` is the reliable fix, printing `app:a` and `app:b`.',
      '# Why it matters / when to use',
      'Common in Node code: narrowing a value, then using it inside `setTimeout`, `process.nextTick`, `.then`, array callbacks or event handlers.',
      'Understanding this avoids reaching for `!` to silence errors.',
      '# Common mistakes',
      'Using `v!.length` inside the callback — compiles, but is wrong if `v` really did change.',
      'Using `let` where `const` would do; prefer `const` by default.',
      'Re-checking the property inside the callback when a simple `const` copy is cleaner.',
      '# Say this in the interview',
      'Narrowing is based on control flow, but a callback can run later, after a mutable variable or property has been reassigned. So TypeScript resets narrowing of `let` variables and properties inside closures unless it can prove there are no later assignments, which TS 5.4 started doing. The usual fix is to copy the narrowed value into a `const` before creating the callback.',
      'Follow-up: Why do `const` variables keep narrowing?',
      '  They can never be reassigned, so the check is still true whenever the callback runs.',
    ],
    code: `function example1(input: string | undefined) {
  let v = input;
  if (v) {
    // setTimeout(() => console.log(v.length)); // error: v is possibly undefined
    const s = v;                                // capture the narrowed value
    setTimeout(() => console.log(s.length));    // → 5
  }
  v = undefined; // this later assignment is why TS resets narrowing above
}
example1("hello");

function example2(input: string | undefined) {
  if (input) {
    // No assignment to input anywhere after this point:
    // TS 5.4+ keeps it narrowed inside the closure
    [1].forEach(() => console.log(input.toUpperCase())); // → HI
  }
}
example2("hi");

// Properties are always reset in callbacks -> copy into a const
const config: { name?: string } = { name: "app" };
if (config.name) {
  const name = config.name;                     // string
  ["a", "b"].forEach(x => console.log(name + ":" + x)); // → app:a, app:b
}
`,
  },
  {
    id: 'instanceof-narrowing',
    group: 'Unions, Narrowing & Type Guards',
    stars: 3,
    difficulty: 'Easy',
    q: 'When do you use `instanceof` vs `typeof` for narrowing?',
    a: [
      '# ELI5',
      '`typeof` is like asking "Is this a fruit, a vegetable or a toy?" — broad basic categories.',
      '`instanceof` is like checking the brand label: "Was this made by the Apple factory?" — a specific maker.',
      'Mapping: `typeof` tells you the primitive kind of a value; `instanceof` tells you which class (constructor) created an object.',
      '# What it is',
      '`typeof x` is a JS operator returning a string: `"string"`, `"number"`, `"boolean"`, `"bigint"`, `"symbol"`, `"undefined"`, `"function"` or `"object"`.',
      '`x instanceof C` is a JS operator returning `true` if `C.prototype` is somewhere in the prototype chain of `x`.',
      'The prototype chain is the linked list of objects JS walks to find inherited properties; every object created by `new C()` links to `C.prototype`.',
      'Comparison row — works on: `typeof` → primitives (and functions); `instanceof` → objects created by classes or constructor functions.',
      'Comparison row — narrows to: `typeof` → `string`, `number`, etc.; `instanceof` → the class type (e.g. `Date`, `Error`, `HttpError`).',
      'Comparison row — gotcha: `typeof null === "object"`; `instanceof` fails across different JS realms (iframes, `vm` contexts) and for plain objects.',
      'Interfaces and type aliases do not exist at runtime, so you cannot use `instanceof` with them.',
      '# How it works',
      'For `typeof`, TS maps each string result to a type and narrows the union.',
      'For `instanceof`, TS narrows to the instance type of the class on the right-hand side.',
      'Subclasses also pass: an instance of `NotFoundError extends HttpError` is `instanceof HttpError`.',
      'For arrays, `Array.isArray(x)` is more reliable than `instanceof Array` (works across realms).',
      '# Example walkthrough',
      '`describe(5)` → `typeof` branch prints `number: 5.00`.',
      '`describe(new Date(0))` → `instanceof Date` branch prints the ISO string.',
      'In `handleError`, `new NotFoundError("/x")` passes `instanceof HttpError` (because it is a subclass) and prints `404 not found: /x`.',
      'A thrown string (`throw "oops"`) is not an `Error`, so it falls into the last branch and prints `unknown error: oops`.',
      '# Why it matters / when to use',
      'Error handling in Express/Fastify: `if (err instanceof ZodError)` or `if (err instanceof HttpError)` to choose a status code.',
      'Distinguishing `Date`, `Buffer`, `Map` or custom class instances.',
      '`typeof` for validating primitives in input, config and query params.',
      '# Common mistakes',
      'Forgetting that `typeof null === "object"`, so `typeof x === "object"` does not exclude `null`.',
      'Trying `x instanceof MyInterface` — interfaces are erased, so this is a compile error.',
      'Custom errors losing their prototype when compiling to old ES5 targets; target ES2015+ (the default in modern setups) so `instanceof` works.',
      '# Say this in the interview',
      'I use `typeof` to narrow primitives like strings, numbers and functions, remembering that `typeof null` is `"object"`. I use `instanceof` to narrow objects created by classes, such as `Date` or custom error classes, because it checks the prototype chain. Interfaces do not exist at runtime, so for them I use `in` checks or custom type guards.',
      'Follow-up: How do you narrow a caught error?',
      '  `catch (e) { if (e instanceof Error) ... }`, because the caught value is `unknown` and could be anything that was thrown.',
    ],
    code: `function describe(x: number | string | Date): string {
  if (typeof x === "number") return "number: " + x.toFixed(2);
  if (typeof x === "string") return "string: " + x.toUpperCase();
  return "date: " + x.toISOString();      // x: Date (only option left)
}
console.log(describe(5));                 // → number: 5.00
console.log(describe(new Date(0)));       // → date: 1970-01-01T00:00:00.000Z

class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
class NotFoundError extends HttpError {
  constructor(path: string) { super(404, "not found: " + path); }
}

function handleError(err: unknown) {
  if (err instanceof HttpError) {
    console.log(err.status + " " + err.message); // err: HttpError
  } else if (err instanceof Error) {
    console.log("500 " + err.message);
  } else {
    console.log("unknown error: " + String(err));
  }
}

handleError(new NotFoundError("/x"));     // → 404 not found: /x
handleError(new Error("db down"));        // → 500 db down
handleError("oops");                      // → unknown error: oops
console.log(typeof null);                 // → object  (the classic gotcha)
`,
  },
  {
    id: 'truthiness-narrowing-pitfalls',
    group: 'Unions, Narrowing & Type Guards',
    stars: 2,
    difficulty: 'Easy',
    q: 'What is the pitfall of truthiness narrowing?',
    a: [
      '# ELI5',
      'A guard is told: "Only let in people who have something in their pocket." Someone with a coin worth zero gets turned away — even though they did have a coin.',
      'Mapping: `if (x)` throws out `null` and `undefined`, but also valid values like `0`, `""` and `false`.',
      '# What it is',
      'Truthiness narrowing is using a value directly as a condition, like `if (x)` or `x && ...`.',
      'Falsy values are values JS treats as false in a condition: `false`, `0`, `-0`, `0n`, `""` (empty string), `null`, `undefined`, `NaN`.',
      'Truthy values are everything else (including `"0"`, `[]` and `{}`).',
      'TS narrows `if (x)` by removing `null` and `undefined` from the type, which is useful.',
      'The pitfall: the same check also skips legitimate falsy values your type allows, such as `0` for a `number` or `""` for a `string`.',
      '# How it works',
      'For `x: number | undefined`, `if (x)` narrows `x` to `number` inside the block — but at runtime the block is also skipped when `x` is `0`.',
      'TS does not warn you, because skipping is a logic choice, not a type error.',
      'Fixes:',
      '  `if (x !== undefined)` — only excludes `undefined`.',
      '  `if (x != null)` — loose inequality excludes both `null` and `undefined` but keeps `0` and `""`.',
      '  Use `??` instead of `||` for defaults.',
      '`!!x` and `Boolean(x)` behave the same as `if (x)` and have the same problem.',
      '# Example walkthrough',
      '`badDiscount(0)` treats a 0% discount as "no discount given" and prints `default 10%` — a bug.',
      '`goodDiscount(0)` uses `!= null` and correctly prints `0%`.',
      '`goodDiscount(undefined)` prints `default 10%` as intended.',
      'The query example shows `""` (an empty search) being treated as "missing" by `||`, while `??` keeps it.',
      '# Why it matters / when to use',
      'Pagination (`page = 0`), prices and quantities (`0`), feature flags (`false`), and empty-string filters are all real backend values.',
      'Bugs here often only appear in edge cases and slip past tests.',
      '# Common mistakes',
      'Writing `if (user.age)` and skipping newborns with age `0`.',
      'Defaulting with `limit || 20` when `limit = 0` was intentional.',
      'Using `if (arr)` to check for an empty array — empty arrays are truthy; check `arr.length`.',
      '# Say this in the interview',
      'Truthiness checks like `if (x)` remove null and undefined from the type, but they also skip valid falsy values such as `0`, `""` and `false`. For numbers and strings I check explicitly with `x !== undefined` or `x != null`, and I use `??` instead of `||` for defaults.',
      'Follow-up: Is `[]` falsy?',
      '  No. Empty arrays and objects are truthy; check `.length` or `Object.keys(o).length`.',
    ],
    code: `function badDiscount(pct?: number) {
  if (pct) return pct + "%";          // 0 is falsy -> skipped!
  return "default 10%";
}
function goodDiscount(pct?: number) {
  if (pct != null) return pct + "%";  // excludes only null and undefined
  return "default 10%";
}

console.log(badDiscount(0));          // → default 10%  (bug)
console.log(goodDiscount(0));         // → 0%
console.log(goodDiscount(undefined)); // → default 10%

// Same pitfall with || defaults
const search = "";                    // user explicitly searched for nothing
console.log(JSON.stringify(search || "all"));  // → "all"  (lost the empty string)
console.log(JSON.stringify(search ?? "all"));  // → ""     (kept)

// Empty arrays are truthy
const items: string[] = [];
console.log(items ? "has items?" : "none");    // → has items?  (wrong check)
console.log(items.length > 0 ? "has items" : "none"); // → none
`,
  },

  // ───────────────────────────── Generics ─────────────────────────────
  {
    id: 'what-are-generics',
    group: 'Generics',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are generics and why are they useful?',
    a: [
      '# ELI5',
      'A lunchbox factory makes one lunchbox design, but you choose what goes in it: sandwiches, fruit or cookies.',
      'Whatever you put in, you get the same kind of thing back out — put in fruit, take out fruit.',
      'Mapping: generics let you write one function or type that works with any type, while remembering exactly which type was used.',
      '# What it is',
      'Generics are type parameters — placeholders for types, written in angle brackets like `<T>`, that are filled in when the function or type is used.',
      'Think of them as function parameters, but for types: `function first<T>(arr: T[]): T` takes a type `T` as well as a value.',
      'Unlike `any`, generics preserve the relationship between input and output: if you pass `number[]`, you get `number` back, not `any`.',
      'Type argument inference: TS usually works out `T` from the arguments, so you rarely write `first<number>(...)` yourself.',
      'Built-in examples: `Array<T>`, `Promise<T>`, `Map<K, V>`, `Set<T>`, `Record<K, V>`.',
      'Generics are erased at compile time like all types; there is no runtime cost.',
      '# How it works',
      'You declare type parameters after the name: `function wrap<T>(value: T): { value: T }`.',
      'At each call, TS infers `T` from the argument:',
      '  `wrap(5)` → `T = number` → returns `{ value: number }`.',
      '  `wrap("a")` → `T = string` → returns `{ value: string }`.',
      'You can also pass the type explicitly: `wrap<string>("a")`, needed when nothing to infer from (e.g. `new Map<string, number>()`).',
      'Inside the function, TS treats `T` as an unknown type, so you can only do things that work for any type (unless you add a constraint with `extends`).',
      'Good rule: a type parameter should appear at least twice (e.g. in a parameter and the return type); if it appears once, a plain type is simpler.',
      '# Example walkthrough',
      '`first([1, 2])` infers `T = number`, so `n` is `number | undefined`; it prints `1`.',
      '`first(["a"])` infers `string`; `s?.toUpperCase()` prints `A`.',
      '`firstAny` returns `any`, so `.toFixed()` on a string compiles but crashes — showing why generics beat `any`.',
      '`Box<T>` is a generic type; `Box<number>` has a `number` value.',
      '`fetchJson<User>(...)` shows the typical API-client pattern where you pass the expected type explicitly.',
      '# Why it matters / when to use',
      'Reusable utilities: `groupBy`, `retry`, `cache`, `paginate` that work for any entity type.',
      'Typed API clients and repository classes: `Repository<User>`, `ApiResponse<Order>`.',
      'Data structures: queues, stacks, LRU caches holding any item type.',
      '# Common mistakes',
      'Using `any` instead of a generic, losing type information.',
      'Adding a type parameter that is used only once (`function log<T>(x: T): void`), which adds noise with no benefit.',
      'Trusting `fetchJson<User>()` as validated — the generic is only a cast; validate the JSON at runtime.',
      '# Say this in the interview',
      'Generics are type parameters that let one function, class or type work with many types while keeping the relationship between input and output. Unlike `any`, the actual type flows through, so `first<T>(arr: T[]): T` returns a `number` for a number array. TypeScript usually infers the type argument, and generics power built-ins like `Array<T>` and `Promise<T>`.',
      'Follow-up: Generics vs `any`?',
      '  `any` throws away type information; generics keep it and still accept any type.',
      'Follow-up: Generics vs unions?',
      '  A union accepts several types but does not link input to output; a generic says "whatever type comes in, the same comes out".',
    ],
    code: `// One function, any element type, exact type preserved
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
const n = first([1, 2]);        // T = number  -> number | undefined
const s = first(["a"]);         // T = string  -> string | undefined
console.log(n, s?.toUpperCase()); // → 1 A

// Compare with any: no safety
function firstAny(arr: any[]): any { return arr[0]; }
const oops = firstAny(["a"]);
// oops.toFixed(2);             // compiles, but crashes at runtime

// Generic type
type Box<T> = { value: T; label: string };
const b: Box<number> = { value: 42, label: "answer" };
console.log(b.value + 1);       // → 43

// Typical API client pattern (T is the expected response type)
type User = { id: number; name: string };
async function fetchJson<T>(url: string): Promise<T> {
  const fake = '{"id": 1, "name": "Asha"}';    // stand-in for fetch(url)
  return JSON.parse(fake) as T;                // unchecked: validate in real code!
}
fetchJson<User>("/api/users/1").then(u => console.log(u.name)); // → Asha
`,
  },
  {
    id: 'generic-constraints',
    group: 'Generics',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you constrain a generic type with `extends`?',
    a: [
      '# ELI5',
      'A ride at the fair says "anyone can ride — as long as you are at least this tall". It accepts many people, but with one requirement.',
      'Mapping: `<T extends Something>` accepts any type `T`, as long as it has at least what `Something` requires.',
      '# What it is',
      'A generic constraint limits which types can be used for a type parameter: `<T extends Shape>` means "`T` must be assignable to `Shape`".',
      'Without a constraint, `T` could be anything, so inside the function you cannot access any property on it (it behaves like `unknown`).',
      'With a constraint, you can safely use the members the constraint guarantees.',
      'The constraint is a minimum requirement: `T` can still be a more specific type with extra properties, and that specific type is preserved.',
      'Common constraints:',
      '  `<T extends { length: number }>` — anything with a length (strings, arrays).',
      '  `<T extends object>` — any non-primitive.',
      '  `<K extends keyof T>` — `K` must be one of the keys of `T`.',
      '  `<T extends string>` — any string or string literal.',
      '# How it works',
      'At a call site, TS infers `T` from the argument and then checks it against the constraint.',
      'If the argument does not satisfy the constraint, the call is a compile error.',
      'Inside the function, `T` is known to have the constraint members, so `x.length` compiles.',
      'The return type keeps the exact `T`, so callers do not lose information.',
      '`keyof T` gives the union of keys of `T`; `T[K]` (indexed access) gives the type of the property `K`.',
      '# Example walkthrough',
      '`longest("abc", "de")` → `T = string` (has `length`), returns `"abc"`.',
      '`longest([1, 2], [3])` → `T = number[]`, returns `[1, 2]`.',
      '`longest(10, 20)` is a compile error: numbers have no `length`.',
      '`getProp(user, "name")` → `K = "name"`, returns `T["name"]` = `string`; it prints `Asha`.',
      '`getProp(user, "nope")` would be a compile error because `"nope"` is not a key of `user`.',
      '# Why it matters / when to use',
      'Repository or service helpers: `function findById<T extends { id: string }>(items: T[], id: string): T | undefined`.',
      'Type-safe property access: `pluck(rows, "email")`, sorting by a key, building lookups.',
      'Middleware and plugins that require a minimum shape but return the full type.',
      '# Common mistakes',
      'Using the constraint type directly as the parameter (`(x: Shape)`) when you need to return the specific type — then the extra properties are lost.',
      'Forgetting the constraint and getting "Property does not exist on type T".',
      'Over-constraining (`T extends User`) when only one field (`{ id: string }`) is needed.',
      '# Say this in the interview',
      'You constrain a type parameter with `extends`, like `<T extends { length: number }>`, so `T` must be assignable to that shape. That lets me use those members inside while still returning the exact type the caller passed. A very common pattern is `<T, K extends keyof T>` for type-safe property access that returns `T[K]`.',
      'Follow-up: What is `T` inside a function without a constraint?',
      '  Effectively `unknown` — you can pass it around, but cannot access its properties.',
    ],
    code: `// Constraint: T must have a numeric length
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
console.log(longest("abc", "de"));      // → abc       (T = string)
console.log(longest([1, 2], [3]));      // → [ 1, 2 ]  (T = number[])
// longest(10, 20);                     // error: number has no 'length'

// K must be a key of T; return type is the property type
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { id: 1, name: "Asha", admin: false };
const name = getProp(user, "name");     // string
const admin = getProp(user, "admin");   // boolean
console.log(name, admin);               // → Asha false
// getProp(user, "nope");               // error: not a key of user

// Minimum shape, full type preserved
function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find(i => i.id === id);
}
const found = findById([user], 1);      // type is typeof user, not { id: number }
console.log(found?.name);               // → Asha
`,
  },
  {
    id: 'keyof-operator',
    group: 'Generics',
    stars: 5,
    difficulty: 'Easy',
    q: 'What does `keyof` do?',
    a: [
      '# ELI5',
      'A form has labelled boxes: "name", "age", "email". `keyof` hands you the list of labels, not what is written in the boxes.',
      'Mapping: `keyof T` produces the names of the properties of type `T` as a type.',
      '# What it is',
      '`keyof` is a type operator: `keyof T` produces a union of the property names (keys) of `T` as literal types.',
      'Example: `keyof { a: number; b: string }` is `"a" | "b"`.',
      'It works on types, not values. For a runtime object, combine it with `typeof`: `keyof typeof config`.',
      'With an index signature `{ [k: string]: X }`, `keyof` is `string | number` (because JS converts number keys to strings, `obj[1]` is allowed).',
      'For arrays, `keyof` includes `number` plus all array method names (`"length"`, `"push"`, ...), so it is rarely what you want.',
      'It is the foundation for mapped types (`{ [K in keyof T]: ... }`) and type-safe property access helpers.',
      '# How it works',
      'The compiler collects the known public property names of `T` (including optional ones).',
      'It returns them as a union of string literal types (or number/symbol literals for those keys).',
      'Used as a constraint, `K extends keyof T` restricts a parameter to valid keys only.',
      'Used with indexed access, `T[keyof T]` gives the union of all property value types.',
      'Note: at runtime `Object.keys(obj)` returns `string[]`, not `(keyof T)[]`, because objects can have extra keys at runtime (structural typing).',
      '# Example walkthrough',
      '`UserKey` is `"id" | "name" | "email"`.',
      '`printField(user, "email")` is allowed and prints `a@x.io`; `"phone"` is rejected at compile time.',
      '`ConfigKey` is derived from a runtime object with `keyof typeof config`, giving `"port" | "host"`.',
      '`Values` is `T[keyof T]` = `number | string`.',
      'The final loop uses `Object.keys(...) as ConfigKey[]` because `Object.keys` is typed as `string[]`.',
      '# Why it matters / when to use',
      'Sorting or filtering by a column name: `sortBy(users, "createdAt")` with autocomplete and typo protection.',
      'Building typed update functions: `setField<K extends keyof User>(key: K, value: User[K])`.',
      'Deriving key unions from config or translation objects instead of repeating them.',
      '# Common mistakes',
      'Writing `keyof config` (a value) instead of `keyof typeof config`.',
      'Expecting `Object.keys(obj)` to return `(keyof T)[]` — it returns `string[]` by design.',
      'Forgetting that `keyof` an index-signature type includes `number`.',
      '# Say this in the interview',
      '`keyof T` produces a union of the property names of `T` as literal types, so `keyof { a: 1; b: 2 }` is `"a" | "b"`. Combined with generics, as in `K extends keyof T`, it gives type-safe property access, and with `typeof` it derives key unions from runtime objects. It is the foundation of mapped types.',
      'Follow-up: Why is `Object.keys` typed as `string[]`?',
      '  Because objects can have extra properties at runtime that the type does not mention, so claiming `(keyof T)[]` would be unsafe.',
    ],
    code: `type User = { id: number; name: string; email?: string };
type UserKey = keyof User;           // "id" | "name" | "email"

function printField<T, K extends keyof T>(obj: T, key: K) {
  console.log(String(key) + " = " + String(obj[key]));
}
const user: User = { id: 1, name: "Asha", email: "a@x.io" };
printField(user, "email");           // → email = a@x.io
// printField(user, "phone");        // error: not a key of User

// keyof + typeof on a runtime object
const config = { port: 3000, host: "localhost" };
type ConfigKey = keyof typeof config; // "port" | "host"
type Values = (typeof config)[keyof typeof config]; // number | string

// Object.keys returns string[], so we assert the key type here
for (const k of Object.keys(config) as ConfigKey[]) {
  console.log(k, config[k]);         // → port 3000, then host localhost
}

// Index signature: keyof gives string | number
type Dict = { [k: string]: boolean };
type DictKey = keyof Dict;           // string | number
`,
  },
  {
    id: 'typeof-type-operator',
    group: 'Generics',
    stars: 4,
    difficulty: 'Easy',
    q: 'What does `typeof` do in a type position?',
    a: [
      '# ELI5',
      'Instead of drawing a blueprint for a house, you point at an existing house and say "make the blueprint from that one".',
      'Mapping: `typeof value` in a type position takes an existing variable and gives you its TypeScript type, so you do not have to write the type by hand.',
      '# What it is',
      'TypeScript has two different `typeof`s depending on where you write it:',
      '  In an expression (runtime JS): `typeof x` returns a string like `"object"` or `"number"`.',
      '  In a type position (after `:` or in a `type` alias): `typeof x` returns the static TS type of the variable `x`.',
      'A type position is anywhere TS expects a type, e.g. `let a: HERE`, `type T = HERE`, or inside generic angle brackets.',
      'It only works on identifiers and property accesses (`typeof config`, `typeof config.db`), not on arbitrary expressions or function calls.',
      'It lets values be the single source of truth, with types derived from them.',
      '# How it works',
      'The compiler already knows the inferred type of every variable; `typeof x` simply refers to it.',
      'It is commonly chained with other type operators:',
      '  `keyof typeof obj` — the keys of a runtime object.',
      '  `ReturnType<typeof fn>` — the return type of a function.',
      '  `(typeof arr)[number]` — the element type of an array (works great with `as const`).',
      '  `InstanceType<typeof MyClass>` — the instance type of a class.',
      'Combining with `as const` keeps literal types, which makes derived types precise.',
      '# Example walkthrough',
      '`Config` is `typeof defaultConfig`, so it is `{ port: number; db: { host: string } }` without writing it.',
      '`override` uses `Partial<Config>` built from that derived type.',
      '`console.log(typeof defaultConfig)` is the runtime `typeof` and prints `object`.',
      '`Made` is `ReturnType<typeof makeUser>`, i.e. `{ id: number; role: string }`.',
      '`Role` uses `(typeof ROLES)[number]` to get `"admin" | "user"`.',
      '# Why it matters / when to use',
      'Derive types from default configs, constants, enums-as-objects, and factory functions — change the value and the type updates automatically.',
      'Type things that libraries return but do not export a named type for.',
      '# Common mistakes',
      'Mixing up the two `typeof`s: `type T = typeof x === "string"` is invalid.',
      'Trying `typeof someFunction()` — calls are not allowed; use `ReturnType<typeof someFunction>`.',
      'Forgetting `as const`, so derived types are widened (`string` instead of `"admin" | "user"`).',
      '# Say this in the interview',
      'In a type position, `typeof value` gives the TypeScript type of an existing variable, unlike the runtime `typeof` which returns a string like "object". It lets me derive types from values instead of duplicating them, often chained as `keyof typeof obj`, `ReturnType<typeof fn>` or `(typeof arr)[number]` with `as const` arrays.',
      'Follow-up: How do you get the type of a class instance from the class value?',
      '  `InstanceType<typeof MyClass>`, or simply use the class name `MyClass` as a type.',
    ],
    code: `const defaultConfig = {
  port: 3000,
  db: { host: "localhost" },
};

// Type position: get the TS type of the variable
type Config = typeof defaultConfig;  // { port: number; db: { host: string } }

function override(patch: Partial<Config>): Config {
  return { ...defaultConfig, ...patch };
}
console.log(override({ port: 8080 }).port); // → 8080

// Expression position: the JS runtime typeof
console.log(typeof defaultConfig);   // → object

// Chained with utility types
function makeUser(id: number) { return { id, role: "user" }; }
type Made = ReturnType<typeof makeUser>; // { id: number; role: string }
const u: Made = makeUser(1);
console.log(u);                       // → { id: 1, role: 'user' }

// With as const: element type of an array
const ROLES = ["admin", "user"] as const;
type Role = (typeof ROLES)[number];   // "admin" | "user"
const r: Role = "admin";
console.log(r);                       // → admin
`,
  },
  {
    id: 'indexed-access-types',
    group: 'Generics',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are indexed access types (`T[K]`)?',
    a: [
      '# ELI5',
      'You have a filing cabinet labelled "User". You open the drawer labelled "address" and look at what kind of thing is stored there.',
      'Mapping: `User["address"]` is a type that means "whatever type lives in the address drawer of User".',
      '# What it is',
      'An indexed access type `T[K]` looks up the type of property `K` inside type `T`, just like `obj[key]` looks up a value.',
      '`User["id"]` is the type of the `id` property, e.g. `number`.',
      'With a union of keys: `User["id" | "name"]` gives `number | string`.',
      'With `keyof`: `T[keyof T]` gives the union of all property types.',
      'With arrays and tuples: `T[number]` gives the element type (any numeric index).',
      'Nested: `User["address"]["city"]`.',
      'Note: you must use bracket syntax with a type; `User.id` is not valid in type positions.',
      '# How it works',
      'The compiler finds the property `K` on `T` and returns its declared type.',
      'If `K` is not a valid key of `T`, it is a compile error.',
      'In generics, `T[K]` with `K extends keyof T` stays linked to the specific key chosen by the caller.',
      '  So `get(user, "id")` returns `number` and `get(user, "name")` returns `string` from one function.',
      'Optional properties include `undefined` in the result (`User["email"]` is `string | undefined`).',
      '# Example walkthrough',
      '`Id` is `number`, `Tag` is `string` (`User["tags"]` is `string[]`, then `[number]` takes the element).',
      '`City` is a nested lookup: `string`.',
      '`IdOrEmail` is `number | string | undefined` (email is optional, so `undefined` is included).',
      '`Status` comes from an array of objects: `(typeof orders)[number]["status"]` gives the union of status literals.',
      '`setField(user, "name", "Ravi")` works; passing a number for `name` would be an error because `value: T[K]`.',
      '# Why it matters / when to use',
      'Reusing a sub-type from a big generated type (e.g. a Prisma model or OpenAPI type) without redeclaring it.',
      'Typed setters, getters and event emitters where the value type depends on the key.',
      'Extracting element types from arrays returned by libraries.',
      '# Common mistakes',
      'Writing `User.id` instead of `User["id"]` in a type.',
      'Using a variable: `const k = "id"; type X = User[k]` is an error; you need `User[typeof k]`.',
      'Forgetting that optional properties add `undefined` to the result.',
      '# Say this in the interview',
      'An indexed access type `T[K]` gets the type of property `K` on `T`, like `User["id"]`. It accepts unions of keys, `T[number]` gives the element type of an array, and with generics `K extends keyof T`, `T[K]` links the return or value type to the specific key the caller passed. I use it to reuse parts of large types instead of redeclaring them.',
      'Follow-up: How do you get the element type of an array type?',
      '  `ArrayType[number]`, e.g. `string[][number]` is `string`.',
    ],
    code: `type User = {
  id: number;
  tags: string[];
  address: { city: string; zip: string };
  email?: string;
};

type Id = User["id"];                    // number
type Tag = User["tags"][number];         // string
type City = User["address"]["city"];     // string
type IdOrEmail = User["id" | "email"];    // number | string | undefined

// Element + property of an array of objects
const orders = [
  { id: 1, status: "paid" },
  { id: 2, status: "pending" },
] as const;
type Status = (typeof orders)[number]["status"]; // "paid" | "pending"

// Value type depends on the key chosen
function setField<T, K extends keyof T>(obj: T, key: K, value: T[K]): void {
  obj[key] = value;
}
const user: User = { id: 1, tags: ["new"], address: { city: "Pune", zip: "411001" } };
setField(user, "id", 2);
// setField(user, "id", "2");            // error: string not assignable to number
setField(user, "tags", ["vip"]);
console.log(user.id, user.tags);         // → 2 [ 'vip' ]

const s: Status = "paid";
console.log(s);                          // → paid
`,
  },
  {
    id: 'generic-defaults',
    group: 'Generics',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are default type parameters?',
    a: [
      '# ELI5',
      'At a sandwich shop, if you do not say which bread you want, they use white bread by default — but you can always ask for brown.',
      'Mapping: a default type parameter is the type TypeScript uses when you do not specify one and it cannot work it out.',
      '# What it is',
      'Generic type parameters can have defaults, written with `=`: `interface ApiResponse<T = unknown> { data: T }`.',
      'The default is used when the type argument is not provided explicitly AND cannot be inferred.',
      'Parameters with defaults must come after required ones: `<T, E = Error>` is fine, `<T = string, E>` is an error.',
      'Defaults can be combined with constraints: `<T extends object = Record<string, unknown>>`; the default must satisfy the constraint.',
      'A default can refer to earlier parameters: `<T, R = T[]>`.',
      '# How it works',
      'When you write `ApiResponse` without `<...>`, TS substitutes the default: `ApiResponse<unknown>`.',
      'When you write `ApiResponse<User>`, the default is ignored.',
      'For generic functions, inference usually wins: the default only applies when there is nothing to infer from.',
      '  Example: `createStore()` with no arguments uses the default; `createStore({ count: 0 })` infers from the argument.',
      'Many library types use defaults, e.g. Express `Request<P = ParamsDictionary, ResBody = any, ReqBody = any, ...>`.',
      '# Example walkthrough',
      '`ApiResponse` with no argument has `data: unknown`, so you must narrow before using it.',
      '`ApiResponse<User>` has `data: User`, so `res.data.name` prints `Asha`.',
      '`Result<number>` uses the default `E = Error`; `Result<number, string>` overrides it.',
      '`createList()` with no argument uses the default `T = string` and `push("a")` works.',
      '# Why it matters / when to use',
      'Making common cases short (`Result<T>`) while keeping flexibility (`Result<T, MyError>`).',
      'Library and SDK design where most users want a sensible default type.',
      'Typing Express request bodies: `Request<{}, {}, CreateUserBody>` overrides only what you need.',
      '# Common mistakes',
      'Putting a defaulted parameter before a required one.',
      'Using `any` as a default, which silently disables checks for callers who forget the argument; prefer `unknown`.',
      'Expecting the default to override inference — inference from arguments wins.',
      '# Say this in the interview',
      'Type parameters can have defaults like `<T = unknown>`, used when the type argument is not passed and cannot be inferred. Defaulted parameters must come after required ones and must satisfy any constraint. I use them to keep common cases concise, for example `Result<T, E = Error>`, and prefer `unknown` over `any` as a default.',
      'Follow-up: Does a default override inference?',
      '  No; if TS can infer the type from arguments, it uses the inferred type.',
    ],
    code: `interface ApiResponse<T = unknown> {
  status: number;
  data: T;
}

const raw: ApiResponse = { status: 200, data: { name: "Asha" } }; // data: unknown
// raw.data.name;                       // error: data is unknown

type User = { name: string };
const res: ApiResponse<User> = { status: 200, data: { name: "Asha" } };
console.log(res.data.name);             // → Asha

// Default for the error type
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
const r1: Result<number> = { ok: false, error: new Error("boom") };
const r2: Result<number, string> = { ok: false, error: "boom" };
if (!r1.ok) console.log(r1.error.message); // → boom
if (!r2.ok) console.log(r2.error);         // → boom

// Default used when there is nothing to infer from
function createList<T = string>(...initial: T[]): T[] {
  return [...initial];
}
const list = createList();              // T = string (default)
list.push("a");
const nums = createList(1, 2);          // T = number (inferred, default ignored)
console.log(list, nums);                // → [ 'a' ] [ 1, 2 ]
`,
  },
  {
    id: 'const-type-parameters',
    group: 'Generics',
    stars: 3,
    difficulty: 'Hard',
    q: 'What are `const` type parameters (TS 5.0)?',
    a: [
      '# ELI5',
      'Normally, when you hand a librarian a list of book titles, they file it as "some titles". With a special stamp, they file it as "exactly these titles, in this order, never to change".',
      'Mapping: a `const` type parameter is that stamp — the function asks TypeScript to infer the exact literal types of what callers pass, as if they had written `as const`.',
      '# What it is',
      'A `const` type parameter is written `<const T>` (added in TS 5.0).',
      'It changes how `T` is inferred: literals stay literals (`"/home"` not `string`), arrays become readonly tuples, and object properties become readonly literals.',
      'Without it, callers would need to write `as const` themselves at every call site to get precise types.',
      'It only affects literals written directly in the call; if a caller passes a variable, that variable already has its own (possibly widened) type.',
      'For arrays, pair it with a `readonly` constraint (`T extends readonly unknown[]`); with a mutable `T extends unknown[]` constraint, TS falls back to a mutable, wider inference.',
      '# How it works',
      'Normal inference: `plain(["/home", "/about"])` infers `T = string[]`.',
      'With `<const T extends readonly string[]>`, TS infers `T = readonly ["/home", "/about"]`.',
      'The return type (if it uses `T`) is just as precise, so callers can derive unions like `(typeof r)[number]`.',
      'It is purely a type-level feature; nothing changes at runtime and the array is not frozen.',
      '# Example walkthrough',
      '`plain(["/home", "/about"])` returns `string[]`, so any string would be accepted as a route.',
      '`routes(["/home", "/about"])` returns `readonly ["/home", "/about"]`, so `Route` is `"/home" | "/about"`.',
      '`go("/about")` compiles and prints `navigating to /about`; `go("/admin")` is an error.',
      '`defineConfig({ env: "prod" })` keeps `env` as the literal `"prod"`.',
      '`fromVar` shows the limitation: the variable `paths` was already widened to `string[]` before the call.',
      '# Why it matters / when to use',
      'Library-style helpers: route builders, event-name registries, schema builders, feature-flag definitions.',
      'Anywhere you want callers to get precise literal types without remembering `as const`.',
      '# Common mistakes',
      'Using a mutable array constraint (`T extends string[]`) and wondering why the tuple is not inferred.',
      'Expecting it to work on variables passed in; only inline literals benefit.',
      'Expecting runtime immutability; use `Object.freeze` if needed.',
      '# Say this in the interview',
      'A `const` type parameter, added in TypeScript 5.0, makes inference behave as if the caller had written `as const`: literals stay literal and arrays become readonly tuples. It lets helper functions return precise types without burdening callers. It only applies to literals written in the call, and for arrays the constraint should be `readonly`.',
      'Follow-up: How did people do this before 5.0?',
      '  Callers wrote `as const`, or libraries used tricks like `<T extends string>(...args: T[])` to force literal inference.',
    ],
    code: `// Without const: widened
function plain<T extends readonly string[]>(r: T) { return r; }
const p = plain(["/home", "/about"]);        // string[]

// With const: exact readonly tuple
function routes<const T extends readonly string[]>(r: T) { return r; }
const r = routes(["/home", "/about"]);       // readonly ["/home", "/about"]
type Route = (typeof r)[number];             // "/home" | "/about"

function go(to: Route) {
  console.log("navigating to " + to);
}
go("/about");                                // → navigating to /about
// go("/admin");                             // error: not a known route

// Works for objects too
function defineConfig<const C extends { env: string }>(c: C) { return c; }
const cfg = defineConfig({ env: "prod" });   // { readonly env: "prod" }
console.log(cfg.env);                        // → prod

// Limitation: variables are already widened
const paths = ["/a", "/b"];                  // string[]
const fromVar = routes(paths);               // string[] (no literal info)
console.log(p.length, fromVar.length);       // → 2 2
`,
  },
  {
    id: 'generic-interfaces-and-classes',
    group: 'Generics',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you write generic interfaces, types and classes?',
    a: [
      '# ELI5',
      'A storage company sells the same kind of locker to everyone. One customer stores shoes, another stores books. Each locker is labelled with what it holds.',
      'Mapping: a generic class or interface is the locker design; `Stack<number>` or `Stack<string>` is a locker labelled with what it holds.',
      '# What it is',
      'Interfaces, type aliases and classes can all take type parameters, written in angle brackets after the name.',
      'Generic interface: `interface Box<T> { value: T }`.',
      'Generic type alias: `type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E }`.',
      'Generic class: `class Stack<T> { private items: T[] = []; push(x: T) {...} }`.',
      'Multiple type parameters are common: `Map<K, V>`, `Result<T, E>`, `Repository<T, ID>`.',
      'For classes, the type parameter belongs to each instance, so it cannot be used in `static` members (statics belong to the class, which is shared across all `T`s).',
      '# How it works',
      'For interfaces and type aliases you must supply the type argument when using them (unless there is a default): `Box<number>`.',
      'For classes, TS can infer `T` from constructor arguments: `new Box(5)` gives `Box<number>`.',
      '  With no constructor arguments, pass it explicitly: `new Stack<number>()`; otherwise `T` becomes `unknown`.',
      'Methods can use the class `T` and can also declare their own extra type parameters: `map<U>(fn: (x: T) => U): Stack<U>`.',
      'Classes can `implements` a generic interface: `class MemoryRepo<T> implements Repository<T>`.',
      '# Example walkthrough',
      '`Stack<number>` only accepts numbers; `push("x")` would be an error; `pop()` returns `number | undefined` and prints `2`.',
      '`map` converts the stack to `Stack<string>` using its own type parameter `U`, so `strs.pop()` prints `#2`.',
      '`Repository<T>` is a generic interface; `MemoryRepo<T extends { id: string }>` implements it for any entity with an `id`.',
      '`users.save(...)` then `users.findById("u1")` prints `Asha`.',
      '# Why it matters / when to use',
      'Repository and service layers: `Repository<User>`, `Repository<Order>` without duplicating code.',
      'Caches (`LruCache<K, V>`), queues (`JobQueue<Payload>`), event emitters typed by an event map.',
      'API response wrappers: `Paginated<T> = { items: T[]; nextCursor?: string }`.',
      '# Common mistakes',
      'Creating `new Stack()` without a type argument and ending up with `Stack<unknown>`.',
      'Trying to use the class type parameter in a static method.',
      'Writing `async function get<T>(url): Promise<T>` and believing the response is validated — it is just a cast.',
      '# Say this in the interview',
      'You add type parameters after the name: `interface Box<T>`, `type Result<T, E = Error>`, `class Stack<T>`. Classes can infer `T` from constructor arguments, otherwise you pass it explicitly, and methods can add their own type parameters. The class type parameter is per instance, so it cannot be used in static members. I use this for repositories, caches and response wrappers.',
      'Follow-up: Why can static members not use `T`?',
      '  Statics live on the class itself, which is shared by all instances regardless of their `T`.',
    ],
    code: `class Stack<T> {
  private items: T[] = [];
  push(item: T): void { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
  // A method with its own extra type parameter U
  map<U>(fn: (item: T) => U): Stack<U> {
    const out = new Stack<U>();
    this.items.forEach(i => out.push(fn(i)));
    return out;
  }
}

const nums = new Stack<number>();
nums.push(1);
nums.push(2);
// nums.push("x");                    // error: string is not a number
const strs = nums.map(n => "#" + n);  // Stack<string>
console.log(nums.pop(), strs.pop());  // → 2 #2

// Generic interface + class implementing it
interface Repository<T> {
  save(item: T): void;
  findById(id: string): T | undefined;
}
class MemoryRepo<T extends { id: string }> implements Repository<T> {
  private rows = new Map<string, T>();
  save(item: T) { this.rows.set(item.id, item); }
  findById(id: string) { return this.rows.get(id); }
}

type User = { id: string; name: string };
const users = new MemoryRepo<User>();
users.save({ id: "u1", name: "Asha" });
console.log(users.findById("u1")?.name); // → Asha
`,
  },
  {
    id: 'noinfer-utility',
    group: 'Generics',
    stars: 2,
    difficulty: 'Hard',
    q: 'What is `NoInfer<T>` (TS 5.4)?',
    a: [
      '# ELI5',
      'A teacher asks the class to vote on a list of games, then asks one student to pick their favourite from that list.',
      'Without a rule, the student could shout out a brand new game and the teacher would just add it to the list.',
      'Mapping: `NoInfer` is the rule that says "the favourite must come from the list; do not use it to grow the list".',
      '# What it is',
      '`NoInfer<T>` is a built-in utility type added in TypeScript 5.4.',
      'An inference site is a place in a function signature where TS looks at the argument to work out what `T` is.',
      'Normally every parameter that mentions `T` is an inference site, so TS combines all of them to choose `T`.',
      '`NoInfer<T>` marks a position as NOT an inference site: TS ignores that argument when choosing `T`, then checks it against the `T` chosen from the other arguments.',
      'It does not change the type itself — `NoInfer<string>` is still `string` — it only affects inference.',
      '# How it works',
      'Without `NoInfer`: `pickLoose(["small", "large"], "medium")` — TS sees candidates from both arguments, so `C` becomes `"small" | "large" | "medium"` and no error is reported.',
      'With `def: NoInfer<C>`:',
      '  TS infers `C` only from `opts`, giving `"small" | "large"`.',
      '  It then checks `"medium"` against `"small" | "large"` and reports an error.',
      'Before TS 5.4, people used tricks like an extra type parameter `<C extends string, D extends C>` to get the same effect.',
      '# Example walkthrough',
      '`pick(["small", "large"], "large")` is valid and prints `large`.',
      '`pick(["small", "large"], "medium")` is a compile error because the default must be one of the options.',
      '`pickLoose` has no `NoInfer`, so the same bad call compiles, and `C` silently widens to include `"medium"`; it prints `medium`.',
      '`createFSM` shows a real pattern: the initial state must be one of the declared states; after `go("open")` it prints `open`.',
      '# Why it matters / when to use',
      'Defaults that must be one of the provided options (select inputs, feature flag variants, state machines).',
      'APIs where one argument is the source of truth and others must conform to it.',
      'It is niche; most code never needs it, but library authors use it to give better errors.',
      '# Common mistakes',
      'Expecting `NoInfer` to change the type at runtime or in the result — it only affects inference.',
      'Using it on an older TypeScript version (below 5.4), where it does not exist.',
      '# Say this in the interview',
      '`NoInfer<T>`, added in TypeScript 5.4, marks a parameter position so it is not used to infer `T`. TypeScript infers `T` from the other arguments and then checks that position against it. The classic use is a default value that must be one of the provided options, instead of silently widening the options to include it.',
      'Follow-up: How did you do this before 5.4?',
      '  With a second type parameter constrained by the first, like `<C extends string, D extends C>(opts: C[], def: D)`.',
    ],
    code: `// With NoInfer: C is inferred only from opts
function pick<C extends string>(opts: C[], def: NoInfer<C>): C {
  return opts.includes(def) ? def : opts[0];
}
console.log(pick(["small", "large"], "large")); // → large
// pick(["small", "large"], "medium");
// error: '"medium"' is not assignable to '"small" | "large"'

// Without NoInfer: "medium" silently widens C
function pickLoose<C extends string>(opts: C[], def: C): C {
  return def;
}
const loose = pickLoose(["small", "large"], "medium"); // C = "small" | "large" | "medium"
console.log(loose);                                    // → medium (no error!)

// Real pattern: initial state must be one of the states
function createFSM<S extends string>(states: S[], initial: NoInfer<S>) {
  let current: S = initial;
  return {
    get: () => current,
    go: (next: S) => { current = next; },
  };
}
const door = createFSM(["open", "closed"], "closed");
door.go("open");
console.log(door.get());                               // → open
`,
  },
  {
    id: 'variance-annotations',
    group: 'Generics',
    stars: 1,
    difficulty: 'Hard',
    q: 'What are variance annotations (`in` / `out`) on type parameters?',
    a: [
      '# ELI5',
      'A fruit SHOP that sells apples can be used wherever someone wants "a shop that sells fruit" — you only take things out.',
      'A fruit BIN that accepts any fruit can be used wherever someone needs "a bin for apples" — you only put things in.',
      'A basket you both take from and put into must be exactly the right kind: an apple basket is not safe as a fruit basket, because someone might put a banana in.',
      'Mapping: `out` = only produces T (shop), `in` = only consumes T (bin), `in out` = both (basket).',
      '# What it is',
      'Variance describes how subtyping of a type parameter affects subtyping of the generic type.',
      'Subtype: `Dog` is a subtype of `Animal` if a `Dog` can be used wherever an `Animal` is expected.',
      'Covariant (`out T`): `Box<Dog>` is assignable to `Box<Animal>` — the same direction. Happens when `T` is only produced (returned or read).',
      'Contravariant (`in T`): `Handler<Animal>` is assignable to `Handler<Dog>` — the reverse direction. Happens when `T` is only consumed (a parameter).',
      'Invariant (`in out T`): neither direction is allowed. Happens when `T` is both read and written.',
      'Variance annotations, added in TS 4.7, let you write `out`, `in` or `in out` on type parameters of type aliases, interfaces and classes.',
      '# How it works',
      'Normally TS infers variance by structurally analysing how `T` is used — this can be slow for very large or recursive types.',
      'With an annotation, TS uses your declared variance directly (faster) and checks that it matches how `T` is actually used.',
      'If you annotate `out T` but use `T` as a function parameter, TS reports an error.',
      'Note: methods declared with method syntax (`handle(x: T): void`) are checked "bivariantly" for historical reasons; function-typed properties (`handle: (x: T) => void`) are checked strictly under `strictFunctionTypes`.',
      '# Example walkthrough',
      '`Producer<out T>` only returns `T`, so `Producer<Dog>` can be used as `Producer<Animal>` — a dog producer always produces animals; it prints `Rex`.',
      '`Consumer<in T>` only takes `T`, so `Consumer<Animal>` can be used as `Consumer<Dog>` — something that handles any animal can handle a dog; it prints `animal: Rex`.',
      'Assigning `Consumer<Dog>` to `Consumer<Animal>` is an error: it might receive a cat.',
      'The commented `Wrong<out T>` shows TS rejecting an annotation that does not match usage.',
      '# Why it matters / when to use',
      'Rarely needed in application code; mostly for library authors working with complex generic types.',
      'Can speed up type checking in huge codebases and documents intent clearly.',
      'Understanding variance explains assignability errors with callbacks and event handlers.',
      '# Common mistakes',
      'Adding annotations that contradict actual usage; TS will report them.',
      'Assuming arrays are safely covariant — TS treats `Dog[]` as assignable to `Animal[]` for convenience, even though pushing a `Cat` is then possible (a known unsound spot).',
      '# Say this in the interview',
      'Variance annotations, added in TypeScript 4.7, declare how a type parameter behaves: `out T` is covariant, meaning `T` is only produced, so `Box<Dog>` fits `Box<Animal>`; `in T` is contravariant, only consumed, which reverses assignability; and `in out T` is invariant. TypeScript usually infers variance, so these mainly help performance and document intent in complex library types.',
      'Follow-up: Why are function parameters contravariant?',
      '  A function that accepts any `Animal` can safely be used where a function accepting `Dog` is expected, but not the other way round.',
    ],
    code: `interface Animal { name: string }
interface Dog extends Animal { bark(): void }

// out: T is only produced -> covariant
interface Producer<out T> { get: () => T }
// in: T is only consumed -> contravariant
interface Consumer<in T> { handle: (x: T) => void }

const rex: Dog = { name: "Rex", bark() {} };

const dogProducer: Producer<Dog> = { get: () => rex };
const animalProducer: Producer<Animal> = dogProducer; // ok: Dog -> Animal
console.log(animalProducer.get().name);               // → Rex

const animalConsumer: Consumer<Animal> = {
  handle: (a) => console.log("animal: " + a.name),
};
const dogConsumer: Consumer<Dog> = animalConsumer;    // ok: reversed direction
dogConsumer.handle(rex);                              // → animal: Rex

// const bad: Consumer<Animal> = { handle: (d: Dog) => d.bark() };
// error: a Consumer<Animal> might be given a non-Dog animal

// interface Wrong<out T> { set: (x: T) => void }
// error: variance annotation 'out' does not match usage
`,
  },

  // ─────────────────────────── Utility Types ───────────────────────────
  {
    id: 'partial-required-readonly',
    group: 'Utility Types',
    stars: 5,
    difficulty: 'Easy',
    q: 'What do `Partial`, `Required` and `Readonly` do?',
    a: [
      '# ELI5',
      'Imagine a form with fields name, email and age.',
      '`Partial` is the "edit profile" version where every field is optional — fill in only what you want to change.',
      '`Required` is the "final submission" version where every field must be filled in.',
      '`Readonly` is the "printed receipt" version — you can read everything but change nothing.',
      'Mapping: these utility types create a new version of an existing type with all properties optional, required or readonly.',
      '# What it is',
      'Utility types are generic types built into TypeScript that transform other types. They are available everywhere without importing.',
      '`Partial<T>` — every property of `T` becomes optional (`?`).',
      '`Required<T>` — every property becomes required (removes `?`).',
      '`Readonly<T>` — every property becomes `readonly`.',
      'All three are shallow — they only affect top-level properties, not nested objects.',
      'They are implemented as mapped types — types that loop over the keys of another type: `Partial<T> = { [K in keyof T]?: T[K] }`.',
      '# How it works',
      'TS takes each key `K` in `keyof T`:',
      '  `Partial` adds the `?` modifier.',
      '  `Required` uses `-?` to remove the `?` modifier.',
      '  `Readonly` adds the `readonly` modifier.',
      'The value type `T[K]` stays the same.',
      'The original type is unchanged; you get a new type.',
      '# Example walkthrough',
      '`updateUser(u, { name: "New" })` is allowed because `Partial<Omit<User, "id">>` makes the non-id fields optional; it prints `New`.',
      '`Required<Settings>` forces both `theme` and `fontSize`, so `withDefaults` must fill every value; it prints the full settings.',
      '`frozen.name = "x"` is a compile error because of `Readonly<User>`.',
      '`frozen.address.city = "Goa"` compiles and prints `Goa` — a reminder that these utilities are shallow.',
      'The last three lines show how each utility is written as a mapped type.',
      '# Why it matters / when to use',
      '`Partial`: PATCH endpoints, update DTOs, test factory overrides (`makeUser(overrides: Partial<User>)`).',
      '`Required`: resolving a config after merging defaults, so the rest of the app never sees `undefined`.',
      '`Readonly`: immutable state, function parameters you promise not to mutate, frozen config.',
      '# Common mistakes',
      'Using `Partial<User>` for a PATCH body and forgetting it also allows changing `id`; use `Partial<Omit<User, "id">>`.',
      'Assuming `Readonly` is deep or enforced at runtime.',
      'Using `Required` on a type with `field: string | undefined` — it removes `?` but keeps the explicit `undefined`.',
      '# Say this in the interview',
      '`Partial<T>` makes every property optional, `Required<T>` makes every property required and `Readonly<T>` makes every property readonly. They are mapped types over `keyof T`, they are shallow, and they only exist at compile time. I use `Partial` for update payloads, `Required` for resolved configs and `Readonly` for immutable data.',
      'Follow-up: How would you make a deep version?',
      '  A recursive mapped type, e.g. `type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }`.',
    ],
    code: `type User = { id: string; name: string; email: string; address: { city: string } };

// Partial: all optional -> perfect for updates
function updateUser(user: User, patch: Partial<Omit<User, "id">>): User {
  return { ...user, ...patch };
}
const u: User = { id: "1", name: "Asha", email: "a@x.io", address: { city: "Pune" } };
console.log(updateUser(u, { name: "New" }).name); // → New

// Required: all mandatory -> resolved config
type Settings = { theme?: "light" | "dark"; fontSize?: number };
function withDefaults(s: Settings): Required<Settings> {
  return { theme: s.theme ?? "light", fontSize: s.fontSize ?? 14 };
}
console.log(withDefaults({ theme: "dark" }));     // → { theme: 'dark', fontSize: 14 }

// Readonly: no reassignment (shallow!)
const frozen: Readonly<User> = u;
// frozen.name = "x";                 // error: read-only property
frozen.address.city = "Goa";          // allowed: nested object not readonly
console.log(frozen.address.city);     // → Goa

// How they are built (mapped types):
type MyPartial<T>  = { [K in keyof T]?: T[K] };
type MyRequired<T> = { [K in keyof T]-?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
`,
  },
  {
    id: 'pick-omit',
    group: 'Utility Types',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are `Pick` and `Omit`?',
    a: [
      '# ELI5',
      'You have a big box of crayons. `Pick` is "give me only the red and blue ones". `Omit` is "give me all of them except the black one".',
      'Mapping: `Pick<T, K>` keeps only the listed properties; `Omit<T, K>` keeps everything except the listed properties.',
      '# What it is',
      '`Pick<T, K>` creates a new object type with only the keys `K` from `T`.',
      '`Omit<T, K>` creates a new object type with all keys of `T` except `K`.',
      '`K` is usually a union of string literals, like `"id" | "name"`.',
      'Comparison row — key checking: `Pick` requires `K extends keyof T`, so typos are errors; `Omit` accepts any key (`K extends keyof any`), so a typo is silently ignored.',
      'Comparison row — when to use: `Pick` when you want a few fields; `Omit` when you want most fields.',
      'Comparison row — unions: neither distributes over unions; `Omit` on a union keeps only the keys common to every member.',
      'A DTO (Data Transfer Object) is a type describing data sent over the network, often a trimmed version of a database model.',
      '# How it works',
      '`Pick<T, K>` is the mapped type `{ [P in K]: T[P] }` — loop over chosen keys, copy their types.',
      '`Omit<T, K>` is `Pick<T, Exclude<keyof T, K>>` — compute the remaining keys, then pick them.',
      '`Exclude<A, B>` removes from union `A` every member assignable to `B`.',
      'Modifiers like `?` and `readonly` are preserved.',
      '# Example walkthrough',
      '`UserPreview = Pick<User, "id" | "name">` has only `id` and `name`; the preview prints `{ id: "1", name: "Asha" }`.',
      '`PublicUser = Omit<User, "passwordHash">` has everything except the hash.',
      '`toPublic` uses destructuring with a rest element to strip the field at runtime too — the type alone does not remove data; it prints `false` for the hash check.',
      '`CreateUserInput = Omit<User, "id" | "createdAt">` models a POST body where the server generates `id` and `createdAt`.',
      '`Omit<User, "pasword">` (typo) compiles without error, showing the `Omit` gotcha.',
      '# Why it matters / when to use',
      'API responses that must never include secrets (`Omit<User, "passwordHash">`).',
      'Create/update DTOs derived from a model, so they stay in sync when the model changes.',
      'Lightweight list views (`Pick<Product, "id" | "title" | "price">`).',
      '# Common mistakes',
      'Assuming `Omit` removes the property from the actual object — types are erased; you must strip it in code too (or the secret still leaks in JSON).',
      'Typos in `Omit` keys going unnoticed; some teams define a strict `StrictOmit<T, K extends keyof T>`.',
      'Using `Omit` on a union type and losing variant-specific fields; use a distributive version: `T extends unknown ? Omit<T, K> : never`.',
      '# Say this in the interview',
      '`Pick<T, K>` builds a type with only the keys `K`, and `Omit<T, K>` builds one with every key except `K`; `Omit` is implemented as `Pick` with `Exclude`d keys. `Pick` checks the keys exist but `Omit` does not, so typos slip through. I use them to derive DTOs like `Omit<User, "passwordHash">`, while remembering the field must also be removed at runtime.',
      'Follow-up: Why does `Omit` on a union lose fields?',
      '  `keyof (A | B)` is only the shared keys, so the result only has those; a distributive conditional type fixes it.',
    ],
    code: `type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

type UserPreview = Pick<User, "id" | "name">;          // { id; name }
type PublicUser = Omit<User, "passwordHash">;          // everything but the hash
type CreateUserInput = Omit<User, "id" | "createdAt">; // POST body

const user: User = {
  id: "1", name: "Asha", email: "a@x.io",
  passwordHash: "xyz", createdAt: new Date(0),
};

const preview: UserPreview = { id: user.id, name: user.name };
console.log(preview);                  // → { id: '1', name: 'Asha' }

// Types are erased: strip the secret at runtime too!
function toPublic(u: User): PublicUser {
  const { passwordHash, ...rest } = u;
  return rest;
}
console.log("passwordHash" in toPublic(user)); // → false

const input: CreateUserInput = { name: "Ravi", email: "r@x.io", passwordHash: "h" };
console.log(Object.keys(input));       // → [ 'name', 'email', 'passwordHash' ]

type Oops = Omit<User, "pasword">;     // typo, but NO error (Omit is loose)
// type Bad = Pick<User, "pasword">;   // error: Pick checks keys
`,
  },
  {
    id: 'record-type',
    group: 'Utility Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is `Record<K, V>`?',
    a: [
      '# ELI5',
      'A school timetable has one slot for every weekday — Monday to Friday — and each slot holds a list of classes. You cannot forget Wednesday.',
      'Mapping: `Record<K, V>` is an object type where the keys are `K` and every value is `V`; with a fixed list of keys, all of them must be present.',
      '# What it is',
      '`Record<K, V>` is a built-in utility type for an object whose keys are of type `K` and whose values are of type `V`.',
      'With a broad key type like `string`: `Record<string, number>` is any dictionary of numbers (same as an index signature `{ [key: string]: number }`).',
      'With a union of literal keys: `Record<"admin" | "user", string[]>` requires exactly those keys — every one must be present.',
      'It is defined as a mapped type: `type Record<K extends keyof any, T> = { [P in K]: T }`.',
      '`keyof any` is `string | number | symbol` — the types allowed as object keys.',
      '# How it works',
      'TS loops over each member of `K` and creates a property of type `V`.',
      'If `K` is a finite union, the result has those exact keys, all required.',
      'If `K` is `string`, the result has an index signature, so any key is allowed.',
      'Adding a new member to the key union (e.g. a new role) makes every `Record` using it fail to compile until updated — great for exhaustiveness.',
      'Combine with `Partial` if not every key is needed: `Partial<Record<Role, string[]>>`.',
      '# Example walkthrough',
      '`perms: Record<Role, string[]>` must have both `admin` and `user`; leaving one out is an error.',
      '`can("user", "write")` checks the list and prints `false`; `can("admin", "write")` prints `true`.',
      '`statusText: Record<HttpStatus, string>` maps every status code to a message; it prints `Not Found`.',
      '`counts: Record<string, number>` is an open dictionary; the word counter prints `{ a: 2, b: 1 }`.',
      '# Why it matters / when to use',
      'Lookup tables that must cover every enum or union member: role permissions, status-to-message maps, feature flags per plan.',
      'Grouping results: `Record<string, Order[]>` keyed by customer ID.',
      'Translation dictionaries keyed by locale.',
      '# Common mistakes',
      'Using `Record<string, V>` and assuming every lookup returns `V` — missing keys return `undefined` at runtime; enable `noUncheckedIndexedAccess` or use `Map`.',
      'Using `Record<string, any>` as a lazy object type; prefer `Record<string, unknown>`.',
      'Forgetting that a literal-union `Record` requires ALL keys; wrap in `Partial` if some are optional.',
      '# Say this in the interview',
      '`Record<K, V>` is a mapped type for an object with keys of type `K` and values of type `V`. With `string` keys it is a dictionary, like an index signature; with a union of literal keys every key is required, which makes it perfect for exhaustive lookup tables such as permissions per role. If a new role is added, the compiler forces me to update the table.',
      'Follow-up: `Record<string, V>` vs `Map<string, V>`?',
      '  `Record` is a plain object (JSON-friendly); `Map` has safer `get` typing, any key type and better performance for frequent adds and deletes.',
    ],
    code: `type Role = "admin" | "user";

const perms: Record<Role, string[]> = {
  admin: ["read", "write", "delete"],
  user: ["read"],
};                                 // missing a role -> compile error

function can(role: Role, action: string): boolean {
  return perms[role].includes(action);
}
console.log(can("user", "write"));  // → false
console.log(can("admin", "write")); // → true

type HttpStatus = 200 | 404 | 500;
const statusText: Record<HttpStatus, string> = {
  200: "OK",
  404: "Not Found",
  500: "Server Error",
};
console.log(statusText[404]);       // → Not Found

// Open dictionary with string keys
const counts: Record<string, number> = {};
for (const w of ["a", "b", "a"]) {
  counts[w] = (counts[w] ?? 0) + 1;
}
console.log(counts);                // → { a: 2, b: 1 }
`,
  },
  {
    id: 'exclude-extract-nonnullable',
    group: 'Utility Types',
    stars: 4,
    difficulty: 'Medium',
    q: 'What do `Exclude`, `Extract` and `NonNullable` do?',
    a: [
      '# ELI5',
      'You have a bag of mixed sweets: chocolates, gummies and mints.',
      '`Exclude` = "take out all the mints". `Extract` = "keep only the chocolates". `NonNullable` = "throw out the empty wrappers".',
      'Mapping: these utilities filter the members of a union type.',
      '# What it is',
      'These utilities work on union members, not on object keys (that is what `Pick` and `Omit` do).',
      '`Exclude<U, X>` — removes from union `U` every member assignable to `X`. `Exclude<"a" | "b" | "c", "a">` is `"b" | "c"`.',
      '`Extract<U, X>` — keeps only members of `U` assignable to `X`. `Extract<string | number | boolean, string | number>` is `string | number`.',
      '`NonNullable<T>` — removes `null` and `undefined`. `NonNullable<string | null | undefined>` is `string`.',
      'They are built with conditional types — types of the form `A extends B ? X : Y`, an "if/else" at the type level.',
      'A distributive conditional type applies the condition to each member of a union separately, then joins the results.',
      '# How it works',
      '`type Exclude<T, U> = T extends U ? never : T`.',
      'Because `T` is a bare type parameter, the condition distributes over the union:',
      '  For `T = "a" | "b" | "c"` and `U = "a"`:',
      '  `"a" extends "a"` → `never`; `"b"` → `"b"`; `"c"` → `"c"`.',
      '  Join: `never | "b" | "c"` = `"b" | "c"` (`never` disappears in a union).',
      '`Extract<T, U> = T extends U ? T : never` — the same logic with branches swapped.',
      '`NonNullable<T> = T & {}` in modern TS (intersecting with `{}` removes `null` and `undefined`).',
      'They also work with object members of a union, e.g. extracting the variant of a discriminated union whose `type` is `"click"`.',
      '# Example walkthrough',
      '`NonAdmin = Exclude<Role, "admin">` is `"editor" | "viewer"`.',
      '`Primitive = Extract<Mixed, string | number>` keeps `string | number` and drops `boolean` and `Date`.',
      '`ClickEvent = Extract<AppEvent, { type: "click" }>` picks the one variant with `type: "click"`, so `x` and `y` are available; it prints `clicked at 3,4`.',
      '`Defined = NonNullable<MaybeName>` is `string`.',
      'At runtime, the `filter` mirrors the type: it prints `[ "editor", "viewer" ]`.',
      '# Why it matters / when to use',
      'Narrowing permission or status unions (`Exclude<Status, "deleted">`).',
      'Picking a specific event or action type from a big discriminated union for a handler.',
      'Cleaning optional types after validation (`NonNullable<Config["dbUrl"]>`).',
      '# Common mistakes',
      'Using `Exclude` on an object type expecting to remove a key — use `Omit` for keys.',
      'Expecting these to work at runtime; they only change types, so you still need code like `filter`.',
      '# Say this in the interview',
      '`Exclude<U, X>` removes union members assignable to `X`, `Extract<U, X>` keeps only those, and `NonNullable<T>` removes null and undefined. They operate on union members, not object keys, and are built from distributive conditional types such as `T extends U ? never : T`. I use `Extract` a lot to pull one variant out of a discriminated union.',
      'Follow-up: What is the difference between `Exclude` and `Omit`?',
      '  `Exclude` filters members of a union; `Omit` removes keys from an object type (and is built using `Exclude` on `keyof T`).',
    ],
    code: `type Role = "admin" | "editor" | "viewer";
type NonAdmin = Exclude<Role, "admin">;            // "editor" | "viewer"

type Mixed = string | number | boolean | Date;
type Primitive = Extract<Mixed, string | number>;  // string | number

type MaybeName = string | null | undefined;
type Defined = NonNullable<MaybeName>;             // string

// Extract one variant of a discriminated union
type AppEvent =
  | { type: "click"; x: number; y: number }
  | { type: "key"; key: string };
type ClickEvent = Extract<AppEvent, { type: "click" }>;

function onClick(e: ClickEvent) {
  console.log("clicked at " + e.x + "," + e.y);
}
onClick({ type: "click", x: 3, y: 4 });            // → clicked at 3,4

// Types do not filter data: mirror the logic at runtime
const roles: Role[] = ["admin", "editor", "viewer"];
const nonAdmins = roles.filter((r): r is NonAdmin => r !== "admin");
console.log(nonAdmins);                            // → [ 'editor', 'viewer' ]

// How Exclude is defined (distributive conditional type)
type MyExclude<T, U> = T extends U ? never : T;
type Check = MyExclude<"a" | "b" | "c", "a">;      // "b" | "c"
`,
  },
  {
    id: 'returntype-parameters',
    group: 'Utility Types',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are `ReturnType` and `Parameters`?',
    a: [
      '# ELI5',
      'You look at a vending machine. `Parameters` tells you what coins it accepts; `ReturnType` tells you what snack comes out.',
      'You do not need the manual — you read it from the machine itself.',
      'Mapping: these utilities read a function type and give you its input types (as a tuple) or its output type.',
      '# What it is',
      '`ReturnType<F>` gives the return type of a function type `F`.',
      '`Parameters<F>` gives the parameter types of `F` as a tuple (a fixed-length array type), e.g. `[id: number, name: string]`.',
      'They take a function TYPE, so for an actual function value you use `typeof`: `ReturnType<typeof createUser>`.',
      'Related utilities: `Awaited<T>` (unwraps a Promise), `ConstructorParameters<C>` and `InstanceType<C>` (for classes).',
      'Both are built with `infer` — a keyword used inside conditional types to capture part of a type into a new type variable.',
      '# How it works',
      '`type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any`.',
      '  TS matches `T` against the pattern "a function returning something" and captures that something as `R`.',
      '`type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never`.',
      '  The captured `P` is the parameter list as a tuple.',
      'For async functions, `ReturnType` gives `Promise<X>`; wrap with `Awaited` to get `X`.',
      'For overloaded functions, both utilities use the last overload signature.',
      '# Example walkthrough',
      '`Made = ReturnType<typeof makeUser>` is `{ id: number; name: string }` — no need to declare it separately.',
      '`Args = Parameters<typeof makeUser>` is `[id: number, name: string]`, and `Args[1]` is `string`.',
      '`withLogging` wraps any function using `Parameters<F>` and `ReturnType<F>`, keeping its exact signature; calling it prints `calling makeUser` and then the user.',
      '`Db = Awaited<ReturnType<typeof connect>>` unwraps the promise to get the `{ query }` object; it prints `rows for SELECT 1`.',
      '# Why it matters / when to use',
      'Typing wrappers and middleware (logging, retry, caching, timing) that must keep the original signature.',
      'Getting types from libraries that do not export them, e.g. `ReturnType<typeof createClient>` for a Redis client.',
      'Keeping one source of truth: the function defines the type, so changing the function updates all users.',
      '# Common mistakes',
      'Passing a value instead of a type: `ReturnType<makeUser>` is an error; use `typeof makeUser`.',
      'Forgetting `Awaited` for async functions and getting `Promise<...>`.',
      'Being surprised by overloaded functions, where only the last overload is used.',
      '# Say this in the interview',
      '`ReturnType<F>` extracts a function return type and `Parameters<F>` extracts its parameters as a tuple. With values I combine them with `typeof`, and for async functions I wrap with `Awaited`. They are built with conditional types and `infer`, and I use them for type-safe wrappers and to reuse types libraries do not export.',
      'Follow-up: How would you get the type of the first parameter?',
      '  `Parameters<typeof fn>[0]`.',
    ],
    code: `function makeUser(id: number, name: string) {
  return { id, name };
}

type Made = ReturnType<typeof makeUser>;  // { id: number; name: string }
type Args = Parameters<typeof makeUser>;  // [id: number, name: string]
type NameArg = Args[1];                   // string

// A wrapper that keeps the exact signature of any function
function withLogging<F extends (...args: any[]) => any>(name: string, fn: F) {
  return (...args: Parameters<F>): ReturnType<F> => {
    console.log("calling " + name);
    return fn(...args);
  };
}
const loggedMakeUser = withLogging("makeUser", makeUser);
const u: Made = loggedMakeUser(1, "Asha"); // → calling makeUser
console.log(u);                            // → { id: 1, name: 'Asha' }
// loggedMakeUser("1", "Asha");            // error: string is not a number

// Async functions: unwrap the Promise with Awaited
async function connect() {
  return { query: (sql: string) => "rows for " + sql };
}
type Db = Awaited<ReturnType<typeof connect>>; // { query: (sql: string) => string }
connect().then((db: Db) => console.log(db.query("SELECT 1"))); // → rows for SELECT 1
`,
  },
  {
    id: 'implement-utility-types',
    group: 'Utility Types',
    stars: 4,
    difficulty: 'Medium',
    q: 'Implement `Partial`, `Pick`, `Omit` and `ReturnType` yourself.',
    a: [
      '# ELI5',
      'You have used a cookie cutter many times; now the interviewer asks you to build the cookie cutter yourself.',
      'Mapping: the built-in utility types are just short type-level programs, and you can write them with three tools: mapped types, `keyof` and `infer`.',
      '# What it is',
      'A mapped type creates a new object type by looping over keys: `{ [K in Keys]: SomeType }` — like a `for` loop for types.',
      '`keyof T` gives the union of keys of `T`.',
      '`T[K]` (indexed access) gives the type of property `K` in `T`.',
      'Modifiers: `?` makes a property optional, `-?` removes optional, `readonly` and `-readonly` add or remove readonly.',
      'A conditional type `A extends B ? X : Y` is an if/else for types.',
      '`infer R` inside a conditional type captures part of a matched type into a new variable `R`.',
      '`PropertyKey` is the built-in alias for `string | number | symbol` — every type that can be an object key.',
      '# How it works',
      '`MyPartial<T> = { [K in keyof T]?: T[K] }` — loop over every key of `T`, copy its type, add `?`.',
      '`MyPick<T, K extends keyof T> = { [P in K]: T[P] }` — loop only over the chosen keys; the constraint makes typos an error.',
      '`MyOmit<T, K extends PropertyKey> = MyPick<T, Exclude<keyof T, K>>` — compute "all keys minus K", then pick those.',
      '  `Exclude<keyof T, K>` removes union members assignable to `K`.',
      '`MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never` — if `F` looks like a function, capture what it returns as `R`.',
      'A mapped type over `keyof T` (called homomorphic) keeps the original `?` and `readonly` modifiers automatically.',
      '# Example walkthrough',
      '`MyPartial<User>` lets `patch` contain only `name`.',
      '`MyPick<User, "id" | "name">` produces `{ id: number; name: string }`.',
      '`MyOmit<User, "email">` produces `{ id: number; name: string }` too, derived the other way.',
      '`MyReturnType<typeof makeUser>` is `User`, so `made.email` prints `m@x.io`.',
      '`Expect<Equal<...>>` is a tiny type-level test: it only compiles if the two types are identical, which is how type challenges verify answers.',
      '# Why it matters / when to use',
      'A classic live-coding interview question that proves you understand mapped types, `keyof`, conditional types and `infer`.',
      'The same tools let you build custom helpers: `DeepPartial`, `Nullable<T>`, `Mutable<T>`, `PickByValue<T, V>`.',
      '# Common mistakes',
      'Writing `[K in T]` instead of `[K in keyof T]`.',
      'Constraining `MyOmit` with `K extends keyof T` and claiming it matches the built-in — the built-in uses `keyof any` (looser).',
      'Forgetting `infer` and trying to write `F extends (...args: any[]) => R` with an undeclared `R`.',
      'Using `Exclude<T, K>` instead of `Exclude<keyof T, K>` inside `Omit`.',
      '# Say this in the interview',
      '`Partial` is a mapped type over `keyof T` that adds `?` to every key. `Pick` maps over a subset `K extends keyof T`, `Omit` is `Pick` of `Exclude<keyof T, K>`, and `ReturnType` is a conditional type that matches a function and uses `infer R` to capture its return type. These three tools — mapped types, `keyof` and `infer` — are the basis of most utility types.',
      'Follow-up: How would you implement `Readonly` and `Required`?',
      '  `{ readonly [K in keyof T]: T[K] }` and `{ [K in keyof T]-?: T[K] }`.',
      'Follow-up: How would you implement `Parameters`?',
      '  `F extends (...args: infer P) => any ? P : never`.',
    ],
    code: `type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type MyOmit<T, K extends PropertyKey> = MyPick<T, Exclude<keyof T, K>>;
type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;

type User = { id: number; name: string; email: string };

const patch: MyPartial<User> = { name: "New" };         // other keys optional
const preview: MyPick<User, "id" | "name"> = { id: 1, name: "Asha" };
const noEmail: MyOmit<User, "email"> = { id: 2, name: "Ravi" };

function makeUser(): User { return { id: 3, name: "Mia", email: "m@x.io" }; }
const made: MyReturnType<typeof makeUser> = makeUser(); // User

console.log(patch, preview, noEmail);
// → { name: 'New' } { id: 1, name: 'Asha' } { id: 2, name: 'Ravi' }
console.log(made.email);                                // → m@x.io

// Tiny type-level tests: compile only if the types are identical
type Equal<A, B> =
  (<G>() => G extends A ? 1 : 2) extends (<G>() => G extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type Tests = [
  Expect<Equal<MyPick<User, "id">, Pick<User, "id">>>,
  Expect<Equal<MyOmit<User, "email">, Omit<User, "email">>>,
  Expect<Equal<MyReturnType<() => string>, string>>,
];
`,
  },
];
