You build an evaluation dataset (often called a **golden dataset**) by collecting a representative set of inputs from real usage and expert knowledge, attaching the expected output or a grading rubric to each, covering edge and adversarial cases, and versioning it so it can be re-run on every change.

## 1. Decide what you are testing

List the capabilities and failure modes that matter:

- Core tasks (answer product questions, extract invoice fields, route tickets)
- Constraints (format, tone, length, citations)
- Things it must **not** do (hallucinate, leak data, answer out-of-scope questions)

Each item becomes a **category** in your dataset.

## 2. Source the inputs

- **Production logs**: the best source, because they reflect how users really phrase things. Sample across time, user types and intents.
- **Domain experts**: write tricky questions that logs may not contain yet.
- **Bug reports and complaints**: every failure is a future test case.
- **Synthetic generation**: ask a strong model to produce variations or rare scenarios, then review them by hand.

## 3. Cover the right mix

| Category | Example | Why |
|---|---|---|
| Common cases | "How do I reset my password?" | Represents most traffic |
| Edge cases | Very long input, typos, mixed languages | Robustness |
| Hard cases | Multi-step reasoning, conflicting documents | Capability ceiling |
| Out-of-scope | "Write me a poem" in a support bot | Should decline politely |
| Adversarial | Prompt injection, jailbreak attempts | Safety |
| Multi-turn | Follow-up questions relying on history | Context handling |

## 4. Define the expected result

Not every case needs a single exact answer. Store whatever makes grading possible:

- **Exact expected output** (classification label, extracted fields)
- **Key facts / must-include** and **must-not-include** lists
- **Rubric** for subjective criteria
- **Relevant document IDs** for retrieval evaluation

```python
# evals/support_v3.jsonl  (one JSON object per line)
case = {
    "id": "refund-014",
    "category": "refunds",
    "difficulty": "hard",
    "source": "prod-log-2026-10",
    "input": "I was charged twice for order 8812, can I get one refunded?",
    "expected_intent": "refund_request",
    "must_include": ["duplicate charge", "3-5 business days"],
    "must_not_include": ["guaranteed"],
    "relevant_docs": ["kb/refund-policy.md"],
    "rubric": "Acknowledges the issue, explains refund timeline, does not over-promise.",
}
```

## 5. Label with humans

- Write a short **labelling guide** so annotators are consistent
- Have domain experts review expected answers
- For subjective criteria, double-label a subset and measure **inter-annotator agreement**; low agreement means the criterion is unclear

## 6. Size and growth

- Start with **50-200 high-quality cases**; that is enough to catch most regressions
- Grow it continuously from production failures
- Keep a small **smoke set** for fast CI runs and a larger set for release checks

## 7. Maintain it

- **Version** the dataset in git (or a data versioning tool) and record which version produced each score
- Remove outdated cases when policies or products change
- Never let eval cases leak into fine-tuning or few-shot examples (contamination)
- Track scores **per category**, not just the overall average

## Common pitfalls

- Only "happy path" questions, so the eval always looks great
- Synthetic data nobody reviewed
- Expected answers that are themselves wrong or outdated
- A dataset that never changes while the product does

## Summary

- Seed the dataset from real usage, experts and past failures, and cover common, edge, out-of-scope and adversarial cases.
- Store expected outputs, key facts or rubrics plus metadata, and have humans review them.
- Start small, version it, track per-category scores and keep growing it from production.
