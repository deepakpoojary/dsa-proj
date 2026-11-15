Common LLM benchmarks measure knowledge, reasoning, math, coding, agentic tool use and human preference; examples include **MMLU, GPQA, MATH, HumanEval, SWE-bench** and **LMArena**. They are useful for comparing models at a glance, but they suffer from **contamination, saturation and a mismatch with real tasks**, so they should never replace your own evaluations.

## Common benchmarks by category

| Category | Benchmarks | What they test |
|---|---|---|
| General knowledge | MMLU, MMLU-Pro | Multiple-choice questions across 50+ subjects |
| Expert reasoning | GPQA (Diamond), Humanity's Last Exam | Very hard graduate-level and frontier questions |
| Math | GSM8K, MATH, AIME | Grade-school to competition math |
| Code | HumanEval, MBPP, LiveCodeBench | Write functions that pass unit tests |
| Software engineering | SWE-bench (Verified) | Fix real GitHub issues in real repos |
| Agents and tools | tau-bench, Terminal-Bench, BFCL | Multi-step tool use, function calling |
| Long context | Needle-in-a-haystack, RULER | Retrieve and reason over long inputs |
| Truthfulness and safety | TruthfulQA, HarmBench | Avoid common misconceptions, resist harmful requests |
| Human preference | LMArena (Chatbot Arena) | Elo ratings from blind pairwise votes |
| Multimodal | MMMU | Reasoning over images plus text |

## How they are used

- **Model selection**: shortlist candidates for a task (e.g. strong SWE-bench score for a coding assistant)
- **Research progress**: track capability gains over time
- **Marketing**: vendors report them in model announcements, so read them critically

## Limitations

### 1. Data contamination

Benchmark questions are public and can leak into training data. A model may have memorised answers rather than learned the skill. Newer benchmarks like LiveCodeBench use problems released after a model's training cutoff to reduce this.

### 2. Saturation

Top models score above 90% on MMLU, GSM8K and HumanEval, so these benchmarks no longer separate strong models. The field keeps moving to harder sets (MMLU-Pro, GPQA, Humanity's Last Exam).

### 3. Mismatch with real work

Most benchmarks are short, single-turn and often multiple-choice. Your application might need long documents, company-specific knowledge, a strict JSON format and multi-turn conversations, none of which is captured.

### 4. Sensitivity to setup

Scores change with prompt format, number of few-shot examples, chain-of-thought, sampling settings and the evaluation harness. Two "MMLU scores" may not be comparable.

### 5. Preference leaderboards reward style

Arena votes can favour longer, more confident or nicely formatted answers. Vendors can also optimise specifically for leaderboard results.

### 6. Narrow coverage

Benchmarks rarely measure latency, cost, calibration, refusal behaviour or robustness to prompt injection, all of which matter in production.

## How to use benchmarks well

1. Use them to **narrow the field** to a few candidate models.
2. Run your own **task-specific eval set** on those candidates.
3. Weigh quality against **latency and cost** for your traffic.
4. Re-run your evals when new models or versions are released.

```python
# Pseudo-workflow for picking a model
candidates = ["model-a", "model-b", "model-c"]          # shortlisted from public benchmarks
results = {m: run_eval_suite(m, "evals/my_task.jsonl") for m in candidates}
best = max(results, key=lambda m: results[m]["score"] - COST_WEIGHT * results[m]["cost"])
```

## Summary

- Benchmarks like MMLU, GPQA, MATH, HumanEval, SWE-bench and LMArena cover knowledge, reasoning, code, agents and preference.
- They suffer from contamination, saturation, setup sensitivity and poor fit to real tasks.
- Use them to shortlist models, then decide with your own evals on quality, latency and cost.
