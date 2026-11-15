LLM outputs are measured with a mix of **reference-based metrics** (exact match, F1, BLEU, ROUGE), **semantic metrics** (embedding similarity, BERTScore), **RAG-specific metrics** (faithfulness, relevance, context recall) and **task metrics** (pass@k, schema validity). No single metric works everywhere; pick based on the task.

## Reference-based metrics

These compare the output to a known correct answer.

### Exact match and accuracy

The output equals the reference after normalisation (lowercase, strip punctuation). Ideal for **classification, extraction and short-answer QA**.

### Token F1

Measures word overlap between output and reference, giving partial credit. Common in extractive QA (e.g. SQuAD-style tasks).

### BLEU

Measures **n-gram precision**: how many n-grams in the output appear in the reference. Created for **machine translation**.

### ROUGE

Measures **n-gram recall** (ROUGE-1, ROUGE-2) or longest common subsequence (ROUGE-L). Created for **summarisation**.

```python
# pip install evaluate rouge_score sacrebleu
import evaluate

rouge = evaluate.load("rouge")
bleu = evaluate.load("sacrebleu")

preds = ["The cat sat on the mat."]
refs = ["A cat was sitting on the mat."]

print(rouge.compute(predictions=preds, references=refs))      # rouge1, rouge2, rougeL
print(bleu.compute(predictions=preds, references=[refs]))     # score 0-100
```

**Limitation**: BLEU and ROUGE reward matching words, not meaning. A correct paraphrase scores low, and a fluent answer with one wrong number can score high. They correlate poorly with human judgement for open-ended chat.

## Semantic metrics

- **Embedding cosine similarity**: embed both texts and compare vectors.
- **BERTScore**: matches tokens using contextual embeddings.

They tolerate paraphrase but can still miss factual errors ("the meeting is on Monday" vs "Tuesday" looks very similar).

## RAG and groundedness metrics

Usually computed with an LLM judge or NLI model (frameworks like Ragas or DeepEval implement them):

- **Faithfulness / groundedness**: fraction of claims in the answer supported by the retrieved context. The main **hallucination** metric.
- **Answer relevance**: does the answer address the question?
- **Context precision**: how much of the retrieved context is relevant?
- **Context recall**: did retrieval find everything needed to answer?
- **Retrieval metrics**: recall@k, MRR, NDCG on labelled query-document pairs.

## Task-specific metrics

- **pass@k** for code generation: does at least one of k samples pass the unit tests?
- **Schema validity**: percentage of outputs that parse as valid JSON matching the schema
- **Tool-call accuracy**: correct tool and arguments
- **Task success rate** for agents
- **Human preference / win rate** in pairwise comparisons

## Choosing a metric

| Task | Good metrics | Avoid relying on |
|---|---|---|
| Classification, extraction | Exact match, accuracy, F1 | BLEU/ROUGE |
| Translation | BLEU, chrF, COMET, human review | Exact match |
| Summarisation | ROUGE + faithfulness + LLM judge | ROUGE alone |
| RAG Q&A | Faithfulness, answer relevance, context recall | BLEU |
| Code generation | pass@k, test pass rate | Text similarity |
| Open-ended chat | LLM judge rubrics, human preference | n-gram overlap |

Also track **operational metrics** alongside quality: latency (time to first token, p95), tokens and cost per request, and refusal or error rate.

## Summary

- Exact match and F1 suit tasks with one right answer; BLEU and ROUGE measure word overlap and are weak proxies for meaning.
- Faithfulness, relevance and context recall are the key metrics for RAG.
- Combine task-appropriate automatic metrics with LLM judges and human review.
