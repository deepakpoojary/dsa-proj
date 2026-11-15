**DPO (Direct Preference Optimization)** is a way to align a language model with human preferences by training directly on pairs of "preferred vs rejected" answers, without a separate reward model or reinforcement learning loop. **RLHF** reaches the same goal in two stages: learn a reward model, then optimise the policy with RL (usually PPO).

## The shared starting point: preference data

Both methods use data like this:

```python
{
    "prompt": "Explain recursion to a beginner.",
    "chosen": "Recursion is when a function solves a problem by calling itself on a smaller piece...",
    "rejected": "Recursion: f(n) = f(n-1). Done.",
}
```

Humans (or a strong model) mark which response is better. The goal is to make the model produce more "chosen"-like answers.

## How RLHF works

1. **SFT**: fine-tune the base model on demonstration data.
2. **Reward model**: train a model that scores a response; it learns to give `chosen` a higher score than `rejected`.
3. **RL optimisation (PPO)**: the policy generates responses, the reward model scores them, and PPO updates the policy to maximise reward **minus a KL penalty** that keeps it close to the SFT reference model (to prevent reward hacking and gibberish).

This needs several models in memory at once (policy, reference, reward, value) and careful tuning.

## How DPO works

DPO shows mathematically that the optimal RLHF policy can be expressed in terms of the policy itself, so the reward model becomes **implicit**. Training reduces to a simple loss:

```python
import torch.nn.functional as F

def dpo_loss(pi_chosen, pi_rejected, ref_chosen, ref_rejected, beta=0.1):
    # Inputs are summed log-probs of each response under the policy (pi) and frozen reference model
    chosen_ratio = pi_chosen - ref_chosen
    rejected_ratio = pi_rejected - ref_rejected
    # Push the policy to prefer `chosen` more than the reference does
    return -F.logsigmoid(beta * (chosen_ratio - rejected_ratio)).mean()
```

- **beta** controls how far the model may move away from the reference (similar to the KL coefficient in RLHF).
- Training looks like ordinary supervised fine-tuning: no sampling, no reward model, no PPO.

## Comparison

| Aspect | RLHF (PPO) | DPO |
|---|---|---|
| Reward model | Explicit, trained separately | Implicit, none needed |
| Training loop | RL with on-policy sampling | Supervised-style, offline |
| Models in memory | Policy, reference, reward, value | Policy + frozen reference |
| Stability | Sensitive to hyperparameters | Stable and simple |
| Compute cost | High | Much lower |
| Flexibility | Can keep sampling new data; reward model reusable | Limited to the fixed preference dataset |
| Typical use | Frontier labs with large infra | Open-source and most practical fine-tunes |

## Variants and related methods

- **IPO**: fixes DPO's tendency to overfit to preferences.
- **KTO**: works with unpaired thumbs-up / thumbs-down data.
- **ORPO / SimPO**: drop the reference model or merge SFT and preference tuning.
- **Online / iterative DPO**: regenerate pairs from the current model to reduce the offline limitation.
- **RL with verifiable rewards** (e.g. GRPO): for math and code, where a checker gives the reward instead of humans; widely used for reasoning models.

## When to use which

- Use **DPO** (or a variant) when you have a preference dataset and want a cheap, reliable alignment step after SFT.
- Consider **RL-based methods** when you can generate fresh samples and score them automatically, or when you need a reusable reward model.

## Summary

- RLHF = reward model + PPO with a KL penalty; powerful but complex and expensive.
- DPO = a single classification-style loss on chosen/rejected pairs against a frozen reference; simpler, cheaper and stable.
- In practice, DPO-style methods are the default for most teams, while RL remains important for reasoning and online optimisation.
