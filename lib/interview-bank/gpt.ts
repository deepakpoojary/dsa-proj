// "Ask an LLM" style answers: what ChatGPT / Gemini would write if you pasted
// the question into a fresh chat. Markdown, keyed by bank item key.
// Server-only: served one at a time by /api/bank-gpt.
import { GPT_ANSWERS } from './gpt-answers.generated';

export function gptAnswer(key: string): string | undefined {
  return GPT_ANSWERS[key];
}
