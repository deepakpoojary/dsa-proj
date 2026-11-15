import type { BankQuestion } from './types';

export const AI_2: BankQuestion[] = [
  // ───────────────────────── RAG ─────────────────────────
  {
    id: 'vector-databases',
    group: 'RAG',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is a vector database and how does similarity search work?',
    a: [
      'A vector database stores embeddings (dense float vectors) plus metadata and answers "find the k nearest vectors to this query vector".',
      'Text/images are turned into vectors by an embedding model; semantically similar inputs land close together in that space.',
      'Similarity metrics: cosine similarity (angle), dot product, or Euclidean (L2) distance; with normalised vectors cosine = dot product.',
      'Exact (brute-force) kNN is O(N·d) per query; at scale DBs use ANN indexes (HNSW, IVF) to trade a little recall for big speed.',
      'Real queries combine vector search with metadata filters (tenant, date, ACL) and often keyword search.',
      'Examples: pgvector (Postgres), Qdrant, Weaviate, Milvus, Pinecone, Elasticsearch/OpenSearch kNN, FAISS (library, not a DB).',
      'Rule: use the same embedding model for indexing and querying; re-embed everything when you switch models.',
    ],
    code: `import numpy as np

def top_k(query, matrix, k=5):
    # rows of matrix and query are L2-normalised -> dot = cosine
    scores = matrix @ query
    idx = np.argpartition(-scores, k)[:k]
    return idx[np.argsort(-scores[idx])]`,
  },
  {
    id: 'ann-indexes',
    group: 'RAG',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are ANN indexes like HNSW and IVF?',
    a: [
      'ANN (Approximate Nearest Neighbour) indexes avoid scanning every vector; they return most of the true top-k (recall < 100%) much faster.',
      'HNSW: multi-layer proximity graph; search greedily walks from sparse top layer down to dense bottom layer. Fast, high recall, but memory-heavy and slower to build.',
      'HNSW knobs: `M` (edges per node), `ef_construction` (build quality), `ef_search` (query-time recall vs latency).',
      'IVF: k-means clusters the vectors into `nlist` cells; a query only scans the `nprobe` closest cells. Cheaper memory, needs training, recall depends on `nprobe`.',
      'PQ (product quantization) compresses vectors (often IVF-PQ) to fit billions in RAM at some accuracy cost; DiskANN-style indexes keep the graph on SSD.',
      'Filtering + ANN is tricky: heavy pre-filters can break graph traversal; good DBs do filter-aware search.',
      'Always measure recall@k against brute force on a sample when tuning.',
    ],
    code: `-- pgvector
CREATE INDEX ON docs USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
SET hnsw.ef_search = 100;  -- higher = better recall, slower`,
  },
  {
    id: 'hybrid-search',
    group: 'RAG',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is hybrid search (BM25 + vectors) and why use it?',
    a: [
      'Hybrid search runs a lexical (keyword) search like BM25 and a dense vector search, then merges the results.',
      'BM25 is great at exact terms: IDs, error codes, product names, rare jargon; embeddings are great at paraphrases and meaning.',
      'Each covers the other\'s blind spots, so hybrid usually beats either alone on recall.',
      'Fusion: Reciprocal Rank Fusion (RRF) `score = Σ 1/(k + rank)` with k≈60 needs no score normalisation; or weighted sum of normalised scores.',
      'Learned sparse models (e.g. SPLADE) are another way to get keyword-like signals.',
      'Typical pipeline: hybrid retrieve top 50-100 → rerank → keep top 5-10 for the prompt.',
    ],
    code: `def rrf(rankings, k=60):
    scores = {}
    for ranking in rankings:          # e.g. [bm25_ids, vector_ids]
        for rank, doc_id in enumerate(ranking, start=1):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank)
    return sorted(scores, key=scores.get, reverse=True)`,
  },
  {
    id: 'reranking',
    group: 'RAG',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is reranking and why does it improve RAG?',
    a: [
      'Reranking = a second, more accurate scoring pass over the top-N candidates from fast retrieval.',
      'Retrievers use bi-encoders: query and doc are embedded separately, so similarity is cheap but coarse.',
      'Rerankers are usually cross-encoders: they read query + doc together and output a relevance score, capturing fine-grained interactions.',
      'Too slow for millions of docs, fine for 50-100 candidates: retrieve wide (recall), rerank narrow (precision).',
      'Benefits: better top-k precision, fewer irrelevant chunks in the prompt, lower token cost, less "lost in the middle".',
      'Options: hosted rerank APIs, open cross-encoders (e.g. bge-reranker), or an LLM as a listwise reranker (higher cost/latency).',
    ],
  },
  {
    id: 'rag-evaluation',
    group: 'RAG',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you evaluate a RAG system?',
    a: [
      'Evaluate retrieval and generation separately, then end to end.',
      'Retrieval metrics (need labelled relevant docs): recall@k, precision@k, MRR, nDCG, hit rate.',
      'Generation metrics: faithfulness/groundedness (claims supported by context), answer relevance, correctness vs reference answer, citation accuracy.',
      'Build a golden dataset of real user questions with expected answers/sources; include hard, ambiguous and unanswerable cases.',
      'LLM-as-judge scales grading but must be calibrated against human labels; frameworks: Ragas, TruLens, DeepEval, promptfoo.',
      'Track latency, cost per query and refusal rate; run evals in CI on every prompt/chunking/model change.',
      'In production: log traces, collect thumbs up/down, and sample failures back into the eval set.',
    ],
  },
  {
    id: 'rag-failure-modes',
    group: 'RAG',
    stars: 4,
    difficulty: 'Hard',
    q: 'What are common RAG failure modes and how do you fix them?',
    a: [
      'Missing content: answer is not in the corpus → detect and say "I don\'t know"; fix ingestion/coverage.',
      'Retrieval miss: right doc exists but is not in top-k → hybrid search, better embeddings, query rewriting, bigger k + reranking.',
      'Bad chunking: answer split across chunks or chunk lacks context → structure-aware chunking, overlap, parent-document or contextual headers.',
      'Context noise / lost in the middle: too many irrelevant chunks → rerank, fewer chunks, put best ones first/last.',
      'Unfaithful answer: model ignores or contradicts context → stricter prompt, require citations, groundedness checks.',
      'Stale or conflicting data, wrong permissions → incremental re-indexing, metadata dates, ACL filters at query time.',
      'Diagnose by inspecting traces: was the right chunk retrieved? If yes it is a generation problem, if no a retrieval problem.',
    ],
  },
  {
    id: 'advanced-rag',
    group: 'RAG',
    stars: 3,
    difficulty: 'Hard',
    q: 'What are query rewriting, HyDE and multi-query retrieval?',
    a: [
      'All three transform the user query before retrieval to improve recall.',
      'Query rewriting: an LLM turns a vague or conversational question ("what about the second one?") into a standalone, search-friendly query.',
      'HyDE (Hypothetical Document Embeddings): LLM writes a fake answer, you embed that and search with it, since answers look more like docs than questions do.',
      'Multi-query: generate several paraphrases/sub-questions, retrieve for each, merge with RRF/dedupe.',
      'Related: query decomposition for multi-hop questions, step-back prompting, routing to different indexes.',
      'Cost: extra LLM call(s) and latency; HyDE can hallucinate misleading terms. Measure with evals before adopting.',
    ],
  },

  // ───────────────────────── Agents & Tool Use ─────────────────────────
  {
    id: 'function-calling',
    group: 'Agents & Tool Use',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is function calling / tool use?',
    a: [
      'Function calling lets an LLM request that your code run a tool, by emitting a structured call (name + JSON args) instead of plain text.',
      'You describe each tool with a name, description and JSON Schema for parameters; the model decides when and how to call it.',
      'Your app executes the function, sends the result back as a tool-result message, and the model continues.',
      'The model never runs code itself: you control execution, auth and validation.',
      'Uses: fetch live data, call APIs, query DBs, do maths, take actions; also forces structured output.',
      'Best practices: clear descriptions, few well-scoped tools, validate args, handle errors and return them to the model, set a max-iterations limit.',
    ],
    code: `tools = [{
  "name": "get_weather",
  "description": "Current weather for a city",
  "input_schema": {"type": "object",
    "properties": {"city": {"type": "string"}},
    "required": ["city"]}
}]
# model -> tool_call(get_weather, {"city": "Pune"})
# app   -> runs it, returns {"temp_c": 29} as a tool result`,
  },
  {
    id: 'what-is-agent',
    group: 'Agents & Tool Use',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is an AI agent and how is it different from a chatbot?',
    a: [
      'An agent is an LLM running in a loop that decides its own next steps, calls tools, observes results and keeps going until a goal is met.',
      'A chatbot responds turn by turn: one input → one answer, no autonomous multi-step actions.',
      'Core parts: model (reasoning), tools (actions), memory/state, and a control loop with stop conditions.',
      'Agents act on the environment (edit files, call APIs, browse), so mistakes have real side effects.',
      'Trade-offs: more capable on open-ended tasks, but slower, costlier, less predictable and harder to test.',
      'Examples: coding agents, research agents, customer-support agents that issue refunds.',
    ],
    code: `while not done and steps < MAX_STEPS:
    reply = llm(messages, tools)
    if reply.tool_calls:
        results = [run(t) for t in reply.tool_calls]
        messages += [reply, *results]
    else:
        done = True`,
  },
  {
    id: 'react-pattern',
    group: 'Agents & Tool Use',
    stars: 4,
    difficulty: 'Medium',
    q: 'Explain the ReAct (reason + act) pattern.',
    a: [
      'ReAct (2022) interleaves reasoning and acting: Thought → Action → Observation, repeated until a final answer.',
      'Thought: model reasons about what it knows and what to do next.',
      'Action: it calls a tool (search, calculator, API) with arguments.',
      'Observation: the tool result is fed back and grounds the next thought.',
      'Beats reasoning-only (chain-of-thought hallucinates facts) and acting-only (no planning) on multi-step tasks.',
      'Today it is usually implemented with native tool calling plus model-internal reasoning instead of text parsing of "Action:" lines.',
      'Risks: loops, wandering, token growth → cap steps, summarise history, add clear stop criteria.',
    ],
  },
  {
    id: 'agent-memory',
    group: 'Agents & Tool Use',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do agents handle short-term and long-term memory?',
    a: [
      'Short-term memory = the context window: current conversation, tool calls and results, scratchpad.',
      'Context fills up, so manage it: trim old turns, summarise/compact history, drop large tool outputs, keep key state in a structured object.',
      'Long-term memory = external storage persisted across sessions: vector store, key-value/DB records, files.',
      'Types: episodic (past interactions), semantic (facts/preferences about the user or domain), procedural (learned instructions/skills).',
      'Write path: decide what to save (often the LLM extracts facts); read path: retrieve relevant memories and inject into the prompt.',
      'Pitfalls: stale or wrong memories, privacy (PII, deletion requests), memory poisoning via prompt injection.',
    ],
  },
  {
    id: 'multi-agent',
    group: 'Agents & Tool Use',
    stars: 3,
    difficulty: 'Medium',
    q: 'When would you use a multi-agent system?',
    a: [
      'Multi-agent = several LLM agents with separate prompts/tools/contexts that collaborate, often an orchestrator + worker sub-agents.',
      'Use when: the task splits into parallel independent sub-tasks (e.g. broad research), or context is too big for one window.',
      'Also for separation of concerns: specialised tools/permissions per agent, or a reviewer/critic agent checking another\'s work.',
      'Patterns: orchestrator-workers, pipeline/hand-off, debate/critic, hierarchical teams.',
      'Costs: many more tokens, coordination bugs, lost information at hand-offs, harder debugging.',
      'Default to a single agent with good tools; add agents only when evals show a clear gain.',
    ],
  },
  {
    id: 'mcp',
    group: 'Agents & Tool Use',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is the Model Context Protocol (MCP)?',
    a: [
      'MCP is an open protocol (introduced by Anthropic in late 2024, now widely adopted) that standardises how AI apps connect to tools and data.',
      'Think "USB-C for AI": write an MCP server once and any MCP-capable client (IDE, chat app, agent) can use it.',
      'Architecture: host app → MCP client → MCP server; messages are JSON-RPC 2.0.',
      'Servers expose tools (actions), resources (readable data) and prompts (templates).',
      'Transports: stdio for local servers, Streamable HTTP for remote ones, with OAuth for auth.',
      'Solves the M×N integration problem; risks: untrusted servers, tool-description prompt injection, over-broad permissions.',
    ],
    code: `from mcp.server.fastmcp import FastMCP

mcp = FastMCP("weather")

@mcp.tool()
def get_weather(city: str) -> str:
    """Current weather for a city."""
    return f"29C and sunny in {city}"

mcp.run()  # stdio by default`,
  },
  {
    id: 'agent-reliability',
    group: 'Agents & Tool Use',
    stars: 4,
    difficulty: 'Hard',
    q: 'How do you make agents reliable in production?',
    a: [
      'Keep it simple: prefer deterministic workflows, fewer and well-designed tools, narrow scope.',
      'Guard the loop: max steps, timeouts, token/cost budgets, loop detection, clear stop conditions.',
      'Validate everything: JSON-schema tool args, structured outputs, retries with backoff, return errors to the model so it can self-correct.',
      'Make tools idempotent and safe; require human approval for risky or irreversible actions.',
      'Observability: trace every step (prompts, tool calls, latency, cost) with tools like LangSmith, Langfuse or OpenTelemetry.',
      'Evals: scenario test suites and regression tests on every prompt/model change; measure task success rate, not just vibes.',
      'Plan fallbacks: model fallback, graceful degradation, hand-off to a human.',
    ],
  },
  {
    id: 'workflows-vs-agents',
    group: 'Agents & Tool Use',
    stars: 4,
    difficulty: 'Medium',
    q: 'Workflows vs agents: when do you need an autonomous agent?',
    a: [
      'Workflow: LLM calls orchestrated through predefined code paths (chains, routing, parallel steps). Agent: the LLM decides the path dynamically.',
      'Workflows are predictable, cheaper, faster and easier to test and debug.',
      'Agents handle open-ended problems where the number/order of steps cannot be known in advance (coding, research, troubleshooting).',
      'Common workflow patterns: prompt chaining, routing, parallelisation, orchestrator-workers, evaluator-optimizer.',
      'Rule: start with a single LLM call + retrieval; move to a workflow; use an agent only when flexibility is needed and errors are tolerable/recoverable.',
      'Agents need an environment with feedback (tests, tool results) to correct themselves.',
    ],
  },
  {
    id: 'agent-safety-permissions',
    group: 'Agents & Tool Use',
    stars: 4,
    difficulty: 'Hard',
    q: 'How do you limit what an agent is allowed to do?',
    a: [
      'Least privilege: give only the tools needed, scoped credentials (read-only where possible, per-user tokens, short-lived).',
      'Enforce permissions in code, not in the prompt: the tool layer checks authz; the model cannot be trusted to obey rules.',
      'Allow-lists for commands, domains, file paths; deny dangerous operations by default.',
      'Sandboxing: containers/VMs, no network or egress allow-list, resource limits.',
      'Human-in-the-loop approvals for irreversible or high-impact actions (payments, deletes, sending email).',
      'Defend against prompt injection from tool outputs/web pages: treat them as data, separate privileges, avoid combining private data + untrusted input + exfiltration channel.',
      'Audit logs, rate limits, spending caps and a kill switch.',
    ],
  },

  // ───────────────────────── Fine-tuning & Models ─────────────────────────
  {
    id: 'fine-tuning-when',
    group: 'Fine-tuning & Models',
    stars: 5,
    difficulty: 'Medium',
    q: 'When does fine-tuning make sense?',
    a: [
      'Try prompting first, then RAG; fine-tune only when those plateau.',
      'Good for: consistent style/format/tone, narrow classification or extraction tasks, domain-specific behaviour, reliable tool-call formats.',
      'Good for cost/latency: distil a big model\'s behaviour into a small, cheap model.',
      'Not good for: adding fresh or frequently changing knowledge (use RAG), or facts that need citations.',
      'Needs: hundreds to thousands of high-quality examples, an eval set, and a baseline to beat.',
      'Types: SFT (input → output pairs), preference tuning (DPO/RLHF), RL fine-tuning with graders; PEFT methods like LoRA cut cost.',
      'Costs: data curation, training, hosting, re-tuning when the base model changes, risk of forgetting general skills.',
    ],
  },
  {
    id: 'lora-qlora',
    group: 'Fine-tuning & Models',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are LoRA and QLoRA?',
    a: [
      'LoRA (Low-Rank Adaptation) freezes the base weights and learns a small update `ΔW = B·A` with rank r (e.g. 8-64) for chosen layers.',
      'Trains well under 1% of parameters → much less GPU memory, faster training, tiny adapter files (MBs).',
      'Adapters can be merged into the weights for zero extra latency, or hot-swapped per tenant/task on one base model.',
      'QLoRA: base model loaded in 4-bit (NF4) quantization, LoRA adapters trained in higher precision → fine-tune large models on a single GPU.',
      'Key hyperparameters: rank `r`, `lora_alpha` (scaling), target modules (attention q/k/v/o, MLP), learning rate.',
      'Quality is usually close to full fine-tuning for most tasks; tools: Hugging Face PEFT, Unsloth, Axolotl.',
    ],
    code: `from peft import LoraConfig, get_peft_model

config = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05,
                    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"])
model = get_peft_model(base_model, config)
model.print_trainable_parameters()  # ~0.1-1% trainable`,
  },
  {
    id: 'quantization',
    group: 'Fine-tuning & Models',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is quantization and what are its trade-offs?',
    a: [
      'Quantization stores weights (and sometimes activations/KV cache) in fewer bits: FP16/BF16 → INT8, FP8, INT4.',
      'Memory: a 70B model needs ~140 GB in FP16 but ~35-40 GB in 4-bit.',
      'Benefits: fits on smaller/cheaper GPUs or laptops, higher throughput, lower cost; decoding is memory-bandwidth bound so fewer bytes = faster.',
      'Trade-off: some quality loss; 8-bit is near-lossless, 4-bit is usually fine, below 4-bit degrades noticeably (esp. reasoning, maths, code).',
      'PTQ (post-training quantization: GPTQ, AWQ, GGUF) vs QAT (quantization-aware training, better quality, needs training).',
      'Gains depend on hardware/kernel support (e.g. FP8 on newer GPUs); always evaluate on your own tasks.',
    ],
  },
  {
    id: 'distillation',
    group: 'Fine-tuning & Models',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is model distillation?',
    a: [
      'Distillation trains a smaller student model to imitate a larger teacher model.',
      'Classic (logit) distillation: student matches the teacher\'s soft probability distribution (with temperature), which carries more signal than hard labels.',
      'LLM-style distillation: teacher generates outputs (often with reasoning) on many prompts; student is fine-tuned on them (SFT on synthetic data).',
      'Goal: much cheaper/faster inference while keeping most quality on the target tasks.',
      'Student generalises worse outside the distilled distribution; it can also copy teacher errors.',
      'Check the teacher model\'s licence/terms: many providers restrict using outputs to train competing models.',
    ],
    code: `import torch.nn.functional as F

def distill_loss(student_logits, teacher_logits, labels, T=2.0, alpha=0.5):
    soft = F.kl_div(F.log_softmax(student_logits / T, -1),
                    F.softmax(teacher_logits / T, -1),
                    reduction="batchmean") * T * T
    hard = F.cross_entropy(student_logits, labels)
    return alpha * soft + (1 - alpha) * hard`,
  },
];
