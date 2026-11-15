**Chain-of-thought (CoT) prompting** asks the model to work through intermediate reasoning steps before giving its final answer. It helps most on problems that need several dependent steps, such as math, logic, planning and rule-based decisions, and adds little for simple lookups or short creative tasks.

## Why It Works

An LLM spends a fixed amount of computation per generated token. If it must output the answer immediately, all reasoning has to happen inside a single forward pass. When it writes out steps first:

- Each intermediate result becomes **context** the model can condition on.
- Complex problems are decomposed into easier sub-problems.
- Errors become visible, so you can debug or verify the reasoning.

## Example

**Without CoT:**

```
Q: A cafe had 23 apples. It used 20 for lunch and bought 6 more.
How many apples does it have?
A: 27            <- wrong
```

**With CoT:**

```
Q: (same question) Think step by step, then give the final answer.
A: Start with 23. After using 20: 23 - 20 = 3. After buying 6: 3 + 6 = 9.
Final answer: 9
```

## Common Variants

| Variant | How it works |
|---|---|
| **Zero-shot CoT** | Add "Think step by step" or ask for reasoning before the answer |
| **Few-shot CoT** | Provide examples that include worked reasoning |
| **Self-consistency** | Sample several reasoning paths at higher temperature, take the majority answer |
| **Structured reasoning** | Ask for reasoning in one section and the answer in another, e.g. XML tags |
| **Prompt chaining** | Split reasoning across multiple calls (plan, then execute, then check) |

## Separating Reasoning From the Answer

In production you usually want to parse only the final result:

```python
PROMPT = """Decide whether this expense claim violates policy.

<policy>{policy}</policy>
<claim>{claim}</claim>

First reason inside <thinking> tags: list each relevant rule and check it.
Then give the verdict inside <answer> tags as APPROVE or REJECT."""

import re

def get_verdict(llm, policy, claim):
    text = llm(PROMPT.format(policy=policy, claim=claim))
    match = re.search(r"<answer>\s*(APPROVE|REJECT)\s*</answer>", text)
    return match.group(1) if match else None
```

## Reasoning Models

Many current models have built-in **extended or adaptive thinking**: they produce internal reasoning tokens before answering, often controlled by an effort or thinking-budget parameter. With these models:

- You generally **do not need** "think step by step"; the model already does it.
- Prefer high-level guidance ("consider edge cases, verify your result") over prescribing exact steps.
- Reasoning tokens are billed and add latency, so tune the effort level per task.

## When CoT Helps vs When It Does Not

**Helps:**

- Arithmetic and word problems.
- Multi-hop questions combining several facts.
- Applying many rules or a policy to a case.
- Planning, scheduling and debugging code.
- Complex classification where the reasoning must be auditable.

**Little or no benefit:**

- Simple factual lookups or extraction.
- Short rewrites, translation, casual chat.
- Latency-critical paths where every token counts.

## Caveats

- **Cost and latency** increase with longer outputs.
- **Faithfulness**: the written reasoning is not guaranteed to be the true cause of the answer; do not treat it as a perfect explanation.
- **Errors still happen**: a wrong step leads to a confident wrong answer; add verification (tools, code execution, checks).
- **Do not show raw reasoning to end users** blindly; it can be verbose or confusing.

## Summary

- Chain-of-thought prompts the model to reason step by step before answering.
- It improves accuracy on multi-step problems by giving the model room to compute.
- Reasoning models do this natively; use explicit CoT mainly with non-reasoning models or when you need parseable, auditable reasoning.
