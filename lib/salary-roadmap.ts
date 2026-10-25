// Salary roadmap: turns (current CTC, YOE, stack, target CTC) into a list of
// skills, each priced in LPA, so every hour of study has money attached.
//
// All figures are Indian-market LPA. The bands below are deliberately
// conservative — they describe what a well-prepared candidate actually
// clears at a solid product company, not outlier offers.

export interface RoadmapInput {
  currentCtc: number;   // LPA
  yoe: number;          // years
  stack: string;        // free text, e.g. "Java, Spring Boot, MySQL"
  targetCtc: number;    // LPA
  hoursPerWeek: number; // study time available
}

export interface RoadmapSubtopic {
  name: string;
  lpa: number;
  hours: number;
  link?: string;
}

export interface RoadmapLever {
  key: string;
  name: string;
  lpa: number;
  hours: number;
  why: string;
  subtopics: RoadmapSubtopic[];
  link?: string;
}

export interface RoadmapHop {
  ctc: number;
  when: string;
  note: string;
}

export type RoadmapVerdict = 'on-track' | 'stretch' | 'multi-hop' | 'above-market';

export interface Roadmap {
  source: 'ai' | 'rules';
  track: Track;
  language: string | null;
  verdict: RoadmapVerdict;
  headline: string;
  currentCtc: number;
  targetCtc: number;
  reachableCtc: number;   // what the next switch can realistically pay
  marketCeiling: number;  // solid product company band for this YOE
  stretchCeiling: number; // top-tier band for this YOE
  months: number;
  levers: RoadmapLever[];
  hops: RoadmapHop[];
  warnings: string[];
}

export type Track = 'backend' | 'frontend' | 'fullstack' | 'mobile' | 'data' | 'devops' | 'qa' | 'general';

// ── Market bands ────────────────────────────────────────────────────────────
// [yoe, solid product company (well prepared), top-tier product / FAANG-level]
const BANDS: [number, number, number][] = [
  [0, 12, 24],
  [1, 16, 30],
  [2, 22, 38],
  [3, 28, 45],
  [4, 34, 55],
  [5, 40, 62],
  [6, 45, 70],
  [8, 55, 85],
  [10, 65, 100],
  [15, 80, 130],
];

export function marketBand(yoe: number): { solid: number; top: number } {
  const y = Math.max(0, yoe);
  for (let i = 0; i < BANDS.length - 1; i++) {
    const [y0, s0, t0] = BANDS[i];
    const [y1, s1, t1] = BANDS[i + 1];
    if (y <= y1) {
      const f = (y - y0) / (y1 - y0);
      return { solid: s0 + f * (s1 - s0), top: t0 + f * (t1 - t0) };
    }
  }
  const last = BANDS[BANDS.length - 1];
  return { solid: last[1], top: last[2] };
}

// ── Stack parsing ───────────────────────────────────────────────────────────
const has = (s: string, words: string[]) => words.some((w) => new RegExp(`(^|[^a-z])${w}([^a-z]|$)`).test(s));

export function detectTrack(stack: string): Track {
  const s = stack.toLowerCase();
  const fe = has(s, ['react', 'angular', 'vue', 'next', 'nextjs', 'frontend', 'html', 'css', 'svelte', 'redux']);
  const be = has(s, ['java', 'spring', 'node', 'express', 'django', 'flask', 'fastapi', 'go', 'golang', 'backend', 'php', 'laravel', '\\.net', 'c#', 'rails', 'nestjs', 'microservices']);
  if (has(s, ['android', 'ios', 'kotlin', 'swift', 'flutter', 'react native'])) return 'mobile';
  if (has(s, ['spark', 'airflow', 'etl', 'data engineer', 'pandas', 'ml', 'pyspark', 'snowflake', 'databricks', 'tableau', 'power bi'])) return 'data';
  if (has(s, ['devops', 'sre', 'terraform', 'jenkins', 'ansible']) && !fe && !be) return 'devops';
  if (has(s, ['selenium', 'testing', 'qa', 'manual testing', 'cypress', 'playwright', 'automation'])) return 'qa';
  if (fe && be) return 'fullstack';
  if (fe) return 'frontend';
  if (be) return 'backend';
  return 'general';
}

export function primaryLanguage(stack: string): string | null {
  const s = stack.toLowerCase();
  if (has(s, ['java', 'spring'])) return 'java';
  if (has(s, ['node', 'express', 'nestjs', 'typescript', 'javascript', 'js'])) return 'node';
  if (has(s, ['python', 'django', 'flask', 'fastapi'])) return 'python';
  if (has(s, ['go', 'golang'])) return 'go';
  if (has(s, ['c#', '\\.net'])) return 'dotnet';
  return null;
}

// ── Lever catalogue ─────────────────────────────────────────────────────────
interface SubtopicSpec { name: string; w: number; link?: string }

interface LeverSpec {
  key: string;
  name: string;
  hours: number;
  link?: string;
  why: string;
  subtopics: SubtopicSpec[];
}

const DSA: LeverSpec = {
  key: 'dsa',
  name: 'DSA & problem solving',
  hours: 180,
  link: '/',
  why: 'The gate to product-company interviews. Without it you only get service-company offers, so most of the jump depends on it.',
  subtopics: [
    { name: 'Arrays & Hashing', w: 12, link: '/' },
    { name: 'Two Pointers & Sliding Window', w: 10, link: '/' },
    { name: 'Stack & Monotonic Stack', w: 6, link: '/' },
    { name: 'Binary Search', w: 8, link: '/' },
    { name: 'Linked List', w: 5, link: '/' },
    { name: 'Trees & BST', w: 12, link: '/' },
    { name: 'Heaps / Priority Queue', w: 6, link: '/' },
    { name: 'Graphs (BFS, DFS, Topo sort)', w: 12, link: '/' },
    { name: 'Backtracking', w: 6, link: '/' },
    { name: 'Dynamic Programming', w: 15, link: '/' },
    { name: 'Greedy & Intervals', w: 8, link: '/' },
  ],
};

const HLD: LeverSpec = {
  key: 'system-design',
  name: 'System Design (HLD)',
  hours: 80,
  why: 'From ~2 YOE onwards, the system design round decides your level (SDE-1 vs SDE-2 vs Senior), and the level decides the band.',
  subtopics: [
    { name: 'Scaling basics: load balancers, horizontal scaling, CDN', w: 14 },
    { name: 'Caching strategies (Redis, write-through/back, eviction)', w: 14 },
    { name: 'Databases: SQL vs NoSQL, indexing, replication, sharding', w: 20 },
    { name: 'Message queues & async processing (Kafka, RabbitMQ)', w: 14 },
    { name: 'Consistency, CAP, idempotency, rate limiting', w: 14 },
    { name: 'Classic designs: URL shortener, feed, chat, payments', w: 24 },
  ],
};

const LLD: LeverSpec = {
  key: 'lld',
  name: 'Low-Level Design & machine coding',
  hours: 50,
  why: 'Flipkart, Swiggy, PhonePe, Uber and others run a machine-coding/LLD round. Failing it costs you the offer even if DSA goes well.',
  subtopics: [
    { name: 'OOP & SOLID principles', w: 25 },
    { name: 'Design patterns (Strategy, Factory, Observer, Singleton)', w: 30 },
    { name: 'Machine coding: parking lot, splitwise, elevator, LRU cache', w: 45 },
  ],
};

const CORE_CS: LeverSpec = {
  key: 'core-cs',
  name: 'Core CS fundamentals',
  hours: 45,
  link: '/theory',
  why: 'Early-career interviews ask OS, DBMS and networking theory. These are cheap points because the questions repeat.',
  subtopics: [
    { name: 'DBMS: normalization, transactions, ACID, indexing', w: 35, link: '/theory' },
    { name: 'Operating Systems: processes, threads, deadlocks, memory', w: 35, link: '/theory' },
    { name: 'Computer Networks: HTTP, TCP/UDP, DNS, TLS', w: 30, link: '/theory' },
  ],
};

function stackDepthLever(track: Track, stack: string): LeverSpec {
  const lang = primaryLanguage(stack);
  const langTopic: Record<string, string> = {
    java: 'Java internals: collections, JVM & GC, concurrency, Spring Boot internals',
    node: 'Node.js internals: event loop, streams, async patterns, performance',
    python: 'Python internals: GIL, asyncio, memory model, Django/FastAPI internals',
    go: 'Go internals: goroutines, channels, scheduler, memory model',
    dotnet: '.NET internals: CLR, async/await, LINQ, ASP.NET Core pipeline',
  };
  const subtopicsByTrack: Record<Track, SubtopicSpec[]> = {
    backend: [
      { name: lang ? langTopic[lang] : 'Your primary language, in depth', w: 30 },
      { name: 'Advanced SQL: query plans, indexing, locking', w: 25 },
      { name: 'API design: REST, pagination, auth (JWT/OAuth), versioning', w: 20 },
      { name: 'Redis, caching & background jobs in production', w: 15 },
      { name: 'Testing & observability (unit/integration, logs, metrics)', w: 10 },
    ],
    frontend: [
      { name: 'JavaScript internals: closures, event loop, prototypes, this', w: 30 },
      { name: 'React internals: reconciliation, hooks, memoization, rendering perf', w: 25 },
      { name: 'Frontend system design: state management, caching, micro-frontends', w: 20 },
      { name: 'Browser & Web Vitals: rendering pipeline, bundle size, lazy loading', w: 15 },
      { name: 'TypeScript & testing (Jest, RTL, Playwright)', w: 10 },
    ],
    fullstack: [
      { name: lang ? langTopic[lang] : 'Backend language internals', w: 25 },
      { name: 'JavaScript & React internals', w: 25 },
      { name: 'Advanced SQL & data modelling', w: 20 },
      { name: 'API design & auth (JWT/OAuth)', w: 15 },
      { name: 'Performance & testing across the stack', w: 15 },
    ],
    mobile: [
      { name: 'Platform internals: lifecycle, threading, memory', w: 30 },
      { name: 'Architecture: MVVM / Clean, dependency injection', w: 25 },
      { name: 'Performance: startup time, jank, app size', w: 20 },
      { name: 'Offline sync, caching & networking layer', w: 15 },
      { name: 'Testing & release (CI, crash analytics)', w: 10 },
    ],
    data: [
      { name: 'Advanced SQL & data modelling (star schema, SCDs)', w: 30 },
      { name: 'Spark internals: partitions, shuffles, tuning', w: 25 },
      { name: 'Orchestration & pipelines (Airflow, dbt)', w: 20 },
      { name: 'Streaming (Kafka, Flink) basics', w: 15 },
      { name: 'Data quality & warehouse design (Snowflake/BigQuery)', w: 10 },
    ],
    devops: [
      { name: 'Kubernetes in depth: networking, scheduling, operators', w: 30 },
      { name: 'Terraform / IaC at scale', w: 25 },
      { name: 'Observability: Prometheus, Grafana, tracing, SLOs', w: 20 },
      { name: 'CI/CD design & release strategies', w: 15 },
      { name: 'Linux & networking deep dive', w: 10 },
    ],
    qa: [
      { name: 'Programming for automation (Java/TS/Python), properly', w: 30 },
      { name: 'Automation frameworks: Playwright / Selenium architecture', w: 25 },
      { name: 'API testing & contract testing', w: 20 },
      { name: 'Performance testing (JMeter, k6)', w: 15 },
      { name: 'CI integration & test strategy', w: 10 },
    ],
    general: [
      { name: 'One backend language, in depth', w: 30 },
      { name: 'SQL & data modelling', w: 25 },
      { name: 'Building and shipping REST APIs', w: 25 },
      { name: 'Git, testing & code quality', w: 20 },
    ],
  };
  return {
    key: 'stack-depth',
    name: `${track === 'general' ? 'Core' : track[0].toUpperCase() + track.slice(1)} stack depth`,
    hours: 70,
    why: 'Interviewers spend a full round on your own stack. Knowing how it works inside, not just how to use it, is what separates you from other candidates at the same YOE.',
    subtopics: subtopicsByTrack[track],
  };
}

const CLOUD: LeverSpec = {
  key: 'cloud',
  name: 'Cloud & DevOps',
  hours: 45,
  why: 'Teams expect you to deploy and run what you build. Hands-on AWS and Docker make you a better fit for more teams and give you something to talk about in interviews.',
  subtopics: [
    { name: 'AWS core: EC2, S3, IAM, VPC, RDS', w: 35 },
    { name: 'Docker & containerisation', w: 25 },
    { name: 'Kubernetes basics', w: 20 },
    { name: 'CI/CD pipelines (GitHub Actions)', w: 20 },
  ],
};

const AI: LeverSpec = {
  key: 'ai',
  name: 'AI / LLM engineering',
  hours: 40,
  why: 'In 2026 most product teams are shipping LLM features. Engineers who can build RAG, agents and evals are paid more, and few candidates can do it yet.',
  subtopics: [
    { name: 'Calling LLM APIs: prompting, structured output, tool use', w: 30 },
    { name: 'RAG: embeddings, vector DBs, chunking', w: 30 },
    { name: 'Agents & workflows', w: 20 },
    { name: 'Evals, cost & latency tuning', w: 20 },
  ],
};

const PROOF: LeverSpec = {
  key: 'proof',
  name: 'Projects, resume & profile',
  hours: 35,
  why: 'You need a shortlist before you can interview. A resume with measured impact and one deployed project gets you callbacks from companies that would otherwise filter you out.',
  subtopics: [
    { name: 'Rewrite resume with measured impact (numbers, scale)', w: 30 },
    { name: 'One deployed, non-tutorial project', w: 40 },
    { name: 'LinkedIn + referrals pipeline (10 referrals/week)', w: 30 },
  ],
};

const NEGOTIATION: LeverSpec = {
  key: 'negotiation',
  name: 'Negotiation & offer strategy',
  hours: 8,
  why: 'Holding 2–3 offers at the same time typically adds 10–20% to the final number, and it only takes a few hours to learn.',
  subtopics: [
    { name: 'Research bands (levels.fyi, AmbitionBox, peers)', w: 25 },
    { name: 'Batch interviews so offers land together', w: 35 },
    { name: 'Counter-offer scripts & using competing offers', w: 40 },
  ],
};

// ── Weighting ───────────────────────────────────────────────────────────────
// `multiple` is reachable / current. A 2x+ jump almost always means moving
// from service to product companies, where the DSA round is the gate, so DSA
// gets a bigger share.
function leverWeights(yoe: number, multiple: number): Record<string, number> {
  const w =
    yoe < 2
      ? { dsa: 0.50, 'system-design': 0.03, lld: 0.07, 'core-cs': 0.09, 'stack-depth': 0.10, cloud: 0.04, ai: 0.05, proof: 0.07, negotiation: 0.05 }
      : yoe < 5
        ? { dsa: 0.42, 'system-design': 0.17, lld: 0.08, 'core-cs': 0.03, 'stack-depth': 0.10, cloud: 0.05, ai: 0.06, proof: 0.04, negotiation: 0.05 }
        : { dsa: 0.24, 'system-design': 0.28, lld: 0.08, 'core-cs': 0, 'stack-depth': 0.11, cloud: 0.07, ai: 0.08, proof: 0.03, negotiation: 0.11 };
  if (multiple >= 2) w.dsa *= 1.3;
  return w;
}

// Hours scale a little with seniority on the topics that get deeper.
function hoursFor(spec: LeverSpec, yoe: number): number {
  if (spec.key === 'dsa') return yoe < 2 ? 200 : yoe < 5 ? 170 : 130;
  if (spec.key === 'system-design') return yoe < 2 ? 30 : yoe < 5 ? 80 : 110;
  return spec.hours;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
export const roundLpa = (n: number) => Math.round(n * 2) / 2;

// Distributes `total` across `weights` in multiples of `step` LPA using
// largest-remainder rounding, so the parts always sum exactly to `total`.
export function splitLpa(total: number, weights: number[], step = 0.5): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0 || total <= 0) return weights.map(() => 0);
  const units = Math.round(total / step);
  const exact = weights.map((w) => (units * w) / sum);
  const floors = exact.map(Math.floor);
  let left = units - floors.reduce((a, b) => a + b, 0);
  const byRemainder = exact.map((e, i) => [e - floors[i], i]).sort((a, b) => b[0] - a[0]);
  for (const [, i] of byRemainder) {
    if (left <= 0) break;
    floors[i] += 1;
    left -= 1;
  }
  return floors.map((u) => Math.round(u * step * 100) / 100);
}

const SUBTOPIC_STEP = 0.1;

function buildLever(spec: LeverSpec, lpa: number, hours: number, why: string): RoadmapLever {
  const subLpa = splitLpa(lpa, spec.subtopics.map((s) => s.w), SUBTOPIC_STEP);
  const subHours = spec.subtopics.map((s) => s.w);
  const subHoursTotal = subHours.reduce((a, b) => a + b, 0);
  return {
    key: spec.key,
    name: spec.name,
    lpa,
    hours,
    why,
    link: spec.link,
    subtopics: spec.subtopics.map((s, i) => ({
      name: s.name,
      lpa: subLpa[i],
      hours: Math.max(1, Math.round((hours * subHours[i]) / subHoursTotal)),
      link: s.link,
    })),
  };
}

// ── Rule engine ─────────────────────────────────────────────────────────────
export function buildRuleRoadmap(input: RoadmapInput): Roadmap {
  const { currentCtc, yoe, stack, targetCtc, hoursPerWeek } = input;
  const band = marketBand(yoe);
  const marketCeiling = roundLpa(band.solid);
  const stretchCeiling = roundLpa(band.top);
  const track = detectTrack(stack);
  const s = stack.toLowerCase();
  const warnings: string[] = [];

  // Offers anchor on current CTC. Low earners (usually service companies) can
  // jump straight to the product band; above that, a single switch rarely pays
  // more than ~2.5x.
  const anchorCap = currentCtc < 10 ? Math.max(currentCtc * 5, band.solid) : currentCtc * 2.5;

  let verdict: RoadmapVerdict;
  let reachableCtc: number;
  if (currentCtc >= stretchCeiling) {
    verdict = 'above-market';
    reachableCtc = roundLpa(Math.max(targetCtc, currentCtc * 1.25));
    warnings.push(`At ${yoe} YOE you're already above the typical top-tier band (~₹${stretchCeiling} LPA). From here, pay grows with level (Senior → Staff), not with more topics.`);
  } else if (targetCtc <= Math.min(marketCeiling, anchorCap)) {
    verdict = 'on-track';
    reachableCtc = roundLpa(targetCtc);
  } else if (targetCtc <= Math.min(stretchCeiling, anchorCap)) {
    verdict = 'stretch';
    reachableCtc = roundLpa(targetCtc);
    warnings.push(`₹${targetCtc} LPA is above the typical band for ${yoe} YOE (~₹${marketCeiling} LPA), so it needs a top-tier offer. Expect more rejections, and plan for 2–3 interview cycles.`);
  } else {
    verdict = 'multi-hop';
    reachableCtc = roundLpa(Math.max(currentCtc * 1.3, Math.min(marketCeiling, anchorCap)));
  }

  // Doing nothing but switching typically pays ~30%.
  const baseline = roundLpa(Math.min(currentCtc * 0.3, Math.max(0, reachableCtc - currentCtc) * 0.25));
  const skillGap = roundLpa(Math.max(0, reachableCtc - currentCtc - baseline));

  const weights = leverWeights(yoe, currentCtc > 0 ? reachableCtc / currentCtc : 10);
  const specs: LeverSpec[] = [DSA, HLD, LLD, CORE_CS, stackDepthLever(track, stack), CLOUD, AI, PROOF, NEGOTIATION];

  // Skills already on the profile are worth less as new learning.
  const knows: Record<string, boolean> = {
    cloud: has(s, ['aws', 'gcp', 'azure', 'docker', 'kubernetes', 'k8s']),
    ai: has(s, ['llm', 'openai', 'langchain', 'rag', 'genai', 'claude', 'anthropic']),
    'system-design': has(s, ['system design', 'microservices', 'kafka']),
  };
  if (track === 'devops') knows.cloud = true;

  const active = specs.filter((spec) => (weights[spec.key] ?? 0) > 0);
  const adjWeights = active.map((spec) => (weights[spec.key] ?? 0) * (knows[spec.key] ? 0.5 : 1));
  const leverLpa = splitLpa(skillGap, adjWeights);

  const levers = active
    .map((spec, i) => {
      const hours = hoursFor(spec, yoe);
      const why = knows[spec.key]
        ? `${spec.why} You already list some of this, so focus on depth: production stories and trade-offs.`
        : spec.why;
      return buildLever(spec, leverLpa[i], hours, why);
    })
    .filter((l) => l.lpa > 0)
    .sort((a, b) => b.lpa - a.lpa);

  if (baseline > 0) {
    levers.push({
      key: 'baseline',
      name: 'Just switching (no prep)',
      lpa: baseline,
      hours: 0,
      why: 'A normal job switch with no extra preparation usually gets you around a 30% hike. It is listed here so you can see how much of the rest your studying earns.',
      subtopics: [],
    });
  }

  const totalHours = levers.reduce((a, l) => a + l.hours, 0);
  const months = Math.max(2, Math.round(totalHours / Math.max(1, hoursPerWeek) / 4.3) + 1); // +1 for interview cycles

  const hops: RoadmapHop[] = [{ ctc: reachableCtc, when: `~${months} months`, note: 'Next switch, after following this roadmap' }];
  if (verdict === 'multi-hop') {
    let ctc = reachableCtc;
    let y = yoe;
    let monthsOut = months;
    while (ctc < targetCtc && hops.length < 4) {
      y += 1.5;
      monthsOut += 18;
      const next = marketBand(y);
      ctc = roundLpa(Math.min(Math.max(ctc * 1.5, next.solid), next.top, targetCtc));
      hops.push({
        ctc,
        when: `~${Math.round(monthsOut / 12 * 10) / 10} years`,
        note: `Switch again at ~${Math.round(y * 10) / 10} YOE with the System Design + Senior-level signals`,
      });
    }
    warnings.push(`₹${targetCtc} LPA in one switch isn't realistic from ₹${currentCtc} LPA at ${yoe} YOE. Offers are anchored to your current CTC and YOE. ${hops.length > 1 ? `You can reach it in ${hops.length} switches.` : ''}`.trim());
  }

  const jump = reachableCtc - currentCtc;
  const headline =
    verdict === 'above-market'
      ? `You're above the band for ${yoe} YOE. The next jump comes from moving up a level, not from more topics.`
      : verdict === 'multi-hop'
        ? `Realistic next switch: ₹${currentCtc} → ₹${reachableCtc} LPA (+₹${roundLpa(jump)} LPA). ₹${targetCtc} LPA comes over ${hops.length} switches.`
        : `₹${currentCtc} → ₹${reachableCtc} LPA is ${verdict === 'on-track' ? 'realistic' : 'a stretch but doable'}. That's +₹${roundLpa(jump)} LPA, split across the skills below.`;

  return {
    source: 'rules',
    track,
    language: primaryLanguage(stack),
    verdict,
    headline,
    currentCtc,
    targetCtc,
    reachableCtc,
    marketCeiling,
    stretchCeiling,
    months,
    levers,
    hops,
    warnings,
  };
}

// Re-imposes the money invariants on a roadmap that came from elsewhere (the
// model): lever LPA sums to the jump, subtopic LPA sums to its lever.
export function normalizeRoadmap(r: Roadmap): Roadmap {
  const jump = roundLpa(Math.max(0, r.reachableCtc - r.currentCtc));
  const levers = r.levers.filter((l) => l.lpa > 0);
  const leverLpa = splitLpa(jump, levers.map((l) => l.lpa));
  return {
    ...r,
    levers: levers
      .map((l, i) => {
        const subs = l.subtopics.filter((s) => s.lpa > 0);
        const subLpa = splitLpa(leverLpa[i], subs.map((s) => s.lpa), SUBTOPIC_STEP);
        return {
          ...l,
          lpa: leverLpa[i],
          hours: Math.max(0, Math.round(l.hours)),
          subtopics: subs.map((s, j) => ({ ...s, lpa: subLpa[j], hours: Math.max(1, Math.round(s.hours)) })),
        };
      })
      .filter((l) => l.lpa > 0)
      .sort((a, b) => (a.key === 'baseline' ? 1 : b.key === 'baseline' ? -1 : b.lpa - a.lpa)),
  };
}
