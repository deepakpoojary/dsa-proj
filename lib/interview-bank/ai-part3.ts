import type { BankQuestion } from './types';

export const AI_3: BankQuestion[] = [
  // ───────────────────────── Fine-tuning & Models ─────────────────────────
  {
    id: 'dataset-preparation',
    group: 'Fine-tuning & Models',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you prepare a dataset for fine-tuning?',
    a: [
      'Start from the target behaviour: collect real inputs (logs, tickets, docs) and write ideal outputs; quality beats quantity (hundreds to a few thousand good examples often suffice for LoRA/SFT).',
      'Format as chat-style records (`system` / `user` / `assistant` messages, JSONL) using the exact chat template the model will see at inference.',
      'Clean: deduplicate (exact + near-duplicate), strip PII/secrets, fix wrong or inconsistent labels, drop truncated or off-policy answers.',
      'Cover the distribution: balance classes and topics, include edge cases, refusals and "I don\'t know" examples; avoid one style dominating.',
      'Split into train / validation / held-out test with no leakage (dedupe across splits, split by user or document, not by row).',
      'Check token lengths against the context window; mask the prompt so loss is computed only on assistant tokens.',
      'Synthetic data (from a stronger model) is fine but must be filtered and spot-checked by humans; check the licence of every source.',
    ],
    code: `{"messages": [
  {"role": "system", "content": "You are a support assistant for Acme."},
  {"role": "user", "content": "How do I reset my password?"},
  {"role": "assistant", "content": "Go to Settings > Security > Reset password..."}
]}`,
  },
  {
    id: 'dpo-vs-rlhf',
    group: 'Fine-tuning & Models',
    stars: 3,
    difficulty: 'Hard',
    q: 'What is DPO and how does it compare to RLHF?',
    a: [
      'Both align a model to human preferences using pairs: a prompt with a `chosen` and a `rejected` response.',
      'RLHF (PPO): train a separate reward model on the pairs, then optimise the policy with RL to maximise reward minus a KL penalty to the reference model.',
      'DPO (Direct Preference Optimization): skips the reward model and RL loop; a simple classification-style loss raises the likelihood of `chosen` over `rejected` relative to a frozen reference model.',
      'DPO is cheaper, more stable and easier to run (just supervised-style training); RLHF is more flexible (online sampling, reusable reward model) but complex and finicky.',
      '`beta` in DPO controls how far the policy may drift from the reference (like the KL coefficient).',
      'Variants: IPO, KTO (unpaired thumbs up/down), ORPO, SimPO; RL with verifiable rewards (e.g. GRPO) is used for reasoning/math/code.',
      'Typical pipeline: pretrain -> SFT -> preference tuning (DPO or RLHF).',
    ],
  },

  // ───────────────────────── Evaluation ─────────────────────────
  {
    id: 'llm-evaluation',
    group: 'Evaluation',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you evaluate an LLM application?',
    a: [
      'Define success per use case first (correctness, groundedness, format, tone, latency, cost, safety) and turn it into measurable criteria.',
      'Build a versioned eval set of representative + edge-case inputs with expected outputs or rubrics.',
      'Use the cheapest reliable grader: code checks (exact match, JSON schema, regex, unit tests) first, then LLM-as-a-judge with a rubric, then human review for calibration.',
      'Evaluate components separately: retrieval (recall@k, MRR), generation (faithfulness, relevance), tools/agents (task success, correct tool calls).',
      'Run evals offline in CI on every prompt/model change and compare against a baseline to catch regressions.',
      'Online: monitor user feedback, A/B tests, escalation rate, and sample production traces for review.',
      'Treat evals like tests: grow the set from real failures found in production.',
    ],
  },
  {
    id: 'llm-as-judge',
    group: 'Evaluation',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is LLM-as-a-judge and what are its pitfalls?',
    a: [
      'Using an LLM to grade outputs against a rubric, a reference answer, or by comparing two candidates (pairwise).',
      'Scales open-ended evaluation (helpfulness, faithfulness, tone) far cheaper than humans.',
      'Biases: position bias (prefers first/second), verbosity bias (prefers longer), self-preference (favours its own model family), sensitivity to wording.',
      'Mitigations: swap order and average, specific rubrics with binary/low-range scores, ask for reasoning before the verdict, use a different/stronger judge model.',
      'Calibrate: measure agreement with human labels on a sample (e.g. Cohen\'s kappa) before trusting it.',
      'Weak at checking facts it does not know and at math/code; prefer deterministic checks there.',
      'Pin judge model version and prompt so scores stay comparable over time.',
    ],
    code: `JUDGE_PROMPT = """You are grading an answer for faithfulness.
Context: {context}
Answer: {answer}
Does every claim in the answer follow from the context?
Think step by step, then output JSON: {"reason": "...", "faithful": true|false}"""`,
  },
  {
    id: 'eval-metrics',
    group: 'Evaluation',
    stars: 4,
    difficulty: 'Medium',
    q: 'Which metrics are used for LLM outputs (BLEU, ROUGE, exact match, faithfulness)?',
    a: [
      'Exact match / accuracy: output equals reference (after normalisation); great for classification, extraction, short QA.',
      'F1 (token overlap): partial credit for extractive QA.',
      'BLEU: n-gram precision vs reference (translation); ROUGE: n-gram recall / LCS (summarisation); both reward wording, not meaning.',
      'Semantic similarity: embedding cosine or BERTScore; tolerant of paraphrase but can miss factual errors.',
      'Faithfulness / groundedness: are claims supported by the retrieved context (hallucination check); answer relevance; context precision/recall for RAG.',
      'Task metrics: pass@k for code, JSON-schema validity, tool-call accuracy, task success rate.',
      'Also track operational metrics: latency (TTFT, p95), cost per request, refusal rate.',
    ],
  },
  {
    id: 'golden-datasets',
    group: 'Evaluation',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you build an evaluation dataset?',
    a: [
      'Seed from reality: sample real user queries/logs, then add domain-expert-written cases.',
      'Cover categories: common cases, edge cases, adversarial/jailbreak inputs, out-of-scope questions, multi-turn conversations.',
      'For each case store input, expected output or rubric, and metadata (category, difficulty, source).',
      'Start small (50-200 high-quality cases) and grow it with every production bug or user complaint.',
      'Have humans label/review; measure inter-annotator agreement for subjective criteria.',
      'Synthetic generation helps coverage but must be reviewed; keep it out of training data to avoid contamination.',
      'Version the dataset (git/DVC) so scores are comparable across runs.',
    ],
  },
  {
    id: 'regression-testing-prompts',
    group: 'Evaluation',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you test prompt changes before shipping?',
    a: [
      'Version prompts like code (in the repo or a prompt registry), reviewed via pull requests.',
      'Run the full eval suite on old vs new prompt and compare per-category scores, not just the average.',
      'Use deterministic assertions where possible (schema, contains/not-contains, length) plus LLM-judge rubrics.',
      'Run multiple samples (or `temperature=0`) to account for non-determinism; look at score variance.',
      'Gate CI: block merge if any key metric drops beyond a threshold; inspect diffs of changed outputs manually.',
      'Roll out gradually: shadow traffic or canary / A/B with online metrics and easy rollback.',
      'Pin model versions; a model upgrade is also a "prompt change" that needs the same suite.',
    ],
    code: `# promptfoo-style test case
- vars: { question: "Cancel my order #123" }
  assert:
    - type: is-json
    - type: javascript
      value: output.intent === 'cancel_order'
    - type: llm-rubric
      value: Polite and does not promise a refund`,
  },
  {
    id: 'benchmarks',
    group: 'Evaluation',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are common LLM benchmarks and their limits?',
    a: [
      'Knowledge/reasoning: MMLU / MMLU-Pro, GPQA, Humanity\'s Last Exam; math: GSM8K, MATH, AIME.',
      'Code: HumanEval, MBPP, SWE-bench (Verified), LiveCodeBench; agents/tools: tau-bench, Terminal-Bench, BFCL.',
      'Human preference: LMArena (Chatbot Arena) Elo from pairwise votes; long context: needle-in-a-haystack, RULER.',
      'Limits: data contamination (test items leaked into training), saturation (top models all score ~90%+).',
      'They measure narrow, often multiple-choice skills that rarely match your task; prompting setup changes scores.',
      'Arena-style votes reward style and length, and vendors can tune for leaderboards.',
      'Use benchmarks to shortlist models, then decide with your own task-specific evals.',
    ],
  },

  // ───────────────────────── Production & LLMOps ─────────────────────────
  {
    id: 'latency-optimization',
    group: 'Production & LLMOps',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you reduce latency in an LLM app?',
    a: [
      'Stream tokens so time-to-first-token (TTFT) is what users feel, not total generation time.',
      'Output tokens dominate latency: ask for shorter answers, cap `max_tokens`, use compact formats.',
      'Use smaller/faster models for simple steps (routing), and reduce reasoning effort where not needed.',
      'Prompt caching: keep the static prefix (system prompt, docs) identical so the provider reuses its KV cache.',
      'Parallelise independent calls (retrieval + classification, multiple tool calls) and cut sequential agent steps.',
      'Cache full responses for repeated or semantically similar queries.',
      'Infra: region close to users, keep connections warm, speculative decoding / quantisation when self-hosting.',
    ],
  },
  {
    id: 'cost-optimization',
    group: 'Production & LLMOps',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you reduce LLM API costs?',
    a: [
      'Measure first: log tokens and cost per request, feature and user.',
      'Route: cheap small model for easy requests, large model only when needed (cascade on low confidence).',
      'Shrink prompts: trim history (summarise), retrieve fewer/better chunks, remove redundant instructions.',
      'Use prompt caching for long stable prefixes (cached input tokens are heavily discounted).',
      'Cap output length; output tokens usually cost several times more than input.',
      'Batch API for offline jobs (typically ~50% cheaper); response/semantic caching for repeats.',
      'At high volume consider fine-tuning a small model or self-hosting an open model.',
    ],
  },
  {
    id: 'streaming',
    group: 'Production & LLMOps',
    stars: 4,
    difficulty: 'Easy',
    q: 'Why and how do you stream LLM responses?',
    a: [
      'Why: generation is token by token; streaming shows text after TTFT (~hundreds of ms) instead of waiting seconds for the full reply.',
      'How: call the API with `stream: true`; the provider sends Server-Sent Events (SSE) with incremental deltas.',
      'Your backend forwards chunks to the browser via SSE, a streamed HTTP response, or WebSockets.',
      'Handle: partial JSON/tool-call arguments (accumulate until complete), cancellation on client disconnect (`AbortController`), errors mid-stream.',
      'Moderation/guardrails get harder: check in chunks or buffer sensitive parts.',
      'Disable proxy buffering (e.g. nginx `X-Accel-Buffering: no`) and set proper timeouts.',
    ],
    code: `const stream = await client.chat.completions.create({
  model, messages, stream: true,
});
for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content ?? '';
  res.write(\`data: \${JSON.stringify(delta)}\\n\\n\`);
}
res.end();`,
  },
  {
    id: 'rate-limits-retries',
    group: 'Production & LLMOps',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you handle rate limits, timeouts and retries?',
    a: [
      'Providers limit requests and tokens per minute; exceeding returns HTTP `429`; overload may return `529`/`503`.',
      'Retry only transient errors (429, 5xx, network timeouts) with exponential backoff + jitter, and honour the `retry-after` header.',
      'Do not retry 400/401/403 (bad request, auth); cap attempts and total time.',
      'Set timeouts on every call (longer for long outputs) and stream so you can detect stalls.',
      'Client-side throttling: token-bucket or a queue to stay under limits; prioritise interactive over batch traffic.',
      'Fallbacks: secondary model/provider or region, cached or degraded answer, graceful error to the user.',
      'Use idempotency for side-effecting tool calls so retries do not double-act.',
    ],
    code: `async function withRetry(fn, max = 5) {
  for (let i = 0; ; i++) {
    try { return await fn(); }
    catch (e) {
      const retryable = e.status === 429 || e.status >= 500;
      if (!retryable || i >= max) throw e;
      const wait = Math.min(30_000, 2 ** i * 500) * (0.5 + Math.random());
      await new Promise(r => setTimeout(r, wait));
    }
  }
}`,
  },
  {
    id: 'observability',
    group: 'Production & LLMOps',
    stars: 4,
    difficulty: 'Medium',
    q: 'What should you log and monitor in an LLM application?',
    a: [
      'Trace every request end to end: prompt (with template version), retrieved context, tool calls, model output, model + parameters.',
      'Metrics: latency (TTFT, total, p50/p95), tokens in/out, cost, error and retry rates, cache hit rate.',
      'Quality signals: user feedback (thumbs, edits, regenerations), escalations, guardrail triggers, refusal rate.',
      'Online evals: run LLM-judge or heuristics on a sample of production traffic to track faithfulness/relevance drift.',
      'Group spans per step (retrieval, rerank, LLM, tool) with OpenTelemetry-style tracing (Langfuse, LangSmith, Phoenix...).',
      'Redact PII and secrets before storing; set retention policies.',
      'Alert on spikes in cost, latency, errors or bad feedback; feed failures back into the eval set.',
    ],
  },
  {
    id: 'guardrails',
    group: 'Production & LLMOps',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are guardrails and how do you implement them?',
    a: [
      'Guardrails = checks around the model that keep inputs and outputs safe, on-topic and well-formed.',
      'Input: prompt-injection/jailbreak detection, topic/scope classification, PII redaction, length limits.',
      'Output: moderation (toxicity, self-harm), PII/secret leakage, groundedness check, schema validation (JSON + Pydantic/Zod), banned claims.',
      'Action guardrails for agents: least-privilege tools, allow-lists, human approval for risky actions, sandboxing.',
      'Implement with fast classifiers / small models, regex rules, moderation APIs, or frameworks (Guardrails AI, NeMo Guardrails, Llama Guard).',
      'On failure: block, retry with feedback, fall back to a safe answer, or escalate to a human.',
      'Guardrails add latency and false positives; run them in parallel and evaluate them like any other component.',
    ],
  },
  {
    id: 'model-routing',
    group: 'Production & LLMOps',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is model routing / cascading?',
    a: [
      'Routing: a router picks which model handles each request (by task type, difficulty, language, cost/latency budget).',
      'Router can be rules, a small classifier, embeddings similarity, or a cheap LLM call.',
      'Cascading: try a cheap model first; escalate to a stronger model if confidence is low or validation fails.',
      'Confidence signals: self-check, logprobs, schema/test failures, judge score.',
      'Benefits: big cost and latency savings because most traffic is easy; also provider failover.',
      'Costs: extra complexity, router errors, cascade adds latency on escalated requests; needs evals per route.',
    ],
    code: `def answer(q):
    draft = small_model(q)
    if passes_checks(draft):      # schema valid, judge score high
        return draft
    return large_model(q)         # escalate only the hard ones`,
  },
  {
    id: 'serving-inference',
    group: 'Production & LLMOps',
    stars: 3,
    difficulty: 'Hard',
    q: 'How do you self-host and serve an open model (vLLM, batching)?',
    a: [
      'Use an inference server: vLLM, SGLang, TGI or TensorRT-LLM; they expose an OpenAI-compatible API.',
      'Continuous batching: new requests join the running batch every decoding step, giving far higher throughput than static batching.',
      'PagedAttention (vLLM) manages the KV cache in pages, reducing memory waste so more sequences fit; prefix caching reuses shared prompts.',
      'Size GPU memory = weights + KV cache; quantise (FP8, INT4 AWQ/GPTQ) to fit bigger models or more concurrency.',
      'Scale large models with tensor parallelism across GPUs; autoscale replicas on queue depth / GPU utilisation.',
      'Speed-ups: speculative decoding, FlashAttention, LoRA adapters served on one base model.',
      'Trade-off vs APIs: control, privacy and lower cost at high steady volume vs ops burden and GPU cost when idle.',
    ],
    code: `pip install vllm
vllm serve meta-llama/Llama-3.1-8B-Instruct \\
  --max-model-len 8192 --gpu-memory-utilization 0.9 --enable-prefix-caching
# then call http://localhost:8000/v1/chat/completions (OpenAI-compatible)`,
  },

  // ───────────────────────── AI System Design ─────────────────────────
  {
    id: 'design-chatbot-docs',
    group: 'AI System Design',
    stars: 5,
    difficulty: 'Hard',
    q: 'Design a chatbot that answers questions over company documents.',
    a: [
      'Ingestion: connectors (Drive, Confluence, PDFs) -> parse -> chunk with metadata (source, section, ACL, updated_at) -> embed -> vector DB (e.g. pgvector) + keyword index.',
      'Keep it fresh: incremental re-indexing on document change; delete removed docs.',
      'Query: rewrite with chat history -> hybrid search (BM25 + vectors) -> filter by user permissions -> rerank -> top-k chunks.',
      'Generate: grounded prompt with citations; instruct to say "I don\'t know" when context is insufficient.',
      'Security: enforce ACLs at retrieval time, redact PII, defend against prompt injection inside documents.',
      'Evaluate: retrieval recall, faithfulness, answer relevance on a golden set; collect thumbs feedback.',
      'Ops: stream responses, cache, trace every step, track cost and latency.',
    ],
  },
  {
    id: 'design-support-agent',
    group: 'AI System Design',
    stars: 4,
    difficulty: 'Hard',
    q: 'Design an AI customer-support agent.',
    a: [
      'Channels (chat, email) -> orchestrator -> LLM agent with tools and a knowledge base (RAG over help docs, policies).',
      'Tools: look up order/account, track shipment, create ticket, issue refund (with limits); each tool authenticated as the customer.',
      'Classify intent and risk first; route simple FAQs to a cheap path and complex/sensitive cases to the agent or a human.',
      'Guardrails: policy limits (refund caps), human approval for risky actions, PII handling, no promises outside policy.',
      'Human handoff with full conversation summary when confidence is low, user asks, or sentiment is bad.',
      'Memory: conversation state + customer profile; idempotent tool calls.',
      'Measure: resolution rate, escalation rate, CSAT, correctness of actions, cost per conversation; replay real tickets as evals.',
    ],
  },
  {
    id: 'design-semantic-search',
    group: 'AI System Design',
    stars: 4,
    difficulty: 'Hard',
    q: 'Design semantic search for an e-commerce catalog.',
    a: [
      'Index: build product text (title, attributes, description, reviews) -> embed (text and optionally image embeddings) -> ANN index (HNSW) plus BM25 index.',
      'Query understanding: spell-fix, extract structured filters with an LLM or NER ("red shoes under $50" -> color, category, price).',
      'Retrieval: hybrid search (lexical for SKUs/brands, vector for intent) merged with RRF, with hard filters (stock, price, region).',
      'Ranking: cross-encoder or learning-to-rank using relevance + business signals (popularity, CTR, margin, personalisation).',
      'Latency budget ~100-200 ms: cache query embeddings, precompute product vectors, avoid LLM calls on the hot path or use small models.',
      'Keep index fresh via streaming updates for price/stock.',
      'Evaluate offline (NDCG, recall@k on labelled queries) and online (CTR, add-to-cart, conversion, zero-result rate) with A/B tests.',
    ],
  },
  {
    id: 'responsible-ai',
    group: 'AI System Design',
    stars: 4,
    difficulty: 'Medium',
    q: 'What responsible-AI concerns (bias, privacy, PII) should an AI engineer handle?',
    a: [
      'Bias & fairness: test outputs across demographic groups; avoid using protected attributes in decisions; keep humans in the loop for high-stakes use.',
      'Privacy: minimise data sent to models, redact PII before prompts/logs, respect retention and deletion requests, check provider data-use terms (no training on your data).',
      'Security: prompt injection, data exfiltration via tools, least-privilege access, ACL-aware retrieval.',
      'Hallucination & safety: grounding, citations, refusals, content moderation.',
      'Transparency: tell users they are talking to AI, explain limitations, label AI-generated content.',
      'Compliance: GDPR, EU AI Act risk tiers, sector rules (HIPAA, finance); document models and data (model cards, audit logs).',
      'Monitor continuously and provide feedback / appeal channels.',
    ],
  },
];
