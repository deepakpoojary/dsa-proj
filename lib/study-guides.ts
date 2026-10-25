// Original study guides for the roadmap levers that the user's course
// doesn't cover. Each module: what to know (key points), what to do (tasks
// — these are the checkboxes that unlock money), and where to go deeper
// (official docs / well-known free resources only).

import type { Track } from './salary-roadmap';

export interface GuideResource {
  label: string;
  url: string;
}

export interface GuideModule {
  id: string;
  title: string;
  weight: number;
  points: string[];
  tasks: { id: string; title: string }[];
  resources: GuideResource[];
}

interface ModuleSpec {
  title: string;
  weight: number;
  points: string[];
  tasks: string[];
  resources: GuideResource[];
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function guide(key: string, specs: ModuleSpec[]): GuideModule[] {
  return specs.map((m) => {
    const id = `guide:${key}/${slug(m.title)}`;
    return {
      id,
      title: m.title,
      weight: m.weight,
      points: m.points,
      resources: m.resources,
      tasks: m.tasks.map((t) => ({ id: `${id}/${slug(t)}`, title: t })),
    };
  });
}

// ── Cloud & DevOps ──────────────────────────────────────────────────────────
const CLOUD = guide('cloud', [
  {
    title: 'AWS core: EC2, S3, IAM, VPC, RDS',
    weight: 35,
    points: [
      'IAM first: users, roles and policies. Services talk to each other through roles, never hard-coded keys. Least privilege is the interview answer every time.',
      'EC2 is a VM. Know instance families (t/m/c/r), AMIs, security groups (stateful firewall) and Auto Scaling Groups behind an ALB.',
      'S3 is object storage, not a filesystem. Know storage classes, presigned URLs, versioning, and that it is strongly consistent for reads after writes.',
      'VPC: public subnets route to an Internet Gateway, private subnets reach out through a NAT Gateway. Your DB always lives in a private subnet.',
      'RDS is managed Postgres/MySQL. Know Multi-AZ (failover) vs read replicas (scaling reads), automated backups and parameter groups.',
    ],
    tasks: [
      'Create an AWS free-tier account with MFA on root and an IAM admin user',
      'Launch an EC2 instance, SSH in, and serve a web page',
      'Upload a file to S3 and share it with a presigned URL',
      'Build a VPC with a public and a private subnet',
      'Connect an app on EC2 to an RDS database in the private subnet',
    ],
    resources: [
      { label: 'AWS Free Tier', url: 'https://aws.amazon.com/free/' },
      { label: 'AWS Skill Builder (free courses)', url: 'https://skillbuilder.aws/' },
      { label: 'roadmap.sh: AWS', url: 'https://roadmap.sh/aws' },
    ],
  },
  {
    title: 'Docker & containerisation',
    weight: 25,
    points: [
      'An image is a read-only layered filesystem plus metadata; a container is a running instance of it. Layers are cached, so order your Dockerfile from least to most frequently changing.',
      'Use multi-stage builds: compile in a fat image, copy only the artifact into a slim runtime image.',
      'Containers are ephemeral. Persist data in volumes, pass config through environment variables, and log to stdout.',
      'docker compose runs multi-container apps locally (app + DB + cache) with one command.',
    ],
    tasks: [
      'Write a multi-stage Dockerfile for one of your projects',
      'Run your app + database together with docker compose',
      'Push your image to Docker Hub or Amazon ECR',
    ],
    resources: [
      { label: 'Docker: Get started', url: 'https://docs.docker.com/get-started/' },
      { label: 'roadmap.sh: Docker', url: 'https://roadmap.sh/docker' },
    ],
  },
  {
    title: 'Kubernetes basics',
    weight: 20,
    points: [
      'Pod = one or more containers scheduled together. Deployment = desired number of identical pods with rolling updates. Service = stable network name in front of pods.',
      'ConfigMaps and Secrets inject config; liveness and readiness probes tell Kubernetes when to restart a pod or stop sending it traffic.',
      'Ingress routes external HTTP traffic to Services. HorizontalPodAutoscaler scales pods on CPU or custom metrics.',
      'For interviews, be able to explain what happens during a rolling deploy and how a bad deploy gets rolled back.',
    ],
    tasks: [
      'Run a local cluster (kind or minikube) and deploy your Docker image',
      'Expose it with a Service and roll out a new version',
      'Add readiness/liveness probes and watch a failing pod restart',
    ],
    resources: [
      { label: 'Kubernetes Basics tutorial', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/' },
      { label: 'roadmap.sh: Kubernetes', url: 'https://roadmap.sh/kubernetes' },
    ],
  },
  {
    title: 'CI/CD pipelines',
    weight: 20,
    points: [
      'CI = every push is built and tested automatically. CD = every green build can be (or is) deployed automatically.',
      'A good pipeline: lint → unit tests → build image → integration tests → deploy to staging → deploy to prod with approval.',
      'Know deploy strategies: rolling, blue-green, canary, and feature flags as a way to decouple deploy from release.',
    ],
    tasks: [
      'Add a GitHub Actions workflow that runs your tests on every PR',
      'Extend it to build and push a Docker image on merge to main',
      'Auto-deploy to a cloud host (EC2, Render, or Vercel) from the pipeline',
    ],
    resources: [
      { label: 'GitHub Actions docs', url: 'https://docs.github.com/en/actions' },
      { label: 'roadmap.sh: DevOps', url: 'https://roadmap.sh/devops' },
    ],
  },
]);

// ── AI / LLM engineering ────────────────────────────────────────────────────
const AI = guide('ai', [
  {
    title: 'Calling LLM APIs well',
    weight: 30,
    points: [
      'Use the official SDK. A request is a system prompt + messages; responses are content blocks you must narrow by type.',
      'Structured output: ask for JSON against a schema and validate it, instead of regex-parsing prose.',
      'Tool use: you describe functions, the model asks to call them, your code runs them and returns results. This is the basis of every agent.',
      'Production concerns: streaming for long outputs, retries with backoff on 429/5xx, timeouts, prompt caching to cut cost, and never trusting model output as code or SQL without checks.',
    ],
    tasks: [
      'Build a small CLI or endpoint that calls an LLM API with a system prompt',
      'Return validated structured JSON from a model call',
      'Implement one tool (e.g. weather or DB lookup) the model can call',
    ],
    resources: [
      { label: 'Claude API docs', url: 'https://platform.claude.com/docs' },
      { label: 'roadmap.sh: AI Engineer', url: 'https://roadmap.sh/ai-engineer' },
    ],
  },
  {
    title: 'RAG: retrieval-augmented generation',
    weight: 30,
    points: [
      'RAG = fetch relevant chunks from your own data and put them in the prompt, so the model answers from facts it was never trained on.',
      'Pipeline: chunk documents → embed chunks → store vectors → embed the query → nearest-neighbour search → (optionally) rerank → prompt with top chunks.',
      'Chunk size and overlap matter more than the vector DB. Hybrid search (keyword + vector) beats pure vector search on names, codes and IDs.',
      'Always show sources/citations, and measure retrieval quality separately from answer quality.',
    ],
    tasks: [
      'Build a "chat with your docs" app over a folder of PDFs or markdown',
      'Store embeddings in pgvector or a vector DB and query them',
      'Add citations so every answer links to the chunk it came from',
    ],
    resources: [
      { label: 'pgvector (Postgres vector search)', url: 'https://github.com/pgvector/pgvector' },
      { label: 'roadmap.sh: AI Engineer', url: 'https://roadmap.sh/ai-engineer' },
    ],
  },
  {
    title: 'Agents & workflows',
    weight: 20,
    points: [
      'Start with a workflow (fixed steps your code controls). Reach for an agent (model decides the steps in a tool loop) only when the path cannot be specified up front.',
      'An agent loop: call model → if it requested tools, run them, append results, repeat → stop when it answers or hits a step/cost budget.',
      'Guardrails: limit tools to what the task needs, require human approval for destructive actions, log every step.',
    ],
    tasks: [
      'Build an agent loop with two tools and a step limit',
      'Add an approval gate before any action that writes data',
    ],
    resources: [
      { label: 'Claude API docs: tool use', url: 'https://platform.claude.com/docs' },
    ],
  },
  {
    title: 'Evals, cost & latency',
    weight: 20,
    points: [
      'An eval is a fixed set of inputs + a way to grade outputs (exact match, rubric, or LLM-as-judge). Without one you cannot tell whether a prompt change helped.',
      'Track cost per completed task, not per request. Caching, smaller models for easy sub-steps, and shorter prompts are the main levers.',
      'Latency: stream tokens to the UI, run independent calls in parallel, and cache repeated prefixes.',
    ],
    tasks: [
      'Write a 20-case eval for one of your LLM features and score it',
      'Log tokens and cost per request and cut cost by 30% without losing eval score',
    ],
    resources: [
      { label: 'Claude API docs', url: 'https://platform.claude.com/docs' },
    ],
  },
]);

// ── Projects, resume & profile ──────────────────────────────────────────────
const PROOF = guide('proof', [
  {
    title: 'Resume with measured impact',
    weight: 30,
    points: [
      'One page. Every bullet = action + what you built + measurable result ("Cut API p95 latency from 900ms to 120ms by adding Redis caching").',
      'Put skills that match the job description near the top; recruiters spend seconds on a first pass and ATS filters on keywords.',
      'No photos, no rating bars, no "hardworking team player". Numbers and scale (users, requests/sec, data size) do the talking.',
    ],
    tasks: [
      'Rewrite every resume bullet with a number in it',
      'Get your resume reviewed by two engineers at product companies',
    ],
    resources: [
      { label: 'Tech Interview Handbook: Resume', url: 'https://www.techinterviewhandbook.org/resume/' },
    ],
  },
  {
    title: 'One deployed, non-tutorial project',
    weight: 40,
    points: [
      'Interviewers can tell a tutorial clone in seconds. Pick a problem you actually have and solve it end to end.',
      'Show engineering, not just features: auth, a real database, caching, background jobs, tests, CI, and a live URL.',
      'Be ready to talk trade-offs: why this DB, what breaks at 100x traffic, what you would change.',
    ],
    tasks: [
      'Pick a project idea that solves a real problem you have',
      'Ship it to a live URL with auth and a real database',
      'Add tests + CI and write a README with an architecture diagram',
    ],
    resources: [
      { label: 'roadmap.sh: project ideas', url: 'https://roadmap.sh/projects' },
    ],
  },
  {
    title: 'LinkedIn & referrals pipeline',
    weight: 30,
    points: [
      'Referrals convert to interviews several times better than cold applications. Treat it as a pipeline with a weekly target.',
      'Ask specifically: send the job link, your resume, and a 3-line summary of why you fit. Make it easy to say yes.',
      'Headline = role + stack + one result. Recruiters search by keywords, so your skills section matters.',
    ],
    tasks: [
      'Update LinkedIn headline, about section and skills',
      'Make a list of 30 target companies',
      'Send 10 referral requests this week',
    ],
    resources: [
      { label: 'Tech Interview Handbook', url: 'https://www.techinterviewhandbook.org/' },
    ],
  },
]);

// ── Negotiation ─────────────────────────────────────────────────────────────
const NEGOTIATION = guide('negotiation', [
  {
    title: 'Research the band',
    weight: 25,
    points: [
      'Know the band for the role and level before the first recruiter call. Levels matter more than titles: SDE-2 at one company may be SDE-1 pay at another.',
      'Separate fixed pay, joining bonus, variable and ESOPs/RSUs. A big "CTC" with mostly unvested stock is not the same as cash.',
    ],
    tasks: [
      'Look up bands for 5 target companies at your level',
      'Write down your walk-away number and your target number',
    ],
    resources: [
      { label: 'levels.fyi', url: 'https://www.levels.fyi/' },
      { label: 'AmbitionBox salaries', url: 'https://www.ambitionbox.com/salaries' },
    ],
  },
  {
    title: 'Batch interviews so offers land together',
    weight: 35,
    points: [
      'Competing offers are the strongest lever you have. Line up interviews so final rounds happen within the same 2–3 weeks.',
      'Ask early how long each company\'s process takes, and slow down or speed up rounds to sync them.',
      'Do your least-wanted companies first as practice.',
    ],
    tasks: [
      'Schedule at least 3 companies\' processes to overlap',
      'Do 2 low-stakes interviews as warm-up before your target companies',
    ],
    resources: [
      { label: 'Tech Interview Handbook: Negotiation', url: 'https://www.techinterviewhandbook.org/negotiation/' },
    ],
  },
  {
    title: 'Counter-offers',
    weight: 40,
    points: [
      'Don\'t give the first number. If pushed: "I\'m looking for a competitive offer for this level; what\'s the band?"',
      'Counter on the total, then let them choose the component (base, joining bonus, stock). Always counter at least once; it is expected.',
      'Be polite, specific and in writing: "I have an offer at ₹X. I\'d prefer to join you; can you get to ₹Y?"',
    ],
    tasks: [
      'Write your counter-offer email template',
      'Practise the "what are your expectations?" answer out loud',
    ],
    resources: [
      { label: 'Tech Interview Handbook: Negotiation', url: 'https://www.techinterviewhandbook.org/negotiation/' },
    ],
  },
]);

// ── Stack depth (per track) ─────────────────────────────────────────────────
const LANG_MODULE: Record<string, ModuleSpec> = {
  java: {
    title: 'Java internals',
    weight: 30,
    points: [
      'Collections: HashMap internals (buckets, treeification, resize), ConcurrentHashMap vs synchronized map, ArrayList vs LinkedList costs.',
      'JVM memory: heap vs stack, generational GC, G1/ZGC basics, and how to read a GC log or heap dump when memory leaks.',
      'Concurrency: threads vs ExecutorService, CompletableFuture, volatile, synchronized vs locks, and virtual threads (Java 21).',
      'Spring Boot: dependency injection, bean lifecycle and scopes, @Transactional proxies (and why self-invocation skips them).',
    ],
    tasks: [
      'Explain HashMap put/get internals from memory',
      'Fix a race condition using ExecutorService + proper locking',
      'Profile a Spring Boot app and find one slow query or hot method',
    ],
    resources: [
      { label: 'Oracle: Java concurrency tutorial', url: 'https://docs.oracle.com/javase/tutorial/essential/concurrency/' },
      { label: 'roadmap.sh: Java', url: 'https://roadmap.sh/java' },
      { label: 'roadmap.sh: Spring Boot', url: 'https://roadmap.sh/spring-boot' },
    ],
  },
  node: {
    title: 'Node.js internals',
    weight: 30,
    points: [
      'Event loop phases (timers, poll, check), microtasks vs macrotasks, and why process.nextTick and Promise callbacks run before setTimeout.',
      'Blocking the event loop kills throughput. Move CPU work to worker_threads or a queue.',
      'Streams and backpressure for large files and responses; cluster mode or multiple processes to use all cores.',
    ],
    tasks: [
      'Predict the output order of a mixed setTimeout/Promise/nextTick snippet',
      'Process a 1 GB file with streams without running out of memory',
      'Find and fix an event-loop block using a profiler',
    ],
    resources: [
      { label: 'Node.js: the event loop', url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick' },
      { label: 'roadmap.sh: Node.js', url: 'https://roadmap.sh/nodejs' },
    ],
  },
  python: {
    title: 'Python internals',
    weight: 30,
    points: [
      'The GIL: threads help for I/O-bound work, not CPU-bound work; use multiprocessing or native extensions for CPU.',
      'asyncio: event loop, coroutines, tasks, and why one blocking call stalls every coroutine.',
      'Memory: reference counting + cyclic GC, mutable default arguments, generators for lazy pipelines.',
      'Framework internals: Django ORM N+1 queries (select_related/prefetch_related) or FastAPI dependency injection and async routes.',
    ],
    tasks: [
      'Rewrite a slow I/O script with asyncio and measure the speedup',
      'Find and fix an N+1 query in an ORM-based endpoint',
    ],
    resources: [
      { label: 'Python docs: asyncio', url: 'https://docs.python.org/3/library/asyncio.html' },
      { label: 'roadmap.sh: Python', url: 'https://roadmap.sh/python' },
    ],
  },
  go: {
    title: 'Go internals',
    weight: 30,
    points: [
      'Goroutines are cheap, scheduled M:N onto OS threads. Channels for communication, sync.Mutex/WaitGroup for shared state.',
      'context.Context for cancellation and deadlines through every call chain.',
      'Escape analysis and GC basics; avoid goroutine leaks by always having an exit path.',
    ],
    tasks: [
      'Build a worker pool with channels and graceful shutdown via context',
      'Detect a data race with go test -race and fix it',
    ],
    resources: [
      { label: 'A Tour of Go', url: 'https://go.dev/tour/' },
      { label: 'roadmap.sh: Go', url: 'https://roadmap.sh/golang' },
    ],
  },
  dotnet: {
    title: '.NET internals',
    weight: 30,
    points: [
      'CLR basics: JIT, value vs reference types, GC generations and the large object heap.',
      'async/await: the state machine, ConfigureAwait, and avoiding sync-over-async deadlocks.',
      'ASP.NET Core: middleware pipeline, dependency injection lifetimes (singleton/scoped/transient), EF Core tracking and N+1.',
    ],
    tasks: [
      'Explain DI lifetimes and the captive-dependency bug',
      'Profile an endpoint and remove one allocation hotspot',
    ],
    resources: [
      { label: 'roadmap.sh: ASP.NET Core', url: 'https://roadmap.sh/aspnet-core' },
    ],
  },
};

const GENERIC_LANG: ModuleSpec = {
  title: 'Your primary language, in depth',
  weight: 30,
  points: [
    'Know how your language manages memory, concurrency and errors, not just its syntax.',
    'Be able to explain the internals of its core collections (hash map, dynamic array) and their costs.',
    'Know the standard testing, profiling and debugging tools for it.',
  ],
  tasks: [
    'Pick one language and read its official concurrency guide',
    'Profile a program and fix one hotspot',
  ],
  resources: [{ label: 'roadmap.sh: Backend', url: 'https://roadmap.sh/backend' }],
};

const SQL_MODULE: ModuleSpec = {
  title: 'Advanced SQL & data modelling',
  weight: 25,
  points: [
    'Indexes: B-tree basics, composite index column order, covering indexes, and when an index is ignored (functions on columns, low selectivity, leading wildcard).',
    'Read EXPLAIN plans: seq scan vs index scan, nested loop vs hash join, row estimates vs actuals.',
    'Transactions and isolation levels (read committed, repeatable read, serializable), and the anomalies each prevents.',
    'Locking: row locks, SELECT ... FOR UPDATE, deadlocks and how to avoid them with consistent lock ordering.',
  ],
  tasks: [
    'Speed up a slow query 10x with an index and prove it with EXPLAIN ANALYZE',
    'Write window-function queries (ROW_NUMBER, running totals, LAG)',
    'Reproduce a deadlock between two transactions and fix it',
  ],
  resources: [
    { label: 'Use The Index, Luke', url: 'https://use-the-index-luke.com/' },
    { label: 'roadmap.sh: SQL', url: 'https://roadmap.sh/sql' },
  ],
};

const API_MODULE: ModuleSpec = {
  title: 'API design & auth',
  weight: 20,
  points: [
    'REST: resource naming, correct status codes, idempotency (PUT/DELETE, idempotency keys for POST payments), cursor vs offset pagination.',
    'Auth: sessions vs JWT (and why JWT revocation is hard), OAuth 2.0 authorization code + PKCE, hashing passwords with bcrypt/argon2.',
    'Versioning, rate limiting, and consistent error shapes.',
  ],
  tasks: [
    'Design a REST API for a small product with cursor pagination',
    'Implement login with hashed passwords + refresh tokens',
  ],
  resources: [
    { label: 'roadmap.sh: API design', url: 'https://roadmap.sh/api-design' },
  ],
};

const CACHE_MODULE: ModuleSpec = {
  title: 'Redis, caching & background jobs',
  weight: 15,
  points: [
    'Cache-aside is the default pattern; set TTLs and handle cache stampedes (locking or jittered expiry).',
    'Redis data structures beyond strings: hashes, sorted sets (leaderboards), streams, and pub/sub.',
    'Push slow work (emails, reports, webhooks) to a queue with retries and dead-letter handling.',
  ],
  tasks: [
    'Add cache-aside Redis caching to an endpoint and measure latency',
    'Move one slow operation to a background job with retries',
  ],
  resources: [
    { label: 'Redis docs', url: 'https://redis.io/docs/latest/' },
  ],
};

const TESTING_MODULE: ModuleSpec = {
  title: 'Testing & observability',
  weight: 10,
  points: [
    'Test pyramid: many fast unit tests, fewer integration tests (real DB in a container), a few end-to-end tests.',
    'Observability = logs (what happened), metrics (how much/how fast), traces (where time went across services).',
  ],
  tasks: [
    'Add integration tests that run against a real database',
    'Add request latency metrics and a dashboard',
  ],
  resources: [
    { label: 'Prometheus: overview', url: 'https://prometheus.io/docs/introduction/overview/' },
  ],
};

const JS_MODULE: ModuleSpec = {
  title: 'JavaScript internals',
  weight: 30,
  points: [
    'Closures, scope and hoisting; how `this` is bound (call site, arrow functions, bind).',
    'Prototypes and classes; the event loop, microtasks vs macrotasks.',
    'Implement-it-yourself questions are common: debounce, throttle, Promise.all, deep clone, curry.',
  ],
  tasks: [
    'Implement debounce, throttle and Promise.all from scratch',
    'Explain `this` in 5 different call patterns without running the code',
  ],
  resources: [
    { label: 'javascript.info', url: 'https://javascript.info/' },
    { label: 'roadmap.sh: JavaScript', url: 'https://roadmap.sh/javascript' },
  ],
};

const REACT_MODULE: ModuleSpec = {
  title: 'React internals & performance',
  weight: 25,
  points: [
    'Rendering: what triggers a re-render, reconciliation and keys, and why most performance problems are unnecessary renders.',
    'Hooks rules and pitfalls: stale closures, effect dependencies, and when you don\'t need an effect at all.',
    'memo / useMemo / useCallback only where profiling shows a cost; code-splitting and lazy loading for bundle size.',
  ],
  tasks: [
    'Profile a React app with React DevTools and remove 3 unnecessary re-renders',
    'Build a virtualized list that renders 10,000 rows smoothly',
  ],
  resources: [
    { label: 'react.dev: Learn', url: 'https://react.dev/learn' },
    { label: 'roadmap.sh: React', url: 'https://roadmap.sh/react' },
  ],
};

const FE_SD_MODULE: ModuleSpec = {
  title: 'Frontend system design',
  weight: 20,
  points: [
    'Common questions: design an autocomplete, a news feed, an image carousel, a chat UI, or a design system.',
    'Talk through: component tree, state ownership (server vs client state), data fetching and caching, pagination, offline/optimistic updates, accessibility.',
  ],
  tasks: [
    'Design and build an autocomplete with debouncing, caching and keyboard navigation',
    'Write a one-page design doc for an infinite-scroll feed',
  ],
  resources: [
    { label: 'roadmap.sh: Frontend', url: 'https://roadmap.sh/frontend' },
  ],
};

const BROWSER_MODULE: ModuleSpec = {
  title: 'Browser & Web Vitals',
  weight: 15,
  points: [
    'Critical rendering path: HTML → DOM, CSS → CSSOM, layout, paint, composite. Layout thrashing comes from reading layout right after writing styles.',
    'Core Web Vitals: LCP (load), INP (responsiveness), CLS (visual stability), and the common fix for each.',
  ],
  tasks: [
    'Run Lighthouse on your project and fix the top 3 issues',
  ],
  resources: [
    { label: 'web.dev: Web Vitals', url: 'https://web.dev/articles/vitals' },
  ],
};

const TS_TEST_MODULE: ModuleSpec = {
  title: 'TypeScript & testing',
  weight: 10,
  points: [
    'Generics, union narrowing, utility types (Partial, Pick, Record) and discriminated unions for state.',
    'Test behaviour, not implementation: React Testing Library for components, Playwright for user flows.',
  ],
  tasks: [
    'Type a reducer with a discriminated union',
    'Write a Playwright test for your app\'s main flow',
  ],
  resources: [
    { label: 'TypeScript handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
  ],
};

function trackModules(track: Track, lang: string | null): ModuleSpec[] {
  const langModule = (lang && LANG_MODULE[lang]) || GENERIC_LANG;
  switch (track) {
    case 'backend':
      return [langModule, SQL_MODULE, API_MODULE, CACHE_MODULE, TESTING_MODULE];
    case 'frontend':
      return [JS_MODULE, REACT_MODULE, FE_SD_MODULE, BROWSER_MODULE, TS_TEST_MODULE];
    case 'fullstack':
      return [lang && lang !== 'node' ? langModule : JS_MODULE, REACT_MODULE, SQL_MODULE, API_MODULE, CACHE_MODULE];
    case 'mobile':
      return [
        {
          title: 'Platform internals',
          weight: 30,
          points: [
            'Activity/Fragment (Android) or view controller/SwiftUI view (iOS) lifecycles, and what survives configuration changes.',
            'Threading: never block the main thread; coroutines (Kotlin), async/await and actors (Swift).',
            'Memory leaks: retained contexts, retain cycles, and how to find them with the platform profiler.',
          ],
          tasks: ['Find and fix a memory leak with the platform profiler', 'Move a blocking call off the main thread'],
          resources: [
            { label: 'roadmap.sh: Android', url: 'https://roadmap.sh/android' },
            { label: 'roadmap.sh: iOS', url: 'https://roadmap.sh/ios' },
            { label: 'roadmap.sh: Flutter', url: 'https://roadmap.sh/flutter' },
          ],
        },
        {
          title: 'App architecture',
          weight: 25,
          points: ['MVVM or Clean Architecture with a single source of truth for state.', 'Dependency injection (Hilt/Koin, or Swift protocols) for testability.'],
          tasks: ['Refactor one screen to MVVM with unit-tested view model'],
          resources: [{ label: 'Android: guide to app architecture', url: 'https://developer.android.com/topic/architecture' }],
        },
        {
          title: 'Performance, offline & release',
          weight: 25,
          points: ['Cold start time, jank (dropped frames) and app size are what users notice.', 'Offline-first: local DB as source of truth, sync in the background, resolve conflicts.'],
          tasks: ['Measure and cut cold start time', 'Add offline caching to one screen'],
          resources: [{ label: 'roadmap.sh: Android', url: 'https://roadmap.sh/android' }],
        },
        API_MODULE,
      ];
    case 'data':
      return [
        SQL_MODULE,
        {
          title: 'Spark internals',
          weight: 25,
          points: ['Narrow vs wide transformations; shuffles are the expensive part.', 'Partitioning, skew handling (salting), broadcast joins, caching.'],
          tasks: ['Read a Spark UI and fix a skewed join', 'Tune partitions for a large job'],
          resources: [{ label: 'Apache Spark docs', url: 'https://spark.apache.org/docs/latest/' }],
        },
        {
          title: 'Pipelines & orchestration',
          weight: 20,
          points: ['Idempotent, re-runnable tasks; backfills; data contracts between producers and consumers.', 'Airflow DAGs or dbt models with tests on every model.'],
          tasks: ['Build an Airflow or dbt pipeline with data quality tests'],
          resources: [{ label: 'Apache Airflow docs', url: 'https://airflow.apache.org/docs/' }],
        },
        {
          title: 'Streaming basics',
          weight: 15,
          points: ['Kafka topics, partitions, consumer groups and offsets; at-least-once vs exactly-once.', 'Windowing and late data in stream processing.'],
          tasks: ['Run Kafka locally and build a producer + consumer'],
          resources: [{ label: 'Apache Kafka docs', url: 'https://kafka.apache.org/documentation/' }],
        },
      ];
    case 'devops':
      return [
        {
          title: 'Infrastructure as code',
          weight: 30,
          points: ['Terraform state, modules, plan/apply, and remote state locking.', 'Never click-ops production; review infra changes like code.'],
          tasks: ['Provision a VPC + app server with Terraform', 'Split it into reusable modules'],
          resources: [{ label: 'Terraform tutorials', url: 'https://developer.hashicorp.com/terraform/tutorials' }],
        },
        {
          title: 'Observability & SRE',
          weight: 30,
          points: ['SLIs, SLOs and error budgets; alert on symptoms users feel, not on every CPU spike.', 'Prometheus metrics, Grafana dashboards, distributed tracing.'],
          tasks: ['Define an SLO for one service and alert on burn rate'],
          resources: [{ label: 'Prometheus: overview', url: 'https://prometheus.io/docs/introduction/overview/' }],
        },
        {
          title: 'Linux & networking',
          weight: 25,
          points: ['Processes, signals, file descriptors, systemd; debugging with top, ss, strace, journalctl.', 'DNS, TCP handshake, TLS, load balancer health checks.'],
          tasks: ['Debug a "connection refused" end to end and write down each check'],
          resources: [{ label: 'roadmap.sh: Linux', url: 'https://roadmap.sh/linux' }],
        },
        TESTING_MODULE,
      ];
    case 'qa':
      return [
        GENERIC_LANG,
        {
          title: 'Automation framework design',
          weight: 25,
          points: ['Page Object Model, fixtures, parallel runs, and flaky-test handling.', 'Playwright auto-waiting vs explicit waits in Selenium.'],
          tasks: ['Build a Playwright suite with page objects that runs in CI'],
          resources: [{ label: 'Playwright docs', url: 'https://playwright.dev/docs/intro' }],
        },
        {
          title: 'API & performance testing',
          weight: 25,
          points: ['Contract tests catch breaking API changes early.', 'Load tests: ramp-up, steady state, p95/p99 latency, error rate.'],
          tasks: ['Write API tests for a public API', 'Run a k6 load test and report p95 latency'],
          resources: [{ label: 'k6 docs', url: 'https://grafana.com/docs/k6/latest/' }],
        },
        TESTING_MODULE,
      ];
    default:
      return [GENERIC_LANG, SQL_MODULE, API_MODULE, TESTING_MODULE];
  }
}

export function getGuide(key: string, track: Track = 'general', lang: string | null = null): GuideModule[] | null {
  switch (key) {
    case 'cloud': return CLOUD;
    case 'ai': return AI;
    case 'proof': return PROOF;
    case 'negotiation': return NEGOTIATION;
    case 'stack-depth': return guide(`stack-${track}-${lang ?? 'any'}`, trackModules(track, lang));
    default: return null;
  }
}
