export interface TheoryQuestion {
  id: string
  topic: string
  question: string
  answer: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  createdAt: string
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
