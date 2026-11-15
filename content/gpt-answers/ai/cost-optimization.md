You reduce LLM API costs by sending **fewer tokens** to **cheaper models** less often: measure token usage first, route simple requests to small models, shrink prompts, use **prompt caching** and the **batch API**, cap output length, and cache repeated answers.

## How you are billed

```text
cost = input_tokens  x input_price
     + output_tokens x output_price      (output is usually several times pricier)
     - discounts (cached input tokens, batch jobs)
```

So the levers are: the **model** (price per token), the **number of tokens** in and out, and the **number of calls**.

## 1. Measure first

Log tokens and cost per request, per feature and per customer. You often discover that one feature, one long system prompt or a few heavy users drive most of the bill.

```python
def log_usage(feature, model, usage):
    cost = (usage.prompt_tokens * PRICES[model]["in"]
            + usage.completion_tokens * PRICES[model]["out"]) / 1_000_000
    metrics.record(feature=feature, model=model,
                   input_tokens=usage.prompt_tokens,
                   output_tokens=usage.completion_tokens,
                   cost_usd=cost)
```

## 2. Use the cheapest model that passes your evals

- Small models are often 10-30x cheaper than flagship models
- **Route** easy tasks (classification, extraction, short answers) to small models
- **Cascade**: try the cheap model first and escalate only when validation fails
- Re-evaluate when new, cheaper models are released

## 3. Shrink the prompt

- Remove redundant instructions and long few-shot examples that don't improve evals
- **Summarise or truncate** chat history instead of resending the full conversation
- Retrieve **fewer, better chunks** (reranking lets you use top-3 instead of top-20)
- Don't send full tool schemas or documents that aren't needed for this request

## 4. Prompt caching

Keep the stable prefix (system prompt, tool definitions, reference docs) identical and at the start. Providers charge cached input tokens at a large discount, which matters a lot for long system prompts and multi-turn agents.

## 5. Control output length

- Set `max_tokens`
- Ask for concise formats (bullets, short JSON)
- For reasoning models, use lower reasoning effort when the task is simple

## 6. Batch offline work

For non-urgent jobs (nightly classification, embeddings, evals, document processing), use the provider's **batch API**, typically around **50% cheaper** with results returned within hours.

## 7. Cache responses

- **Exact cache** for repeated identical requests (FAQ answers, the same document summary)
- **Semantic cache** for near-duplicate questions, with a strict similarity threshold
- Cache embeddings so documents are not re-embedded unnecessarily

## 8. Reduce the number of calls

- Combine multiple small LLM calls into one structured call where quality allows
- Limit agent loop iterations and stop early when the goal is reached
- Use deterministic code (regex, rules, SQL) instead of an LLM where it works

## 9. Consider fine-tuning or self-hosting at scale

At high, steady volume, a **fine-tuned small model** or a **self-hosted open model** can be cheaper than a large API model. Factor in GPU, engineering and ops costs before switching.

## Impact overview

| Technique | Typical saving | Trade-off |
|---|---|---|
| Model routing / smaller model | Very high | Needs evals per route |
| Prompt trimming and fewer chunks | Medium-high | Risk of losing context |
| Prompt caching | High for long prefixes | Prompt structure constraints |
| Batch API | ~50% on offline jobs | Not real-time |
| Response caching | Depends on repeat rate | Staleness, wrong-hit risk |
| Output caps | Medium | Possible truncation |
| Self-hosting | High at large volume | Ops burden |

## Summary

- Measure cost per feature, then attack the biggest drivers.
- Route to cheaper models, trim prompts and outputs, and use prompt caching, batch APIs and response caches.
- Verify every saving against your eval suite so quality does not silently drop.
