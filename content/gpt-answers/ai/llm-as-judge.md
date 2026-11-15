**LLM-as-a-judge** means using a language model to grade the outputs of another model (or itself) against a rubric, a reference answer, or a competing answer. It makes open-ended evaluation scalable, but judges have systematic **biases** and must be calibrated against human labels before you trust them.

## How it works

There are three common setups:

- **Single-answer grading**: score one output on a rubric (e.g. pass/fail for faithfulness, or 1-5 for helpfulness).
- **Reference-based grading**: compare the output to a gold answer ("does it contain the same key facts?").
- **Pairwise comparison**: show two outputs and ask which is better (useful for A/B testing prompts or models).

```python
JUDGE_PROMPT = """You are an expert evaluator.

Question: {question}
Retrieved context: {context}
Answer to grade: {answer}

Criterion: Faithfulness. Every factual claim in the answer must be supported by the context.

First explain your reasoning briefly, then output JSON:
{{"reasoning": "...", "faithful": true or false}}"""

def judge_faithfulness(question, context, answer):
    response = client.chat.completions.create(
        model=JUDGE_MODEL,            # pinned version, ideally a strong model
        temperature=0,
        messages=[{"role": "user", "content": JUDGE_PROMPT.format(
            question=question, context=context, answer=answer)}],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)
```

## Why teams use it

- Much cheaper and faster than human review
- Handles subjective qualities that code cannot check (tone, helpfulness, coherence)
- Can run on every CI build and on samples of production traffic

## Pitfalls and how to mitigate them

| Pitfall | What happens | Mitigation |
|---|---|---|
| Position bias | Prefers the first (or second) answer in pairwise tests | Run both orders and average; count ties |
| Verbosity bias | Rates longer answers higher | Rubric explicitly penalises padding; compare at similar length |
| Self-preference | Favours outputs from its own model family | Use a different model family as judge |
| Vague rubrics | Inconsistent, noisy scores | Specific criteria, binary or 1-3 scales, examples of each score |
| Knowledge gaps | Cannot verify facts it doesn't know | Give it the reference answer or source context |
| Weak at math/code | Approves wrong logic | Use tests, execution or exact checks instead |
| Prompt sensitivity | Small wording changes shift scores | Freeze and version the judge prompt |
| Drift | Judge model update changes scores | Pin the judge model version |

## Making a judge trustworthy

1. **Write a narrow rubric**: one criterion per judge call works better than "rate overall quality".
2. **Ask for reasoning before the verdict** (chain-of-thought improves consistency).
3. **Prefer binary or small scales**: "faithful: yes/no" is more reliable than a 1-10 score.
4. **Calibrate against humans**: label 50-100 examples yourself and measure agreement (accuracy, Cohen's kappa). Iterate on the prompt until agreement is acceptable.
5. **Include few-shot examples** of good and bad outputs.
6. **Monitor the judge** over time like any other model.

## When not to use it

- When a deterministic check exists (JSON validity, exact match, unit tests)
- For high-stakes final decisions without human oversight
- When the judge is weaker than the model being evaluated on the task

## Summary

- LLM-as-a-judge uses a model with a rubric to grade outputs, enabling cheap, scalable evaluation of open-ended quality.
- Watch for position, verbosity and self-preference bias, vague rubrics and knowledge gaps.
- Use narrow rubrics, binary scores, order swapping and pinned versions, and always calibrate against human labels.
