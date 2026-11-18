import type { BankQuestion } from './types';

export const PYTHON_2: BankQuestion[] = [
  // ───────────────────────── OOP ─────────────────────────
  {
    id: 'classes-and-instances',
    group: 'OOP',
    stars: 5,
    difficulty: 'Easy',
    q: 'How do classes, instances, `self`, class attributes and instance attributes work in Python?',
    a: [
      'A class is itself an object (an instance of `type`); calling it creates a new instance.',
      '`self` is just the conventional name for the instance passed explicitly as the first argument of instance methods.',
      'Class attributes live in the class `__dict__` and are shared by all instances.',
      'Instance attributes live in each instance `__dict__`; assigning `self.x = ...` creates or overwrites one.',
      'Attribute lookup checks the instance first, then the class, then base classes along the MRO.',
      'Gotcha: a mutable class attribute (e.g. a list) is shared, so mutating it via one instance affects all.',
    ],
    code: `class Dog:
    tricks = []            # shared by all dogs (gotcha)
    def __init__(self, name):
        self.name = name   # per-instance

a, b = Dog('a'), Dog('b')
a.tricks.append('sit')
print(b.tricks)            # ['sit']`,
  },
  {
    id: 'inheritance-types',
    group: 'OOP',
    stars: 4,
    difficulty: 'Easy',
    q: 'What kinds of inheritance does Python support and how does method overriding work?',
    a: [
      'Python supports single, multiple, multilevel and hierarchical inheritance.',
      'A subclass overrides a method simply by defining one with the same name; there is no `override` keyword (though `typing.override` exists for type checkers).',
      'Call the parent implementation with `super().method(...)`.',
      '`isinstance(obj, Cls)` respects inheritance; `type(obj) is Cls` does not.',
      '`issubclass(Sub, Base)` checks class relationships.',
      'Prefer composition over deep inheritance trees; use mixins for small reusable behaviours.',
    ],
  },
  {
    id: 'mro-and-super',
    group: 'OOP',
    stars: 5,
    difficulty: 'Hard',
    q: 'What is the MRO and how does `super()` work with multiple inheritance?',
    a: [
      'MRO (Method Resolution Order) is the order in which bases are searched for an attribute; see it via `Cls.__mro__` or `Cls.mro()`.',
      'Python uses C3 linearization: children before parents, and the order of bases in the class statement is preserved.',
      'C3 resolves the diamond problem: a shared base appears only once, after all its subclasses.',
      '`super()` returns a proxy that delegates to the NEXT class in the MRO of the instance, not necessarily the direct parent.',
      'Cooperative multiple inheritance requires every class to call `super()` (and usually accept `**kwargs`).',
      'If no consistent MRO exists, class creation raises `TypeError`.',
    ],
    code: `class A:
    def hi(self): print('A')
class B(A):
    def hi(self): print('B'); super().hi()
class C(A):
    def hi(self): print('C'); super().hi()
class D(B, C): pass

D().hi()                         # B C A
print([k.__name__ for k in D.__mro__])  # D B C A object`,
  },
  {
    id: 'classmethod-vs-staticmethod',
    group: 'OOP',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between an instance method, `@classmethod` and `@staticmethod`?',
    a: [
      'Instance method: receives the instance as `self`; can read/modify instance and class state.',
      '`@classmethod`: receives the class as `cls`; used for alternative constructors and class-level state.',
      '`@classmethod` respects inheritance: `cls` is the subclass when called on a subclass.',
      '`@staticmethod`: receives nothing implicitly; it is a plain function namespaced inside the class.',
      'All three can be called on an instance or the class (instance methods need an instance passed explicitly when called via the class).',
    ],
    code: `from datetime import date

class Person:
    def __init__(self, name, age):
        self.name, self.age = name, age
    @classmethod
    def from_birth_year(cls, name, year):
        return cls(name, date.today().year - year)
    @staticmethod
    def is_adult(age):
        return age >= 18`,
  },
  {
    id: 'property-decorator',
    group: 'OOP',
    stars: 4,
    difficulty: 'Medium',
    q: 'What does `@property` do and why use it instead of getters/setters?',
    a: [
      '`@property` turns a method into a managed attribute read with plain `obj.attr` syntax.',
      'Add `@attr.setter` and `@attr.deleter` to control assignment and deletion.',
      'Lets you start with a public attribute and later add validation without changing the public API.',
      'A property without a setter is read-only: assignment raises `AttributeError`.',
      '`property` is implemented as a data descriptor on the class.',
      'For expensive computed values computed once, use `functools.cached_property`.',
    ],
    code: `class Temp:
    def __init__(self, c): self.celsius = c
    @property
    def celsius(self): return self._c
    @celsius.setter
    def celsius(self, v):
        if v < -273.15: raise ValueError('too cold')
        self._c = v
    @property
    def fahrenheit(self): return self._c * 9 / 5 + 32`,
  },
  {
    id: 'abstract-classes',
    group: 'OOP',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you create abstract classes and interfaces in Python?',
    a: [
      'Inherit from `abc.ABC` (or use `metaclass=ABCMeta`) and mark methods with `@abstractmethod`.',
      'A class with unimplemented abstract methods cannot be instantiated: `TypeError`.',
      'Subclasses must override every abstract method to become concrete.',
      'Abstract methods may still have a body that subclasses call via `super()`.',
      'Combine with `@property` / `@classmethod` by stacking `@abstractmethod` as the innermost decorator.',
      'For structural ("duck") typing without inheritance, use `typing.Protocol` instead.',
    ],
    code: `from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...

class Square(Shape):
    def __init__(self, s): self.s = s
    def area(self): return self.s ** 2

Shape()   # TypeError: Can't instantiate abstract class`,
  },
  {
    id: 'dataclasses',
    group: 'OOP',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are dataclasses and what options do they offer?',
    a: [
      '`@dataclass` auto-generates `__init__`, `__repr__` and `__eq__` from annotated class fields.',
      '`frozen=True` makes instances immutable (and hashable); `order=True` adds `<`, `>` etc.',
      '`slots=True` (3.10+) generates `__slots__`; `kw_only=True` makes fields keyword-only.',
      'Mutable defaults must use `field(default_factory=list)`; a bare `[]` default raises `ValueError`.',
      '`__post_init__` runs after the generated `__init__` for validation or derived fields.',
      'Alternatives: `NamedTuple` (immutable tuple), `attrs`, and `pydantic` (runtime validation).',
    ],
    code: `from dataclasses import dataclass, field

@dataclass(frozen=True, slots=True)
class Point:
    x: float
    y: float = 0.0
    tags: list[str] = field(default_factory=list)

p = Point(1)
print(p)          # Point(x=1, y=0.0, tags=[])
print(p == Point(1))  # True`,
  },
  {
    id: 'slots',
    group: 'OOP',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is `__slots__` and when should you use it?',
    a: [
      '`__slots__` declares a fixed set of attribute names, so instances get no per-instance `__dict__`.',
      'Saves significant memory when creating millions of small objects and gives slightly faster attribute access.',
      'Assigning an attribute not listed in `__slots__` raises `AttributeError`.',
      'Each class in a hierarchy needs its own `__slots__`, otherwise a subclass gets a `__dict__` again.',
      'Without `__weakref__` in the slots, instances cannot be weakly referenced.',
      'Easiest modern way: `@dataclass(slots=True)`.',
    ],
    code: `class P:
    __slots__ = ('x', 'y')
    def __init__(self, x, y): self.x, self.y = x, y

p = P(1, 2)
p.z = 3   # AttributeError`,
  },
  {
    id: 'metaclasses',
    group: 'OOP',
    stars: 3,
    difficulty: 'Hard',
    q: 'What is a metaclass and when would you use one?',
    a: [
      'A metaclass is the class of a class: it controls how classes are created. The default is `type`.',
      'Defining `class Foo(metaclass=Meta)` makes Python call `Meta(name, bases, namespace)` to build `Foo`.',
      'Override `__new__`/`__init__` on the metaclass to modify, validate or register classes at definition time.',
      'Used by ORMs (Django models), ABCs (`ABCMeta`) and enums (`EnumMeta`).',
      'Simpler alternatives usually suffice: class decorators and `__init_subclass__`.',
      '"If you wonder whether you need metaclasses, you don\'t" (Tim Peters).',
    ],
    code: `class Registry(type):
    classes = {}
    def __new__(mcs, name, bases, ns):
        cls = super().__new__(mcs, name, bases, ns)
        mcs.classes[name] = cls
        return cls

class Plugin(metaclass=Registry): pass
print(Registry.classes)   # {'Plugin': <class ...>}`,
  },

  // ───────────────────────── Dunder Methods ─────────────────────────
  {
    id: 'init-vs-new',
    group: 'Dunder Methods',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between `__new__` and `__init__`?',
    a: [
      '`__new__` is a static method that CREATES and returns a new instance; it receives `cls`.',
      '`__init__` INITIALISES an already-created instance; it receives `self` and must return `None`.',
      '`__new__` runs first; `__init__` runs only if `__new__` returned an instance of `cls`.',
      'Override `__new__` when subclassing immutable types (`int`, `str`, `tuple`) or to implement singletons/caching.',
      'In everyday code you only need `__init__`.',
    ],
    code: `class Singleton:
    _inst = None
    def __new__(cls, *a, **kw):
        if cls._inst is None:
            cls._inst = super().__new__(cls)
        return cls._inst

print(Singleton() is Singleton())   # True`,
  },
  {
    id: 'repr-vs-str',
    group: 'Dunder Methods',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between `__repr__` and `__str__`?',
    a: [
      '`__repr__` is the unambiguous, developer-facing representation; ideally `eval(repr(x)) == x`.',
      '`__str__` is the readable, user-facing representation used by `print()` and `str()`.',
      'If `__str__` is missing, Python falls back to `__repr__` (not the other way round).',
      'The REPL, debuggers and containers (`[obj]`) display `__repr__`.',
      'In f-strings, `{obj!r}` forces `repr`; `{obj=}` prints the expression and its repr.',
    ],
    code: `class Money:
    def __init__(self, amt): self.amt = amt
    def __repr__(self): return f'Money({self.amt!r})'
    def __str__(self): return f'Rs {self.amt:.2f}'

m = Money(5)
print(m)     # Rs 5.00
print([m])   # [Money(5)]`,
  },
  {
    id: 'eq-and-hash',
    group: 'Dunder Methods',
    stars: 4,
    difficulty: 'Medium',
    q: 'How are `__eq__` and `__hash__` related?',
    a: [
      'Rule: objects that compare equal must have the same hash.',
      'By default, objects compare and hash by identity (`id`).',
      'Defining `__eq__` without `__hash__` sets `__hash__ = None`, making instances unhashable (cannot be dict keys or set members).',
      'Base `__hash__` on the same immutable fields used in `__eq__`, e.g. `hash((self.x, self.y))`.',
      'Hash must not change while the object is inside a dict/set, so hashable objects should be effectively immutable.',
      'Return `NotImplemented` from `__eq__` for unsupported types so Python can try the reflected operation.',
    ],
    code: `class P:
    def __init__(self, x, y): self.x, self.y = x, y
    def __eq__(self, o):
        if not isinstance(o, P): return NotImplemented
        return (self.x, self.y) == (o.x, o.y)
    def __hash__(self): return hash((self.x, self.y))

print(len({P(1, 2), P(1, 2)}))   # 1`,
  },
  {
    id: 'call-dunder',
    group: 'Dunder Methods',
    stars: 3,
    difficulty: 'Easy',
    q: 'What does `__call__` do?',
    a: [
      'Defining `__call__` makes instances callable like functions: `obj(args)`.',
      'Useful for stateful function-like objects: counters, configured validators, memoizers.',
      'Common way to write class-based decorators (store the wrapped function in `__init__`).',
      '`callable(obj)` returns True for functions, classes, and instances with `__call__`.',
    ],
    code: `class Counter:
    def __init__(self): self.n = 0
    def __call__(self):
        self.n += 1
        return self.n

c = Counter()
c(); c()
print(c.n)   # 2`,
  },
  {
    id: 'operator-overloading',
    group: 'Dunder Methods',
    stars: 4,
    difficulty: 'Medium',
    q: 'How does operator overloading work in Python?',
    a: [
      'Operators map to dunder methods: `+` is `__add__`, `<` is `__lt__`, `[]` is `__getitem__`, `len()` is `__len__`, `in` is `__contains__`.',
      'If `a.__add__(b)` returns `NotImplemented`, Python tries the reflected `b.__radd__(a)`.',
      'In-place operators (`+=`) use `__iadd__` if defined, else fall back to `__add__` and rebind.',
      '`functools.total_ordering` fills in the remaining comparisons from `__eq__` plus one of `__lt__`/`__gt__`/etc.',
      'Implementing `__len__`/`__getitem__` or `__iter__` lets objects work with `for`, slicing and built-ins.',
    ],
    code: `class Vec:
    def __init__(self, x, y): self.x, self.y = x, y
    def __add__(self, o): return Vec(self.x + o.x, self.y + o.y)
    def __mul__(self, k): return Vec(self.x * k, self.y * k)
    __rmul__ = __mul__
    def __repr__(self): return f'Vec({self.x}, {self.y})'

print(Vec(1, 2) + Vec(3, 4))   # Vec(4, 6)
print(3 * Vec(1, 2))           # Vec(3, 6)`,
  },
  {
    id: 'getattr-vs-getattribute',
    group: 'Dunder Methods',
    stars: 3,
    difficulty: 'Hard',
    q: 'What is the difference between `__getattr__` and `__getattribute__`?',
    a: [
      '`__getattribute__` is called on EVERY attribute access.',
      '`__getattr__` is called only when normal lookup fails (as a fallback before `AttributeError`).',
      'Overriding `__getattribute__` is risky: accessing `self.x` inside it recurses infinitely; use `object.__getattribute__(self, name)`.',
      '`__getattr__` is the safe choice for proxies, delegation and lazy attributes.',
      '`__setattr__` and `__delattr__` intercept assignment and deletion of all attributes.',
      'Modules can define a module-level `__getattr__` too (PEP 562) for lazy imports/deprecations.',
    ],
    code: `class Proxy:
    def __init__(self, target): self._t = target
    def __getattr__(self, name):      # only for missing attrs
        print('delegating', name)
        return getattr(self._t, name)

p = Proxy([3, 1, 2])
p.sort()   # delegating sort`,
  },
  {
    id: 'descriptors',
    group: 'Dunder Methods',
    stars: 3,
    difficulty: 'Hard',
    q: 'What are descriptors?',
    a: [
      'A descriptor is a class attribute object defining `__get__`, `__set__` and/or `__delete__`.',
      'Data descriptor (defines `__set__` or `__delete__`) takes precedence over the instance `__dict__`.',
      'Non-data descriptor (only `__get__`) is overridden by an instance attribute of the same name.',
      '`__set_name__(self, owner, name)` tells the descriptor the attribute name it was assigned to.',
      'Built on descriptors: `property`, `classmethod`, `staticmethod`, bound methods (functions are non-data descriptors), ORM fields.',
    ],
    code: `class Positive:
    def __set_name__(self, owner, name): self.name = '_' + name
    def __get__(self, obj, objtype=None): return getattr(obj, self.name)
    def __set__(self, obj, val):
        if val <= 0: raise ValueError('must be > 0')
        setattr(obj, self.name, val)

class Order:
    qty = Positive()
    def __init__(self, q): self.qty = q`,
  },

  // ───────────────────────── Memory & Internals ─────────────────────────
  {
    id: 'reference-counting',
    group: 'Memory & Internals',
    stars: 4,
    difficulty: 'Medium',
    q: 'How does Python manage memory?',
    a: [
      'CPython objects live on a private heap managed by the interpreter (with `pymalloc` for small objects).',
      'Primary mechanism: reference counting; every object tracks how many references point to it.',
      'When the count drops to zero the object is freed immediately (deterministic, e.g. files closed promptly).',
      '`sys.getrefcount(x)` shows the count (one higher because of the temporary argument).',
      '`del x` removes a name binding and decrements the count; it does not directly free the object.',
      'Reference counting cannot free reference cycles; the cyclic garbage collector handles those.',
    ],
    code: `import sys
a = []
b = a
print(sys.getrefcount(a))   # 3 (a, b, argument)
del b
print(sys.getrefcount(a))   # 2`,
  },
  {
    id: 'garbage-collector',
    group: 'Memory & Internals',
    stars: 4,
    difficulty: 'Medium',
    q: 'How does the garbage collector handle reference cycles?',
    a: [
      'The `gc` module runs a cycle detector over container objects (lists, dicts, class instances).',
      'It finds groups of objects only referenced by each other and frees them.',
      'CPython uses generations (young/old); new objects are scanned more often since most die young (3.14 switches to an incremental collector).',
      'Collection is triggered by allocation thresholds; force it with `gc.collect()`, disable with `gc.disable()`.',
      'Use `weakref` (e.g. `WeakValueDictionary`, parent back-references) to avoid creating cycles.',
      'Common leaks: growing global caches, unbounded `lru_cache`, closures/callbacks holding references.',
    ],
    code: `import gc
class Node: pass
a, b = Node(), Node()
a.other, b.other = b, a   # cycle
del a, b                  # refcounts never hit 0
print(gc.collect())       # > 0 objects collected`,
  },
  {
    id: 'gil',
    group: 'Memory & Internals',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the GIL?',
    a: [
      'The Global Interpreter Lock is a mutex in CPython letting only one thread execute Python bytecode at a time.',
      'It exists because reference counting and many internals are not thread-safe; a single lock is simple and fast for single-threaded code.',
      'CPU-bound threads do not run in parallel; I/O-bound threads still benefit because the GIL is released during blocking I/O.',
      'C extensions (NumPy, hashing, compression) can release the GIL during heavy work.',
      'Workarounds for CPU-bound work: `multiprocessing`, `ProcessPoolExecutor`, C extensions, or free-threaded builds.',
      'The GIL does NOT make your code thread-safe: `x += 1` is not atomic, so you still need locks.',
    ],
  },
  {
    id: 'cpython-vs-pypy',
    group: 'Memory & Internals',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are CPython, PyPy, Jython and how is Python code executed?',
    a: [
      'CPython is the reference implementation, written in C; it compiles source to bytecode (`.pyc` in `__pycache__`) and interprets it in a VM.',
      'PyPy is an alternative implementation with a tracing JIT; often several times faster on long-running pure-Python code.',
      'PyPy has weaker compatibility with C extensions and uses a tracing GC instead of reference counting.',
      'Jython (JVM) and IronPython (.NET) target other runtimes; MicroPython targets microcontrollers.',
      'CPython 3.11+ added a specializing adaptive interpreter (big speedups) and 3.13 shipped an experimental JIT.',
      'Inspect bytecode with the `dis` module.',
    ],
    code: `import dis
dis.dis(lambda x: x + 1)
# LOAD_FAST x, LOAD_CONST 1, BINARY_OP (+), RETURN_VALUE`,
  },
  {
    id: 'interning',
    group: 'Memory & Internals',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is interning and why can `is` give surprising results?',
    a: [
      '`is` compares identity (same object); `==` compares value.',
      'CPython caches small integers -5 to 256, so they are always the same object.',
      'Identifier-like string literals are interned automatically; others may or may not be.',
      'Constants in the same compiled code block may be shared, so `a = 1000; b = 1000` in one file can still be identical.',
      'Force interning with `sys.intern(s)` to speed up many repeated dict lookups/comparisons.',
      'Never rely on interning: use `is` only for singletons like `None`, `True`, `False` and sentinels.',
    ],
    code: `a = 256; b = 256
print(a is b)               # True (cached)
x = int('1000'); y = int('1000')
print(x is y, x == y)       # False True
import sys
s = sys.intern('hello world!')`,
  },

  // ───────────────────────── Concurrency ─────────────────────────
  {
    id: 'threading-vs-multiprocessing-vs-asyncio',
    group: 'Concurrency',
    stars: 5,
    difficulty: 'Medium',
    q: 'When do you use threading vs multiprocessing vs asyncio?',
    a: [
      '`threading`: OS threads sharing memory; good for I/O-bound work with blocking libraries; limited by the GIL for CPU work.',
      '`multiprocessing`: separate processes, each with its own interpreter and GIL; true parallelism for CPU-bound work.',
      'Processes cost more (startup, memory) and data must be pickled to pass between them.',
      '`asyncio`: single-threaded cooperative multitasking via an event loop; best for very high numbers of concurrent I/O tasks (sockets, HTTP).',
      'asyncio needs async-aware libraries (`aiohttp`, `asyncpg`); a blocking call freezes the whole loop.',
      'Rule of thumb: CPU-bound → processes; I/O-bound with many connections → asyncio; I/O-bound with sync libraries → threads.',
    ],
  },
  {
    id: 'gil-impact-threads',
    group: 'Concurrency',
    stars: 4,
    difficulty: 'Medium',
    q: 'If Python has a GIL, why do you still need locks?',
    a: [
      'The GIL only guarantees a single bytecode instruction runs at a time; threads can switch between any two instructions.',
      'Compound operations like `count += 1` (load, add, store) can interleave and lose updates.',
      'Use `threading.Lock` (or `RLock`) via `with lock:` to protect shared mutable state.',
      'Other primitives: `Semaphore`, `Event`, `Condition`, `Barrier`.',
      'Prefer `queue.Queue` (thread-safe) to pass data between producer and consumer threads.',
      'Free-threaded builds (no GIL) make proper locking even more important.',
    ],
    code: `import threading
count, lock = 0, threading.Lock()

def work():
    global count
    for _ in range(100_000):
        with lock:
            count += 1

ts = [threading.Thread(target=work) for _ in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print(count)   # 400000`,
  },
  {
    id: 'concurrent-futures',
    group: 'Concurrency',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is `concurrent.futures`?',
    a: [
      'High-level API for running callables in a pool: `ThreadPoolExecutor` and `ProcessPoolExecutor` share the same interface.',
      '`executor.submit(fn, *args)` returns a `Future`; `.result()` blocks and re-raises any exception.',
      '`executor.map(fn, iterable)` returns results in input order.',
      '`as_completed(futures)` yields futures as they finish (fastest first).',
      'Use it as a context manager so the pool is shut down and joined automatically.',
      'With `ProcessPoolExecutor`, functions and arguments must be picklable and the entry point guarded by `if __name__ == "__main__":`.',
    ],
    code: `from concurrent.futures import ThreadPoolExecutor, as_completed
import urllib.request

def fetch(url):
    with urllib.request.urlopen(url) as r:
        return url, len(r.read())

urls = ['https://example.com', 'https://python.org']
with ThreadPoolExecutor(max_workers=8) as ex:
    for fut in as_completed(ex.submit(fetch, u) for u in urls):
        print(fut.result())`,
  },
  {
    id: 'async-await',
    group: 'Concurrency',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do `async` and `await` work?',
    a: [
      '`async def` defines a coroutine function; calling it returns a coroutine object without running it.',
      '`await` suspends the current coroutine until the awaitable completes, letting the event loop run others.',
      '`asyncio.run(main())` creates an event loop, runs the coroutine and closes the loop.',
      'Run things concurrently with `asyncio.gather(...)` or `asyncio.TaskGroup` (3.11+, preferred: cancels siblings on error).',
      'Use `asyncio.sleep`, not `time.sleep`; offload blocking calls with `asyncio.to_thread(fn)`.',
      'Forgetting `await` gives a "coroutine was never awaited" warning and the code never runs.',
    ],
    code: `import asyncio

async def job(n):
    await asyncio.sleep(1)
    return n * 2

async def main():
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(job(i)) for i in range(3)]
    print([t.result() for t in tasks])   # [0, 2, 4] after ~1s

asyncio.run(main())`,
  },
  {
    id: 'event-loop',
    group: 'Concurrency',
    stars: 4,
    difficulty: 'Hard',
    q: 'What is the asyncio event loop?',
    a: [
      'The event loop is a scheduler running in one thread that executes ready tasks/callbacks and waits on I/O readiness (epoll/kqueue/IOCP).',
      'A `Task` wraps a coroutine and schedules it on the loop; tasks only switch at `await` points (cooperative).',
      'A CPU-heavy or blocking call inside a coroutine blocks every other task on that loop.',
      'Get the running loop with `asyncio.get_running_loop()`; schedule callbacks with `loop.call_soon`/`call_later`.',
      'Use `loop.run_in_executor` or `asyncio.to_thread` to bridge to blocking code.',
      'Timeouts: `async with asyncio.timeout(5):` (3.11+) or `asyncio.wait_for`.',
    ],
  },
  {
    id: 'free-threaded-python',
    group: 'Concurrency',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is free-threaded Python (PEP 703)?',
    a: [
      'Python 3.13 introduced an optional free-threaded build (`python3.13t`) with the GIL disabled.',
      'It allows true multi-core parallelism for CPU-bound threads.',
      'Experimental in 3.13; officially supported (but still not the default) since 3.14.',
      'Uses biased reference counting, immortal objects and per-object locks to stay safe without the GIL.',
      'Single-threaded code is somewhat slower and C extensions must declare support, otherwise the GIL is re-enabled.',
      'Check at runtime with `sys._is_gil_enabled()`.',
    ],
  },
  {
    id: 'multiprocessing-communication',
    group: 'Concurrency',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do processes share data in `multiprocessing`?',
    a: [
      'Processes do not share memory by default; arguments and results are pickled and sent across.',
      '`Queue` and `Pipe` pass messages between processes.',
      '`Value`/`Array` and `multiprocessing.shared_memory` provide shared memory for raw data.',
      '`Manager()` provides proxied shared dicts/lists (convenient but slow).',
      '`Pool.map` / `ProcessPoolExecutor` are the simplest way to parallelise a function over data.',
      'Start methods: `fork` (Linux default before 3.14), `spawn` (Windows/macOS default), `forkserver` (Linux default in 3.14).',
    ],
    code: `from multiprocessing import Pool

def square(x): return x * x

if __name__ == '__main__':
    with Pool(4) as p:
        print(p.map(square, range(5)))   # [0, 1, 4, 9, 16]`,
  },

  // ───────────────────────── Errors & Context Managers ─────────────────────────
  {
    id: 'try-except-else-finally',
    group: 'Errors & Context Managers',
    stars: 5,
    difficulty: 'Easy',
    q: 'How do `try`, `except`, `else` and `finally` work together?',
    a: [
      '`try`: code that may raise.',
      '`except SomeError as e`: handles matching exceptions; put specific types before general ones.',
      '`else`: runs only if the `try` block raised nothing; keeps the `try` minimal.',
      '`finally`: always runs (success, exception, `return`, `break`) for cleanup.',
      'A `return` in `finally` overrides the earlier return and swallows exceptions (3.14 warns about it).',
      'Avoid bare `except:`; it also catches `KeyboardInterrupt`/`SystemExit`. Use `except Exception`.',
    ],
    code: `def read(path):
    try:
        f = open(path)
    except FileNotFoundError:
        return None
    else:
        with f:
            return f.read()
    finally:
        print('done')`,
  },
  {
    id: 'custom-exceptions',
    group: 'Errors & Context Managers',
    stars: 4,
    difficulty: 'Easy',
    q: 'How do you create custom exceptions and what is the exception hierarchy?',
    a: [
      'Subclass `Exception` (not `BaseException`); name it ending in `Error`.',
      'Create a base exception for your library so callers can catch all of them at once.',
      'Add extra fields via `__init__` and call `super().__init__(message)`.',
      'Hierarchy: `BaseException` → `SystemExit`, `KeyboardInterrupt`, `GeneratorExit`, `Exception` → everything else.',
      '`ExceptionGroup` and `except*` (3.11+) handle multiple concurrent errors (e.g. from `TaskGroup`).',
      '`e.add_note("...")` (3.11+) attaches extra context to an exception.',
    ],
    code: `class AppError(Exception): pass

class InsufficientFunds(AppError):
    def __init__(self, needed):
        super().__init__(f'need {needed} more')
        self.needed = needed

try:
    raise InsufficientFunds(50)
except AppError as e:
    print(e, e.needed)   # need 50 more 50`,
  },
  {
    id: 'raise-from',
    group: 'Errors & Context Managers',
    stars: 3,
    difficulty: 'Medium',
    q: 'What does `raise ... from ...` do?',
    a: [
      'Raising inside an `except` block implicitly chains: the original is stored in `__context__` ("During handling ... another exception occurred").',
      '`raise New() from err` sets `__cause__` explicitly: "The above exception was the direct cause...".',
      'Use it when translating low-level errors into domain errors without losing the root cause.',
      '`raise New() from None` suppresses the chained context in the traceback.',
      'A bare `raise` inside `except` re-raises the current exception with its original traceback.',
    ],
    code: `class ConfigError(Exception): pass

def load(cfg):
    try:
        return cfg['port']
    except KeyError as e:
        raise ConfigError('port missing') from e`,
  },
  {
    id: 'context-managers',
    group: 'Errors & Context Managers',
    stars: 5,
    difficulty: 'Medium',
    q: 'How does the `with` statement work, and how do you write a context manager?',
    a: [
      '`with` guarantees setup and teardown, even if the block raises.',
      'It calls `__enter__()` (its return value is bound by `as`) and then `__exit__(exc_type, exc, tb)`.',
      'If `__exit__` returns a truthy value, the exception is suppressed.',
      'Common uses: files, locks, DB transactions, temporary state changes.',
      'Multiple managers: `with open(a) as f, open(b) as g:` (parenthesised form supported).',
      'Async version: `async with` using `__aenter__`/`__aexit__`.',
    ],
    code: `import time

class Timer:
    def __enter__(self):
        self.t = time.perf_counter()
        return self
    def __exit__(self, exc_type, exc, tb):
        print(f'{time.perf_counter() - self.t:.3f}s')
        return False   # don't suppress errors

with Timer():
    sum(range(10**6))`,
  },
  {
    id: 'contextlib',
    group: 'Errors & Context Managers',
    stars: 4,
    difficulty: 'Medium',
    q: 'What does the `contextlib` module provide?',
    a: [
      '`@contextmanager` turns a generator into a context manager: code before `yield` is setup, after is teardown.',
      'Wrap the `yield` in `try/finally` so cleanup runs even if the block raises.',
      '`suppress(FileNotFoundError)` ignores specific exceptions.',
      '`ExitStack` manages a dynamic number of context managers.',
      '`closing(obj)` calls `obj.close()`; `redirect_stdout` redirects printing; `nullcontext` is a no-op stand-in.',
      '`@asynccontextmanager` is the async equivalent.',
    ],
    code: `from contextlib import contextmanager, suppress
import os

@contextmanager
def cd(path):
    old = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(old)

with suppress(FileNotFoundError):
    os.remove('missing.txt')`,
  },

  // ───────────────────────── Modules & Packaging ─────────────────────────
  {
    id: 'import-system',
    group: 'Modules & Packaging',
    stars: 4,
    difficulty: 'Medium',
    q: 'How does Python\'s import system work?',
    a: [
      'On `import x`, Python first checks the `sys.modules` cache; modules execute only once per process.',
      'Otherwise finders search `sys.path` (script dir, `PYTHONPATH`, stdlib, site-packages) and a loader executes the module.',
      'The module is a regular object; `import x` binds the name `x`, `from x import y` binds only `y`.',
      'Relative imports (`from . import utils`) work only inside packages.',
      'Circular imports fail when a module uses a name from a partially initialised module; fix by restructuring or moving the import inside a function.',
      '`importlib.import_module(name)` imports dynamically; `importlib.reload` re-executes a module.',
    ],
  },
  {
    id: 'name-main',
    group: 'Modules & Packaging',
    stars: 5,
    difficulty: 'Easy',
    q: 'What does `if __name__ == "__main__":` do?',
    a: [
      'Every module has a `__name__`; it is `"__main__"` when the file is run directly and the module name when imported.',
      'The guard runs code only when the file is executed as a script, not on import.',
      'Lets a file be both a reusable module and a runnable script/test harness.',
      'Required for `multiprocessing` with the `spawn` start method, otherwise child processes re-run the top-level code.',
      '`python -m package.module` runs a module as `__main__`; a package can provide `__main__.py`.',
    ],
    code: `def main():
    print('running as script')

if __name__ == '__main__':
    main()`,
  },
  {
    id: 'init-py-packages',
    group: 'Modules & Packaging',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is the difference between a module and a package, and what is `__init__.py` for?',
    a: [
      'A module is a single `.py` file; a package is a directory of modules.',
      '`__init__.py` marks a regular package and runs when the package is first imported.',
      'Use it to expose a public API (`from .core import Client`) and package-level setup.',
      '`__all__` defines what `from pkg import *` exports.',
      'Directories without `__init__.py` are namespace packages (PEP 420), which can span multiple locations.',
    ],
  },
  {
    id: 'venv-pip',
    group: 'Modules & Packaging',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are virtual environments and how do you manage dependencies with pip?',
    a: [
      'A virtual environment is an isolated directory with its own interpreter link and site-packages, so projects do not clash.',
      'Create with `python -m venv .venv`; activate with `source .venv/bin/activate` (or `.venv\\Scripts\\activate` on Windows).',
      'Install with `pip install pkg`; freeze exact versions with `pip freeze > requirements.txt`.',
      'Reproduce with `pip install -r requirements.txt`; pin versions for apps, use ranges for libraries.',
      'Never commit the venv folder; commit the requirements/lock file.',
      'Use `python -m pip` to be sure you install into the right interpreter.',
    ],
  },
  {
    id: 'pyproject-poetry-uv',
    group: 'Modules & Packaging',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is `pyproject.toml`, and how do Poetry and uv compare to pip?',
    a: [
      '`pyproject.toml` is the standard project config file: metadata and dependencies (`[project]`, PEP 621), build backend (`[build-system]`) and tool settings (ruff, pytest, mypy).',
      'It replaces `setup.py`/`setup.cfg` for most projects.',
      'Poetry: dependency resolution, lock file (`poetry.lock`), virtualenv management and publishing in one tool.',
      'uv (Astral, written in Rust): extremely fast drop-in for pip/venv/pip-tools/pipx, with `uv.lock`, `uv add`, `uv run` and Python version management.',
      'Lock files give reproducible installs including transitive dependencies.',
      'Build a distribution (wheel/sdist) with `python -m build` or `uv build`; upload to PyPI with twine/uv.',
    ],
    code: `# pyproject.toml
[project]
name = "myapp"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = ["fastapi>=0.110", "httpx"]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"`,
  },

  // ───────────────────────── Typing & Testing ─────────────────────────
  {
    id: 'type-hints',
    group: 'Typing & Testing',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are type hints and are they enforced at runtime?',
    a: [
      'Type hints annotate expected types: `def f(x: int) -> str:`; they are NOT enforced at runtime.',
      'They are used by static checkers (mypy, pyright), IDEs, and libraries like pydantic/FastAPI that read them deliberately.',
      'Use built-in generics (`list[int]`, `dict[str, int]`) and `X | None` instead of `Optional[X]` (3.10+).',
      'Annotations are stored in `__annotations__`; 3.14 evaluates them lazily (PEP 649).',
      '`type Alias = list[int]` (3.12) declares type aliases.',
      '`Any` disables checking; `object` accepts anything but allows only safe operations.',
    ],
    code: `def greet(name: str, times: int = 1) -> str:
    return ', '.join([f'hi {name}'] * times)

greet(42)   # runs fine! only mypy complains

type UserMap = dict[int, str]   # 3.12 alias`,
  },
  {
    id: 'generics-and-protocol',
    group: 'Typing & Testing',
    stars: 3,
    difficulty: 'Hard',
    q: 'How do generics, `TypeVar` and `Protocol` work in Python typing?',
    a: [
      'Generics let a function or class work over a type parameter while keeping type information.',
      '3.12 syntax: `def first[T](xs: list[T]) -> T:` and `class Box[T]:` (older code uses `TypeVar("T")` and `Generic[T]`).',
      'Bounds and constraints: `[T: Number]` (bound) or `[T: (int, str)]` (constrained).',
      '`Protocol` defines structural typing: any class with matching methods satisfies it without inheriting.',
      'Add `@runtime_checkable` to allow `isinstance` checks against a Protocol (checks method presence only).',
      'Other useful types: `Callable`, `Literal`, `TypedDict`, `Final`, `Self`, `overload`.',
    ],
    code: `from typing import Protocol

class Closeable(Protocol):
    def close(self) -> None: ...

def shutdown(items: list[Closeable]) -> None:
    for i in items: i.close()

def first[T](xs: list[T]) -> T:
    return xs[0]`,
  },
  {
    id: 'mypy',
    group: 'Typing & Testing',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is mypy and how do you adopt static typing in an existing codebase?',
    a: [
      'mypy is a static type checker that analyses annotations without running code (pyright/pylance and Astral\'s ty are alternatives).',
      'Unannotated functions are not checked by default, enabling gradual typing.',
      'Adopt incrementally: start with core modules, then enable stricter flags (`--strict`, `disallow_untyped_defs`).',
      'Use stub packages (`types-requests`) or `py.typed` libraries for third-party types.',
      'Silence specific lines with `# type: ignore[code]`; inspect inferred types with `reveal_type(x)`.',
      'Run it in CI alongside linters such as ruff.',
    ],
  },
  {
    id: 'pytest-fixtures',
    group: 'Typing & Testing',
    stars: 4,
    difficulty: 'Medium',
    q: 'How does pytest work, and what are fixtures?',
    a: [
      'pytest discovers `test_*.py` files and `test_*` functions; plain `assert` gives detailed failure diffs.',
      'Fixtures (`@pytest.fixture`) provide setup data/resources injected by parameter name.',
      '`yield` in a fixture separates setup from teardown.',
      'Scopes: `function` (default), `class`, `module`, `package`, `session`; share fixtures via `conftest.py`.',
      '`@pytest.mark.parametrize` runs one test with many inputs; `pytest.raises` asserts exceptions.',
      'Built-in fixtures: `tmp_path`, `monkeypatch`, `capsys`.',
    ],
    code: `import pytest

@pytest.fixture
def db():
    conn = {'users': []}
    yield conn          # teardown after yield
    conn.clear()

@pytest.mark.parametrize('a,b,out', [(1, 2, 3), (0, 0, 0)])
def test_add(a, b, out, db):
    assert a + b == out`,
  },
  {
    id: 'mocking',
    group: 'Typing & Testing',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you mock dependencies in Python tests?',
    a: [
      '`unittest.mock` provides `Mock`/`MagicMock` objects that record calls and return configurable values.',
      '`patch("module.name")` temporarily replaces an object, as a decorator or context manager.',
      'Patch where the name is LOOKED UP, not where it is defined (e.g. `myapp.service.requests`, not `requests`).',
      'Configure with `return_value` and `side_effect` (exception or sequence); verify with `assert_called_once_with`.',
      'Use `autospec=True` so mocks enforce the real signature; `AsyncMock` for coroutines.',
      'pytest alternatives: `monkeypatch` fixture or the `pytest-mock` `mocker` fixture.',
    ],
    code: `from unittest.mock import patch

# myapp/weather.py does: import requests
def test_temp():
    with patch('myapp.weather.requests.get') as get:
        get.return_value.json.return_value = {'temp': 21}
        from myapp.weather import current_temp
        assert current_temp('Pune') == 21
        get.assert_called_once()`,
  },

  // ───────────────────────── Performance & Ecosystem ─────────────────────────
  {
    id: 'profiling',
    group: 'Performance & Ecosystem',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you profile and optimise slow Python code?',
    a: [
      'Measure first: `timeit` for micro-benchmarks, `time.perf_counter()` for sections.',
      '`cProfile` (`python -m cProfile -s cumtime app.py`) shows where time is spent per function; view with `snakeviz`.',
      'Sampling profilers like `py-spy` attach to running processes with low overhead; `line_profiler` gives per-line timings.',
      'Memory: `tracemalloc` (stdlib), `memray`, `memory_profiler`.',
      'Fix the algorithm/data structure first (e.g. `set` lookups instead of list scans), then use built-ins, comprehensions and local variables.',
      'Bigger wins: NumPy/vectorisation, caching, Cython/Rust extensions, multiprocessing, or PyPy.',
    ],
    code: `import cProfile, pstats, timeit

print(timeit.timeit('sum(range(1000))', number=10_000))

cProfile.run('sorted(range(10**6), key=lambda x: -x)', 'out.prof')
pstats.Stats('out.prof').sort_stats('cumtime').print_stats(5)`,
  },
  {
    id: 'list-vs-deque-vs-array',
    group: 'Performance & Ecosystem',
    stars: 4,
    difficulty: 'Medium',
    q: 'When should you use a `list`, `collections.deque` or `array.array`?',
    a: [
      '`list`: dynamic array of object references; O(1) index and append, but O(n) insert/pop at the front.',
      '`deque`: doubly-linked list of blocks; O(1) append/pop at BOTH ends, O(n) indexing in the middle.',
      'Use `deque` for queues, BFS and sliding windows; `deque(maxlen=n)` keeps only the last n items.',
      '`array.array`: compact typed array of C numbers (e.g. `"i"`, `"d"`); far less memory than a list of ints.',
      'For numeric computation use NumPy arrays (vectorised operations).',
      '`heapq` gives a min-heap on a list; `bisect` keeps a list sorted.',
    ],
    code: `from collections import deque
from array import array

q = deque([1, 2, 3])
q.appendleft(0); q.pop()       # O(1) both ends
last3 = deque(maxlen=3)
for i in range(10): last3.append(i)
print(last3)                   # deque([7, 8, 9], maxlen=3)
nums = array('i', range(1000)) # compact ints`,
  },
  {
    id: 'other-functools',
    group: 'Performance & Ecosystem',
    stars: 3,
    difficulty: 'Medium',
    q: 'Which other `functools` and `itertools` helpers are worth knowing?',
    a: [
      '`functools.partial(f, x)` pre-fills arguments to create a new callable.',
      '`functools.reduce(f, xs, init)` folds an iterable into one value.',
      '`functools.singledispatch` gives function overloading by the type of the first argument.',
      '`functools.wraps` preserves metadata in decorators; `total_ordering` fills comparison methods.',
      '`itertools`: `chain`, `islice`, `groupby` (needs sorted input), `product`, `permutations`, `combinations`, `accumulate`, `batched` (3.12).',
      'These are implemented in C and lazy, so they are fast and memory-efficient.',
    ],
    code: `from functools import partial, reduce
from itertools import batched, groupby

pow2 = partial(pow, exp=2)
print(pow2(5))                                  # 25
print(reduce(lambda a, b: a * b, [1, 2, 3, 4])) # 24
print(list(batched('abcdefg', 3)))  # [('a','b','c'), ('d','e','f'), ('g',)]`,
  },
  {
    id: 'django-flask-fastapi',
    group: 'Performance & Ecosystem',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do Django, Flask and FastAPI compare?',
    a: [
      'Django: batteries-included full-stack framework (ORM, migrations, admin, auth, templates); best for large data-driven apps.',
      'Flask: minimal WSGI micro-framework; you pick your own ORM, validation and auth extensions.',
      'FastAPI: modern ASGI framework built on Starlette and Pydantic; async-first, high performance, ideal for APIs.',
      'FastAPI uses type hints for request validation, serialization and auto-generated OpenAPI/Swagger docs.',
      'Django supports async views and ASGI too, but its ORM is still largely sync; DRF is the standard for Django REST APIs.',
      'Choose: admin/CRUD-heavy product → Django; small service → Flask; high-concurrency JSON APIs/ML serving → FastAPI.',
    ],
    code: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post('/items')
async def create(item: Item):
    return {'ok': True, 'item': item}`,
  },
  {
    id: 'wsgi-vs-asgi',
    group: 'Performance & Ecosystem',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is the difference between WSGI and ASGI?',
    a: [
      'Both are interface standards between Python web servers and frameworks.',
      'WSGI (PEP 3333) is synchronous: one request per worker thread/process at a time; no native WebSockets.',
      'ASGI is the async successor: supports `async` handlers, WebSockets, HTTP/2, long-polling and lifespan events.',
      'WSGI servers: Gunicorn, uWSGI; frameworks: Flask, classic Django.',
      'ASGI servers: Uvicorn, Hypercorn, Daphne; frameworks: FastAPI, Starlette, Django (async).',
      'Production pattern: Gunicorn managing Uvicorn workers behind Nginx (or `uvicorn --workers N`).',
    ],
    code: `# WSGI app
def app(environ, start_response):
    start_response('200 OK', [('Content-Type', 'text/plain')])
    return [b'hello']

# ASGI app
async def asgi_app(scope, receive, send):
    await send({'type': 'http.response.start', 'status': 200, 'headers': []})
    await send({'type': 'http.response.body', 'body': b'hello'})`,
  },
  {
    id: 'pickling-serialization',
    group: 'Performance & Ecosystem',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is pickling and how does it compare with JSON?',
    a: [
      '`pickle` serialises almost any Python object graph to bytes (`dumps`/`loads`, `dump`/`load` for files).',
      'Functions and classes are pickled by reference (module + name), so they must be importable when unpickling; lambdas cannot be pickled.',
      'SECURITY: never unpickle untrusted data; it can execute arbitrary code.',
      'Pickle is Python-only; JSON is text, language-neutral and safe but supports only dicts, lists, strings, numbers, bools and null.',
      'Customise with `__getstate__`/`__setstate__` or `__reduce__`.',
      'Alternatives: `json`, `msgpack`, Protocol Buffers; `pydantic`/`dataclasses.asdict` for structured data.',
    ],
    code: `import pickle, json

data = {'id': 1, 'tags': {'a', 'b'}}   # set: not JSON-serialisable
blob = pickle.dumps(data)
print(pickle.loads(blob) == data)       # True
json.dumps({'id': 1, 'tags': ['a']})    # '{"id": 1, "tags": ["a"]}'`,
  },
];
