Fine-tuning makes sense when you need to change **how a model behaves** (consistent format, style, tone, or a narrow task done reliably) or need to make a **smaller, cheaper model** perform like a larger one, and when prompting and RAG have already been tried and are not enough. It is usually the **wrong tool for adding knowledge**, especially knowledge that changes often; that is what retrieval is for.

## The usual order to try things

```
1. Prompt engineering (clear instructions, few-shot examples)
2. RAG / tools (give the model the right information at runtime)
3. Fine-tuning (change the model's default behaviour)
```

Each step is more expensive and slower to iterate on than the one before. Many teams fine-tune too early; a better prompt or retrieval often solves the problem.

## Good reasons to fine-tune

- **Consistent output format or style**: always producing a specific JSON structure, brand voice, or report template that prompting gets right "most of the time" but not reliably.
- **Narrow, high-volume tasks**: classification, entity extraction, routing or tagging, where a small fine-tuned model can match a large general model at a fraction of the cost.
- **Cost and latency reduction**: **distil** a large model's behaviour into a small one, and shorten prompts because instructions and examples are "baked in".
- **Domain-specific behaviour**: medical coding conventions, legal drafting patterns, internal DSLs or unusual languages.
- **Better tool use** for a specific set of tools or an agent workflow.
- **Hard-to-describe skills**: when it is easier to *show* thousands of examples than to explain the rules.

## When NOT to fine-tune

| Situation | Better option |
|---|---|
| Model lacks up-to-date or private facts | **RAG** |
| Data changes daily or weekly | **RAG** |
| You need citations and traceability | **RAG** |
| You have fewer than about 100 good examples | Prompting with few-shot examples |
| The task is broad and general | A stronger base model |
| You have not built an eval set yet | Build evals first |

Fine-tuning can teach facts to some degree, but it does so unreliably, makes hallucinations hard to detect, and must be redone whenever the facts change.

## Types of fine-tuning

- **Supervised fine-tuning (SFT)**: train on input → ideal output pairs. This is the most common type.
- **Preference tuning (DPO, RLHF)**: train on "response A is better than response B" pairs to shape style, helpfulness or safety.
- **Reinforcement fine-tuning**: optimise against a grader or reward function, useful for reasoning tasks with checkable answers.
- **Parameter-efficient fine-tuning (PEFT)**: methods such as **LoRA/QLoRA** train small adapter weights instead of the full model, which is far cheaper.

Options range from hosted fine-tuning APIs offered by model providers to self-hosted training on open-weight models with tools such as Hugging Face TRL, Unsloth or Axolotl.

## What you need

1. **A clear baseline**: measure the best prompt or RAG solution first.
2. **High-quality data**: typically hundreds to a few thousand diverse, correct, representative examples. Quality beats quantity.
3. **A held-out eval set**: to prove the fine-tuned model is actually better.
4. **A plan for maintenance**: retrain when the base model is updated or deprecated, or when requirements change.

```jsonl
{"messages": [{"role": "system", "content": "Extract invoice fields as JSON."}, {"role": "user", "content": "Invoice #4411 from Acme Ltd, total $1,250.00, due 2026-12-01"}, {"role": "assistant", "content": "{\"invoice_id\": \"4411\", \"vendor\": \"Acme Ltd\", \"total\": 1250.00, \"due_date\": \"2026-12-01\"}"}]}
```

## Costs and risks

- **Data curation** is usually the biggest effort.
- **Training and hosting costs**: custom models may cost more per token to serve, or need dedicated GPUs.
- **Catastrophic forgetting**: the model may get worse at general tasks.
- **Overfitting** to training examples.
- **Lock-in**: the fine-tune is tied to one base model version.
- **Safety regressions**: fine-tuning can weaken built-in safety behaviour, so re-test.

## Quick decision guide

- **"The model doesn't know X"** → RAG
- **"The model knows, but doesn't do it the way I want, consistently"** → fine-tune (after trying prompts)
- **"The large model works but is too slow or expensive"** → fine-tune or distil a smaller model
- **"I'm not sure"** → build evals, improve prompts, revisit later

## Summary

- Fine-tune to change behaviour (format, style, narrow tasks) or to shrink cost and latency, not to inject changing knowledge.
- Exhaust prompting and RAG first, and prove the gain with an eval set.
- Use parameter-efficient methods like LoRA to keep it affordable, and plan for ongoing maintenance.
