They are the three main stages that turn a raw neural network into a helpful assistant. **Pretraining** gives the model broad knowledge by predicting the next token over huge amounts of text, **instruction tuning** teaches it to follow instructions in a conversational format, and **RLHF** (and related preference methods) aligns its behaviour with what humans actually prefer.

## The Pipeline

```
 Raw web, books, code (trillions of tokens)
              │  Pretraining (self-supervised)
              ▼
        Base model  ── continues text, no chat manners
              │  Instruction tuning / SFT
              ▼
       Instruct model ── follows instructions
              │  Preference tuning (RLHF, DPO, RLAIF, RL on verifiable tasks)
              ▼
     Assistant model ── helpful, honest, safer, better reasoning
```

## 1. Pretraining

- **Objective**: next-token prediction (self-supervised; the text itself is the label).
- **Data**: trillions of tokens of filtered web pages, books, papers, code and multilingual text.
- **Result**: a **base model** that knows a great deal about language and the world, but simply continues text. Ask it a question and it might answer, or might write three more questions.
- **Cost**: by far the most expensive stage: thousands of GPUs for weeks or months.

## 2. Instruction Tuning (Supervised Fine-Tuning, SFT)

- **Data**: tens of thousands to millions of high-quality `(prompt, ideal response)` pairs written or curated by humans and increasingly by stronger models.
- **Objective**: still next-token prediction, but only on the response part.
- **Result**: the model learns the chat format, follows instructions, and adopts a consistent style.

```json
{"messages": [
  {"role": "user", "content": "Summarise this in one sentence: ..."},
  {"role": "assistant", "content": "The article argues that ..."}
]}
```

## 3. RLHF (Reinforcement Learning from Human Feedback)

SFT shows the model good answers, but it is hard to write a perfect answer for everything. It is easier for humans to **compare** answers.

1. **Collect preferences**: generate two or more responses per prompt; humans pick the better one.
2. **Train a reward model** that predicts which response humans prefer.
3. **Optimise the policy** (the LLM) with reinforcement learning, classically **PPO**, to maximise reward while a KL penalty keeps it close to the SFT model.

This improves helpfulness, honesty, tone and refusal behaviour.

### Modern Variants

| Method | Key idea |
|---|---|
| **RLHF (PPO)** | Reward model + RL optimisation |
| **DPO** and relatives | Learn directly from preference pairs, no separate reward model or RL loop; simpler and stable |
| **RLAIF / constitutional approaches** | An AI model judges outputs against written principles, reducing human labelling |
| **RL with verifiable rewards** | Reward from checkable outcomes (math answers, unit tests) to train reasoning models |

## Side-by-Side

| | Pretraining | Instruction tuning | RLHF / preference tuning |
|---|---|---|---|
| Data | Raw text | Prompt-response pairs | Preference rankings or rewards |
| Signal | Next token | Demonstrations | Comparisons / scores |
| Teaches | Knowledge, language | Format, following instructions | Quality, helpfulness, safety |
| Relative cost | Very high | Low-medium | Medium |
| Who does it | Model labs | Labs, some companies | Mostly labs |

## Where Developers Fit In

As an application developer you rarely pretrain. You might:

- **Fine-tune** an existing instruct model on your data (often with parameter-efficient methods like **LoRA**) to fix format, tone or a narrow task.
- Use **preference fine-tuning** (e.g. DPO) offered by some platforms to nudge style.
- More often, get most of the way with **prompting and RAG** before training anything.

## Common Misconceptions

- "RLHF adds knowledge": it mostly shapes behaviour; knowledge comes from pretraining.
- "Fine-tuning is how you teach a model your documents": retrieval is usually better for facts.
- "Base models are useless": they are great starting points for custom fine-tuning and some completion tasks.

## Summary

- **Pretraining** = broad knowledge from next-token prediction on massive text.
- **Instruction tuning** = supervised examples that teach instruction following and chat format.
- **RLHF / DPO and similar** = preference-based training that makes the model helpful, honest and safer.
