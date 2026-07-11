import { REWARD_TOP150, REWARD_REGULAR } from '@/types'

export interface TheoryQuestion {
  id: string
  topic: string
  question: string
  answer: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  createdAt: string
  solved: boolean
  solvedToday: boolean
}

// Theory has no curated "Top 150"-style flag, so Hard questions (the deepest,
// most interview-relevant ones) stand in as the higher-reward tier.
export function rewardForTheory(question: Pick<TheoryQuestion, 'difficulty'>): number {
  return question.difficulty === 'Hard' ? REWARD_TOP150 : REWARD_REGULAR
}

export interface TheoryTopic {
  label: string
  enabled: boolean
  color: string
}

export interface TheoryData {
  topics: Record<string, TheoryTopic>
  questions: TheoryQuestion[]
}
