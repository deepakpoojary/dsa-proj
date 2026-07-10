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
}

export interface EnrichedProblem extends Problem {
  bruteHtml: string;
  optimalHtml: string;
  isLocked: boolean;
}
