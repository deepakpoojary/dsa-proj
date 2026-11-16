// Skill-based yearly salaries (CTC, ₹ LPA) for the Indian tech market, 2026.
//
// These are estimates put together from the patterns in public salary data
// (AmbitionBox, Glassdoor, levels.fyi, recruiter reports), not live numbers.
// Each skill stores the *typical* (median) CTC at a solid product company per
// experience level; service companies and top-tier companies are derived with
// per-level multipliers. Ranges are the middle half of offers, so plenty of
// people land outside them both ways.

export type Level = 'fresher' | 'junior' | 'mid' | 'senior' | 'lead';
export type Tier = 'service' | 'product' | 'top';
export type Demand = 'hot' | 'steady' | 'cooling';

export const LEVELS: { key: Level; label: string; yoe: string }[] = [
  { key: 'fresher', label: 'Fresher', yoe: '0–1 yrs' },
  { key: 'junior', label: 'Junior', yoe: '2–3 yrs' },
  { key: 'mid', label: 'Mid', yoe: '4–6 yrs' },
  { key: 'senior', label: 'Senior', yoe: '7–10 yrs' },
  { key: 'lead', label: 'Lead / Staff', yoe: '10+ yrs' },
];

export const TIERS: { key: Tier; label: string; hint: string }[] = [
  { key: 'service', label: 'Service company', hint: 'TCS, Infosys, Wipro, Cognizant, Accenture, Capgemini…' },
  { key: 'product', label: 'Product company', hint: 'Funded startups, mid-size product firms, most GCCs' },
  { key: 'top', label: 'Top-tier', hint: 'FAANG-level, top unicorns, HFT / fintech, high-paying GCCs' },
];

/** Multiplier on the product-company median, per level (fresher → lead). */
const TIER_FACTOR: Record<Tier, number[]> = {
  service: [0.5, 0.55, 0.55, 0.55, 0.6],
  product: [1, 1, 1, 1, 1],
  top: [2.6, 2.1, 1.8, 1.7, 1.7],
};

export interface SkillSalary {
  key: string;
  name: string;
  area: string;
  demand: Demand;
  /** What the role usually means in job posts. */
  stack: string;
  /** Typical CTC (₹ LPA) at a product company: fresher, junior, mid, senior, lead. null = role rarely hires at that level. */
  median: (number | null)[];
}

export const AREAS = ['Frontend', 'Backend', 'Full stack', 'Mobile', 'Data & AI', 'Cloud & DevOps', 'Testing', 'Enterprise & other'] as const;

export const SKILLS: SkillSalary[] = [
  // Frontend
  { key: 'web-basics', name: 'HTML, CSS & JavaScript', area: 'Frontend', demand: 'cooling', stack: 'Plain web pages, jQuery, basic JS', median: [5, 8, 13, 20, 26] },
  { key: 'react', name: 'React', area: 'Frontend', demand: 'steady', stack: 'React, Redux / Zustand, REST, Jest', median: [8, 14, 24, 36, 48] },
  { key: 'next-ts', name: 'Next.js + TypeScript', area: 'Frontend', demand: 'hot', stack: 'Next.js, TypeScript, SSR, Tailwind', median: [9, 15, 25, 38, 50] },
  { key: 'angular', name: 'Angular', area: 'Frontend', demand: 'steady', stack: 'Angular, RxJS, TypeScript', median: [7, 12, 20, 30, 40] },
  { key: 'vue', name: 'Vue.js', area: 'Frontend', demand: 'steady', stack: 'Vue 3, Nuxt, Pinia', median: [7, 12, 20, 30, 40] },

  // Backend
  { key: 'java', name: 'Java + Spring Boot', area: 'Backend', demand: 'steady', stack: 'Java, Spring Boot, microservices, SQL, Kafka', median: [9, 15, 26, 40, 55] },
  { key: 'node', name: 'Node.js', area: 'Backend', demand: 'steady', stack: 'Node.js, Express / NestJS, MongoDB / PostgreSQL', median: [8, 14, 24, 36, 48] },
  { key: 'python', name: 'Python backend', area: 'Backend', demand: 'steady', stack: 'Django / FastAPI, PostgreSQL, Celery', median: [8, 14, 24, 37, 50] },
  { key: 'go', name: 'Go (Golang)', area: 'Backend', demand: 'hot', stack: 'Go, gRPC, microservices, Kubernetes', median: [12, 20, 32, 48, 65] },
  { key: 'rust', name: 'Rust', area: 'Backend', demand: 'hot', stack: 'Rust systems / infra / Web3 roles (few openings)', median: [12, 20, 34, 50, 70] },
  { key: 'dotnet', name: 'C# / .NET', area: 'Backend', demand: 'steady', stack: 'ASP.NET Core, SQL Server, Azure', median: [6, 11, 19, 30, 40] },
  { key: 'php', name: 'PHP / Laravel', area: 'Backend', demand: 'cooling', stack: 'PHP, Laravel, WordPress, MySQL', median: [4, 7, 12, 18, 25] },

  // Full stack
  { key: 'mern', name: 'MERN full stack', area: 'Full stack', demand: 'steady', stack: 'MongoDB, Express, React, Node', median: [7, 13, 22, 34, 45] },
  { key: 'java-fs', name: 'Java full stack', area: 'Full stack', demand: 'steady', stack: 'Spring Boot + React / Angular', median: [8, 14, 24, 37, 50] },

  // Mobile
  { key: 'android', name: 'Android (Kotlin)', area: 'Mobile', demand: 'steady', stack: 'Kotlin, Jetpack Compose, MVVM', median: [8, 14, 24, 36, 48] },
  { key: 'ios', name: 'iOS (Swift)', area: 'Mobile', demand: 'steady', stack: 'Swift, SwiftUI, UIKit', median: [9, 15, 26, 38, 50] },
  { key: 'flutter', name: 'Flutter', area: 'Mobile', demand: 'steady', stack: 'Flutter, Dart, Firebase', median: [6, 11, 19, 28, 38] },
  { key: 'rn', name: 'React Native', area: 'Mobile', demand: 'steady', stack: 'React Native, TypeScript, Expo', median: [7, 12, 21, 32, 42] },

  // Data & AI
  { key: 'analyst', name: 'Data analyst', area: 'Data & AI', demand: 'steady', stack: 'SQL, Excel, Power BI / Tableau, Python basics', median: [5, 8, 13, 20, 28] },
  { key: 'data-eng', name: 'Data engineer', area: 'Data & AI', demand: 'hot', stack: 'Spark, Airflow, Kafka, Snowflake / Databricks', median: [9, 16, 28, 42, 58] },
  { key: 'data-sci', name: 'Data scientist', area: 'Data & AI', demand: 'steady', stack: 'Python, statistics, scikit-learn, experimentation', median: [9, 15, 26, 40, 55] },
  { key: 'ml', name: 'ML engineer', area: 'Data & AI', demand: 'hot', stack: 'PyTorch, model training & serving, MLOps', median: [11, 18, 32, 50, 70] },
  { key: 'genai', name: 'GenAI / LLM engineer', area: 'Data & AI', demand: 'hot', stack: 'LLM APIs, RAG, agents, evals, vector DBs', median: [12, 22, 38, 58, 80] },

  // Cloud & DevOps
  { key: 'devops', name: 'DevOps', area: 'Cloud & DevOps', demand: 'hot', stack: 'AWS, Docker, Kubernetes, CI/CD, Terraform', median: [7, 13, 23, 35, 48] },
  { key: 'sre', name: 'SRE / platform', area: 'Cloud & DevOps', demand: 'hot', stack: 'Kubernetes, observability, on-call, Go / Python', median: [10, 17, 30, 45, 60] },
  { key: 'cloud-arch', name: 'Cloud architect', area: 'Cloud & DevOps', demand: 'steady', stack: 'AWS / Azure / GCP solution design (needs experience)', median: [null, null, 30, 45, 62] },
  { key: 'security', name: 'Cybersecurity', area: 'Cloud & DevOps', demand: 'hot', stack: 'AppSec, cloud security, VAPT, SOC', median: [6, 11, 20, 32, 45] },

  // Testing
  { key: 'manual-qa', name: 'Manual testing', area: 'Testing', demand: 'cooling', stack: 'Test cases, Jira, regression', median: [3.5, 5.5, 8, 12, 16] },
  { key: 'auto-qa', name: 'Automation testing / SDET', area: 'Testing', demand: 'steady', stack: 'Selenium / Playwright, API tests, CI', median: [5, 9, 15, 23, 32] },

  // Enterprise & other
  { key: 'salesforce', name: 'Salesforce', area: 'Enterprise & other', demand: 'steady', stack: 'Apex, LWC, Sales / Service Cloud', median: [6, 11, 18, 27, 36] },
  { key: 'sap', name: 'SAP', area: 'Enterprise & other', demand: 'steady', stack: 'SAP ABAP / FICO / S/4HANA', median: [5, 10, 17, 26, 35] },
  { key: 'embedded', name: 'Embedded / C, C++', area: 'Enterprise & other', demand: 'steady', stack: 'C, C++, RTOS, automotive / semiconductors', median: [6, 11, 18, 28, 38] },
];

export interface Band { low: number; typical: number; high: number }

const round = (n: number) => (n < 10 ? Math.round(n * 2) / 2 : Math.round(n));

/** Yearly CTC band (₹ LPA) for a skill at a level and company tier, or null if that level rarely exists. */
export function salaryBand(skill: SkillSalary, level: Level, tier: Tier): Band | null {
  const i = LEVELS.findIndex((l) => l.key === level);
  const m = skill.median[i];
  if (m == null) return null;
  const typical = m * TIER_FACTOR[tier][i];
  return { low: round(typical * 0.8), typical: round(typical), high: round(typical * 1.3) };
}

/**
 * Rough estimate for someone with several skills: the best-paid skill sets the
 * base; each extra skill from a *different* area adds 5% (max +15%), because
 * breadth helps but nobody is paid the sum of their skills.
 */
export function estimateFor(keys: string[], level: Level, tier: Tier): (Band & { best: SkillSalary; bonusPct: number }) | null {
  const picked = SKILLS.filter((s) => keys.includes(s.key));
  const priced = picked
    .map((s) => ({ s, b: salaryBand(s, level, tier) }))
    .filter((x): x is { s: SkillSalary; b: Band } => !!x.b)
    .sort((a, b) => b.b.typical - a.b.typical);
  if (priced.length === 0) return null;
  const best = priced[0];
  const otherAreas = new Set(priced.slice(1).map((x) => x.s.area).filter((a) => a !== best.s.area));
  const bonusPct = Math.min(15, otherAreas.size * 5);
  const f = 1 + bonusPct / 100;
  return { low: round(best.b.low * f), typical: round(best.b.typical * f), high: round(best.b.high * f), best: best.s, bonusPct };
}
