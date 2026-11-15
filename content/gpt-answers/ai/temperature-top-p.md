**Temperature, top-p and top-k are sampling parameters** that control how the model picks the next token from its probability distribution. Temperature reshapes the distribution (sharper or flatter), while top-k and top-p cut off unlikely tokens before sampling.

## The Starting Point

At each step the model outputs a probability for every token, for example:

```
" mat"    0.50
" floor"  0.20
" sofa"   0.15
" roof"   0.10
" banana" 0.05
```

Sampling parameters decide which of these can be chosen and how likely each is.

## Temperature

Temperature divides the logits before the softmax:

```
p_i = softmax(logit_i / T)
```

- **T < 1** sharpens the distribution: likely tokens get even likelier. Output becomes focused and repeatable.
- **T = 1** uses the model's raw distribution.
- **T > 1** flattens it: unlikely tokens get a real chance. Output becomes more varied, and more error-prone.
- **T → 0** approaches **greedy decoding** (always the top token).

## Top-k

Keep only the **k most likely tokens**, renormalise, and sample among them. With `top_k = 3` in the example, only "mat", "floor" and "sofa" are possible.

Weakness: k is fixed. When the model is very confident, k = 50 still allows junk; when it is unsure, k = 3 may be too restrictive.

## Top-p (Nucleus Sampling)

Keep the **smallest set of tokens whose cumulative probability reaches p**. With `top_p = 0.85`: 0.50 + 0.20 + 0.15 = 0.85, so "mat", "floor" and "sofa" remain.

Because the set size adapts to the model's confidence, top-p is usually preferred over top-k.

## Putting It Together

```python
import numpy as np

def sample_next(logits, temperature=0.7, top_k=None, top_p=0.9):
    logits = np.asarray(logits, dtype=float) / max(temperature, 1e-6)
    probs = np.exp(logits - logits.max())
    probs /= probs.sum()

    order = np.argsort(probs)[::-1]                  # most likely first
    if top_k is not None:
        order = order[:top_k]                        # top-k filter
    cum = np.cumsum(probs[order])
    cutoff = np.searchsorted(cum, top_p) + 1         # top-p (nucleus) filter
    keep = order[:cutoff]

    p = probs[keep] / probs[keep].sum()              # renormalise
    return np.random.choice(keep, p=p)
```

Typical order in inference engines: apply temperature, then top-k, then top-p, then sample.

## Practical Settings

| Use case | Temperature | Top-p |
|---|---|---|
| Extraction, classification, JSON | 0 - 0.2 | 1.0 |
| Code generation | 0 - 0.3 | 0.9 - 1.0 |
| General Q&A / chat | 0.5 - 0.8 | 0.9 - 1.0 |
| Brainstorming, creative writing | 0.8 - 1.2 | 0.9 - 0.95 |

General advice: **adjust temperature or top-p, not both aggressively**, and validate with your own evals.

## Common Pitfalls

- **Expecting temperature 0 to be fully deterministic**: batching and floating-point effects on hosted APIs can still cause small variations. Use seeds where supported, and design for some variance.
- **Using high temperature to "make it smarter"**: it only adds randomness, often increasing hallucinations.
- **Ignoring model-specific behaviour**: some reasoning models fix or ignore these parameters, so check the provider docs.
- **Repetition at low temperature**: greedy decoding can loop; small temperature or a repetition/frequency penalty helps.

## Summary

- **Temperature** sharpens or flattens the probability distribution.
- **Top-k** keeps a fixed number of top tokens; **top-p** keeps an adaptive set covering probability p.
- Low values give consistent, factual output; higher values give diversity and creativity.
