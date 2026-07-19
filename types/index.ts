export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: Example[];
  bruteForce: {
    explanation: string;
    code: string;
    language: string;
    timeComplexity: string;
    spaceComplexity: string;
  };
  optimal: {
    explanation: string;
    code: string;
    language: string;
    timeComplexity: string;
    spaceComplexity: string;
  };
  createdAt: string;
  isTop150: boolean;
  leetcodeUrl: string | null;
  neetcodeUrl: string | null;
}

export interface EnrichedProblem extends Problem {
  bruteHtml: string;
  optimalHtml: string;
  isLocked: boolean;
  solved: boolean;
  solvedToday: boolean;
  hasOverride: boolean;
}

export const REWARD_TOP150 = 10;
export const REWARD_REGULAR = 5;

export function rewardFor(problem: Pick<Problem, 'isTop150'>): number {
  return problem.isTop150 ? REWARD_TOP150 : REWARD_REGULAR;
}
