You evaluate an LLM application by defining what "good" means for your use case, building a representative test set, scoring outputs with a mix of **automated checks, LLM judges and human review**, and running those evals both **offline before every change** and **online in production**.

## 1. Define success criteria

Different apps need different metrics. Turn vague goals into measurable ones:

- **Correctness**: does the answer match the expected result?
- **Groundedness / faithfulness**: is it supported by the retrieved context?
- **Relevance and completeness**: does it actually answer the question?
- **Format**: valid JSON, follows the schema, correct length
- **Safety and tone**: no harmful content, on-brand
- **Operational**: latency, cost per request, error rate

## 2. Build an evaluation dataset

- Sample **real user queries**, plus edge cases and adversarial inputs
- Attach an expected answer, a rubric, or key facts that must appear
- Start with 50-200 good cases and grow it from production failures
- Version it so results are comparable over time

## 3. Choose the right graders

Use the cheapest grader that is reliable for each criterion:

| Grader | Good for | Limits |
|---|---|---|
| Code-based checks | Exact match, JSON schema, regex, unit tests, tool-call args | Only for objective criteria |
| LLM-as-a-judge | Helpfulness, faithfulness, tone, rubric scoring | Biases, needs calibration |
| Human review | Ground truth, subjective quality, calibrating judges | Slow and expensive |

```python
def grade(case, output):
    scores = {}
    # Deterministic check: must be valid JSON with an "intent" field
    try:
        data = json.loads(output)
        scores["valid_json"] = 1.0
        scores["intent_correct"] = float(data.get("intent") == case["expected_intent"])
    except json.JSONDecodeError:
        scores["valid_json"] = 0.0
    # Rubric-based check with an LLM judge
    scores["polite"] = llm_judge(rubric="Is the reply polite and professional?", output=output)
    return scores
```

## 4. Evaluate components, not just the final answer

For a RAG or agent system, measure each stage separately so you know what to fix:

- **Retrieval**: recall@k, precision@k, MRR (did the right chunk come back?)
- **Generation**: faithfulness, answer relevance
- **Agents/tools**: correct tool chosen, correct arguments, task success rate, number of steps

## 5. Offline evaluation in CI

- Run the suite on every prompt, model or retrieval change
- Compare against a **baseline** and look at per-category scores
- Block deployment on significant regressions
- Run multiple samples to account for non-determinism

## 6. Online evaluation in production

- **User signals**: thumbs up/down, regenerations, copy events, escalations to humans
- **A/B tests** of prompts or models on real traffic
- **Sampled online evals**: run LLM judges on a slice of production traces
- Monitor latency, cost and error trends

## Common pitfalls

- Relying on vibes or a handful of manual tries
- Using only generic benchmarks instead of task-specific data
- Trusting an LLM judge without checking agreement with humans
- Never updating the eval set as the product changes

## Summary

- Define measurable criteria, build a versioned golden dataset, and grade with code checks, LLM judges and humans.
- Evaluate retrieval, generation and tool use separately, run evals in CI and keep monitoring in production.
- Feed every real failure back into the eval set.
