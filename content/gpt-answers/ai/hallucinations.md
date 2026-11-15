LLMs hallucinate because they are trained to produce **plausible next tokens**, not to check facts. When the model lacks reliable knowledge, it still generates the most likely-sounding continuation, which can be confidently wrong. You reduce it mainly by **grounding** answers in trusted data, constraining the task, and **verifying** outputs.

## What Counts as a Hallucination

- **Factual errors**: wrong dates, invented statistics, non-existent APIs or library functions.
- **Fabricated sources**: fake citations, URLs, court cases or paper titles.
- **Unfaithfulness**: the answer contradicts or goes beyond the documents you supplied.
- **Reasoning slips**: a plausible chain of steps with a wrong step in the middle.

## Why It Happens

1. **Objective mismatch**: next-token prediction rewards fluency and likelihood, not truth.
2. **No built-in uncertainty signal**: the model does not reliably know what it does not know, and evaluation/training often rewards guessing over saying "I am not sure".
3. **Knowledge gaps**: rare facts, niche domains and events after the **training cutoff** are weakly represented or missing.
4. **Compression**: billions of facts are squeezed into weights; similar facts blur together.
5. **Pressure from the prompt**: leading questions or demands for a specific answer push the model to comply.
6. **Long, multi-step generation**: early errors compound because each token conditions on the previous ones.

## How to Reduce Hallucinations

### 1. Ground the Model (RAG)

Retrieve relevant documents and instruct the model to answer only from them.

```python
SYSTEM = """Answer using ONLY the information in <context>.
If the answer is not in the context, reply exactly: "I don't know based on the provided documents."
Cite the source id for every claim, like [doc-3]."""

def answer(question, retriever, llm):
    docs = retriever.search(question, top_k=5)
    context = "\n\n".join(f"[{d.id}] {d.text}" for d in docs)
    prompt = f"<context>\n{context}\n</context>\n\nQuestion: {question}"
    return llm(system=SYSTEM, user=prompt, temperature=0)
```

### 2. Give Permission to Say "I Don't Know"

Explicitly allow abstention. Models are much more likely to admit uncertainty when the prompt makes it an acceptable answer.

### 3. Use Tools for Facts and Math

Let the model call search, a database, a calculator or a code interpreter instead of recalling or computing from memory.

### 4. Ask for Evidence

Request direct quotes from the source before the answer, then **programmatically check** that quotes actually appear in the documents.

### 5. Constrain the Task

- Lower **temperature** for factual tasks.
- Use **structured output** with fields like `"answer"` and `"confidence"` or `"found": false`.
- Break large tasks into smaller, checkable steps.

### 6. Verify After Generation

- **Self-check / second pass**: ask a model to verify each claim against the sources.
- **LLM-as-judge faithfulness evals** in CI and on production samples.
- **Human review** for high-stakes outputs (legal, medical, finance).

## Technique Comparison

| Technique | Reduces | Cost |
|---|---|---|
| RAG with strict instructions | Factual and outdated answers | Retrieval infra |
| Allow "I don't know" | Guessing | Nearly free |
| Tool use | Math and lookup errors | Integration work |
| Citations + quote checks | Fabricated sources | Extra tokens, code |
| Verification pass / evals | Unfaithful answers | Extra calls |
| Fine-tuning | Domain format errors | Training effort; does not reliably add facts |

## Common Pitfalls

- Assuming RAG eliminates hallucinations; poor retrieval just feeds the model wrong or missing context.
- Trusting citations without checking them.
- Using fine-tuning to "teach facts"; it often increases confident errors.
- Not measuring: without an eval set you cannot tell whether a change helped.

## Summary

- Hallucinations come from optimising for plausible text rather than verified truth, plus knowledge gaps.
- Grounding (RAG, tools), allowing abstention and constraining outputs cut them substantially.
- Verification and evals are essential, because no technique removes them completely.
