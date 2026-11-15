**Zero-shot prompting** gives the model only an instruction and relies on what it already knows. **Few-shot prompting** includes a handful of worked input/output examples in the prompt so the model can infer the exact pattern you want, a capability known as **in-context learning**.

## Zero-Shot

You describe the task and let the model do it:

```
Classify the sentiment of this review as positive, negative or neutral.

Review: "The battery died after two days."
Sentiment:
```

**Strengths**

- Short prompts: cheaper and faster.
- Works well for common, well-defined tasks (summarise, translate, classify obvious categories).
- Modern instruction-tuned models are very strong zero-shot.

**Weaknesses**

- Output format and label choices can vary.
- Struggles with custom conventions, niche labels or subtle edge cases.

## Few-Shot

You show examples before the real input:

```
Classify the sentiment as positive, negative or neutral.

Review: "Arrived on time and works perfectly."
Sentiment: positive

Review: "It's okay, nothing special."
Sentiment: neutral

Review: "Screen cracked within a week."
Sentiment: negative

Review: "The battery died after two days."
Sentiment:
```

The model picks up the label set, formatting and decision boundary from the examples. No weights are updated; learning happens entirely inside the context window.

## In Code (Chat Format)

Examples can be passed as prior conversation turns:

```python
messages = [
    {"role": "system", "content": "Extract the product and issue as JSON."},
    # example 1
    {"role": "user", "content": "My AirPods keep disconnecting."},
    {"role": "assistant", "content": '{"product": "AirPods", "issue": "connectivity"}'},
    # example 2
    {"role": "user", "content": "The Kindle screen is frozen."},
    {"role": "assistant", "content": '{"product": "Kindle", "issue": "display freeze"}'},
    # real input
    {"role": "user", "content": "Laptop charger gets really hot."},
]
response = client.chat.completions.create(model=MODEL, messages=messages, temperature=0)
```

## Comparison

| Aspect | Zero-shot | Few-shot |
|---|---|---|
| Prompt length | Short | Longer (more tokens, more cost) |
| Setup effort | Minimal | Need good examples |
| Format consistency | Variable | High |
| Custom labels / style | Weaker | Strong |
| Risk | Misreads task | Over-copies examples, biased by them |

Variants:

- **One-shot**: exactly one example.
- **Many-shot**: dozens to hundreds of examples, practical with long context windows and often competitive with light fine-tuning.

## Tips for Good Few-Shot Examples

- **Diverse**: cover different categories and edge cases, not five near-identical cases.
- **Balanced**: avoid all examples having the same label; the model may bias toward it.
- **Representative**: use realistic inputs similar to production data.
- **Consistent format**: every example should follow exactly the output format you want.
- **Ordered thoughtfully**: models can be sensitive to the order; the last examples tend to have more influence.
- **Dynamic selection**: for large example pools, retrieve the most similar examples per query using embeddings.

## When to Use Which

- Start **zero-shot** with clear instructions.
- Move to **few-shot** when evals show inconsistent formatting, wrong labels or poor handling of edge cases.
- Consider **fine-tuning** when you need hundreds of examples on every call or want lower per-call cost and latency.

## Summary

- Zero-shot: instructions only; simple and cheap, relies on the model's general ability.
- Few-shot: adds examples to teach format, labels and style through in-context learning.
- Pick diverse, consistent examples, and let evals decide whether the extra tokens are worth it.
