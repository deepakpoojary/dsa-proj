Use **RAG when the model needs knowledge** it does not have, especially facts that change, private documents, or answers that need citations. Use **fine-tuning when you need to change behaviour**: a consistent format, tone or specialised skill, or a smaller, cheaper model for a narrow task. In many real systems you use both.

## The Core Difference

- **RAG** changes what the model **sees**: relevant documents are retrieved and added to the prompt at query time.
- **Fine-tuning** changes what the model **is**: its weights are updated on training examples.

```
RAG:          question ──► retrieve docs ──► [prompt + docs] ──► base model ──► answer
Fine-tuning:  training examples ──► update weights ──► tuned model
                                    question ──► tuned model ──► answer
```

## Comparison

| Factor | RAG | Fine-tuning |
|---|---|---|
| Best for | Knowledge, facts, documents | Behaviour, style, format, narrow skills |
| Data freshness | Update the index anytime | Retrain to update |
| Citations / traceability | Easy | Hard |
| Access control per user | Yes, filter at retrieval | No, knowledge is baked in |
| Hallucination on facts | Reduced via grounding | Can still invent facts |
| Setup | Retrieval pipeline, vector DB | Curated dataset, training runs, evals |
| Per-request cost | Higher (longer prompts) | Lower (shorter prompts, smaller model) |
| Latency | Retrieval step + longer context | Often faster |
| Data needed | Your documents as-is | Hundreds to thousands of quality examples |

## Choose RAG When

- Answers depend on **company documents, product catalogues, policies or tickets**.
- Information **changes frequently**.
- Users need **sources** they can verify.
- Different users may see **different data**.
- You want to start quickly without ML training infrastructure.

## Choose Fine-Tuning When

- You need a **strict output format** or style that prompting cannot make consistent.
- The task is **narrow and repetitive** (classification, extraction, routing) and high volume.
- You want to **distil** a large model's quality into a smaller, cheaper, faster one.
- Prompts are getting huge with instructions and examples; fine-tuning bakes them in.
- You need domain **language or jargon** handled more naturally.

Parameter-efficient methods such as **LoRA / QLoRA** make fine-tuning open models affordable, training only small adapter matrices.

## Why Fine-Tuning Is a Poor Way to Add Facts

- The model may not reliably recall facts seen only a few times in training.
- It can become **more confident** while still being wrong.
- Every update to the knowledge requires a new training run.
- You lose citations and per-user permission filtering.

## Recommended Order

1. **Prompt engineering**: clear instructions, few-shot examples, structured output.
2. **RAG**: if the gap is missing knowledge.
3. **Fine-tuning**: if the gap is behaviour, consistency, cost or latency.
4. **Combine**: fine-tune for format and domain skills, RAG for up-to-date facts.

Let **evals** drive each step: measure where the system fails before deciding.

## Example Scenarios

| Scenario | Approach |
|---|---|
| Internal HR policy assistant | RAG |
| Support bot that must reply in a fixed brand voice using help-centre articles | RAG + light fine-tuning (or strong prompting) |
| Classify 10M support tickets a day cheaply | Fine-tune a small model |
| Legal research with citations to case files | RAG |
| Convert free text to a company-specific JSON format | Fine-tune or structured outputs |

## Summary

- RAG injects knowledge at query time; fine-tuning modifies behaviour through weights.
- Use RAG for changing, private or citable knowledge; use fine-tuning for format, style, narrow tasks and cost reduction.
- Start with prompting, add RAG for knowledge, fine-tune for behaviour, and combine them when needed.
