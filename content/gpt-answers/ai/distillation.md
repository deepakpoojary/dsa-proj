**Model distillation** (knowledge distillation) is a technique for training a smaller **student** model to reproduce the behaviour of a larger, more capable **teacher** model. The goal is to keep most of the teacher's quality on the tasks you care about while making inference **much cheaper and faster**.

## Why distil?

Large models are accurate but expensive: high latency, high GPU cost, and often too big for edge devices. A distilled student can be **several times smaller and faster**, which is often enough for a focused production use case.

```
Teacher (large, slow, accurate) ──► generates targets ──► Student (small, fast)
                                                           learns to imitate
```

## Classic distillation: soft targets

Introduced by Hinton et al. (2015). Instead of training the student only on hard labels ("cat"), you also train it on the teacher's **full probability distribution** (cat 0.85, lynx 0.10, dog 0.04...).

These **soft targets** carry richer information, the so-called "dark knowledge": which wrong answers are *almost* right. A **temperature** T > 1 softens the distribution so that this information is easier to learn.

```python
import torch.nn.functional as F

def distillation_loss(student_logits, teacher_logits, labels, T=2.0, alpha=0.5):
    # Soft loss: match the teacher's softened distribution
    soft = F.kl_div(
        F.log_softmax(student_logits / T, dim=-1),
        F.softmax(teacher_logits / T, dim=-1),
        reduction="batchmean",
    ) * (T * T)                       # rescale gradients for the temperature

    # Hard loss: still learn from the true labels
    hard = F.cross_entropy(student_logits, labels)

    return alpha * soft + (1 - alpha) * hard
```

Famous examples: **DistilBERT** (about 40% smaller and 60% faster than BERT while keeping about 97% of its language-understanding performance) and **TinyBERT**.

## LLM-era distillation

With large language models, distillation usually means **training on teacher-generated data**:

1. Collect or generate many **prompts** representative of your task.
2. Have the **teacher LLM** produce high-quality responses, often including **step-by-step reasoning**.
3. **Filter** them (verify answers, remove bad outputs).
4. **Fine-tune the student** (SFT, often with LoRA) on these prompt-response pairs.

This is how many small "reasoning" models are produced: they are trained on reasoning traces from much larger models. When you have access to the teacher's **logits** (for example both are open-weight models), you can also use **logit distillation** for a stronger signal.

```python
# Sketch: building a distillation dataset from a teacher model
dataset = []
for prompt in prompts:
    answer = teacher.generate(prompt, temperature=0.3)
    if verifier(prompt, answer):                 # keep only correct / high-quality outputs
        dataset.append({"prompt": prompt, "completion": answer})

# then: fine-tune the small student on `dataset`
```

## Distillation vs related techniques

| Technique | What it does | Model size |
|---|---|---|
| **Distillation** | Trains a new, smaller model to imitate a bigger one | Smaller architecture |
| **Quantization** | Lowers the numeric precision of existing weights | Same architecture, fewer bits |
| **Pruning** | Removes unimportant weights or layers | Same model, sparser or thinner |
| **Fine-tuning** | Adapts a model to a task with labelled data | Same size |

These techniques **combine** well. For example, distil a student, then quantize it for deployment.

## Benefits

- **Lower latency and cost** at inference
- **Deployable on edge or mobile** devices
- Can **match the teacher** closely on a narrow task
- Teacher-generated data reduces the need for human labelling

## Limitations and risks

- **Narrower generalisation**: the student is good on the distilled distribution and weaker outside it.
- **Inherits teacher mistakes and biases**, so filter and verify the teacher outputs.
- **Capacity limits**: a very small student cannot absorb everything.
- **Licensing and terms of use**: many commercial model providers prohibit using their outputs to train competing models, so check the terms and the open-weight licences before distilling.
- **Data generation cost**: generating large datasets with a big teacher is not free.

## When to use it

- You have a **working solution with a large model** but it is too slow or expensive at scale.
- The task is **well defined and high volume** (classification, extraction, support replies, domain Q&A).
- You can build an **eval set** to confirm the student is good enough.

## Summary

- Distillation trains a small student to imitate a large teacher, through soft-label (logit) matching or by fine-tuning on teacher-generated outputs.
- It gives large cost and latency savings with most of the quality retained on the target task.
- Watch for narrower generalisation, inherited errors, and licence restrictions on teacher outputs.
