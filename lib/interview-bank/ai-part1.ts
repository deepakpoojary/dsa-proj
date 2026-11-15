import type { BankQuestion } from './types';

export const AI_1: BankQuestion[] = [
  // ───────────────────────── LLM Fundamentals ─────────────────────────
  {
    id: 'how-llms-work',
    group: 'LLM Fundamentals',
    stars: 5,
    difficulty: 'Easy',
    q: 'How does a large language model generate text?',
    a: [
      'An LLM is a neural network (a decoder-only transformer) trained to predict the next token given all previous tokens.',
      'Generation is autoregressive: tokenize the prompt, run a forward pass, get a probability distribution over the vocabulary, pick one token, append it, repeat.',
      'The final layer outputs logits; softmax turns them into probabilities; a sampling strategy (greedy, temperature, top-p) chooses the token.',
      'It stops at an end-of-sequence token, a stop sequence, or the `max_tokens` limit.',
      'Prompt tokens are processed in parallel (prefill); output tokens are produced one at a time (decode), which is why output tokens are slower and pricier.',
      'The model has no memory between calls: each request must contain the whole conversation it should see.',
    ],
    code: `tokens = tokenize(prompt)
while len(out) < max_tokens:
    logits = model(tokens)[-1]          # scores for next token
    probs = softmax(logits / temperature)
    nxt = sample(probs)                 # or argmax for greedy
    if nxt == EOS: break
    tokens.append(nxt); out.append(nxt)`,
  },
  {
    id: 'tokens-tokenization',
    group: 'LLM Fundamentals',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are tokens and how does tokenization work?',
    a: [
      'A token is the unit the model reads and writes: usually a word, sub-word piece, punctuation mark or byte sequence, mapped to an integer id.',
      'Most LLMs use sub-word tokenizers such as BPE (Byte-Pair Encoding), WordPiece or SentencePiece, learned from a corpus by merging frequent character pairs.',
      'Rule of thumb for English: ~1 token per 4 characters, or ~0.75 words per token; code and non-English text often use more tokens.',
      'Context limits, pricing and latency are all measured in tokens, so token counts matter for cost and design.',
      'Tokenization explains quirks: models struggle to count letters or reverse strings because they see chunks, not characters.',
      'Each model family has its own tokenizer; count tokens with that model tokenizer (e.g. `tiktoken` or the provider token-count API).',
    ],
    code: `import tiktoken
enc = tiktoken.get_encoding("o200k_base")
ids = enc.encode("Tokenization is fun!")
print(ids, len(ids))                 # list of ints, ~5 tokens
print([enc.decode([i]) for i in ids])  # ['Token', 'ization', ' is', ' fun', '!']`,
  },
  {
    id: 'transformer-attention',
    group: 'LLM Fundamentals',
    stars: 5,
    difficulty: 'Medium',
    q: 'Explain the transformer architecture and self-attention.',
    a: [
      'A transformer is a stack of identical blocks, each with a self-attention layer and a feed-forward (MLP) layer, plus residual connections and layer norm.',
      'Self-attention: every token builds a Query, Key and Value vector; scores `Q·K^T / sqrt(d_k)` decide how much each token attends to every other token; output is a weighted sum of Values.',
      'Multi-head attention runs several attention heads in parallel so different heads can learn different relationships (syntax, coreference, position).',
      'Positional information is added via positional encodings (today usually RoPE), since attention itself is order-agnostic.',
      'Decoder-only LLMs use a causal mask so a token can only attend to earlier tokens.',
      'Attention cost grows O(n^2) with sequence length, which drives tricks like FlashAttention, GQA and sliding-window attention.',
      'Big win over RNNs: all positions are processed in parallel during training, which made scaling to huge datasets practical.',
    ],
    code: `import torch, math
def attention(Q, K, V, causal=True):
    scores = Q @ K.transpose(-2, -1) / math.sqrt(Q.size(-1))
    if causal:
        n = scores.size(-1)
        mask = torch.triu(torch.ones(n, n, dtype=torch.bool), 1)
        scores = scores.masked_fill(mask, float("-inf"))
    return torch.softmax(scores, dim=-1) @ V`,
  },
  {
    id: 'context-window',
    group: 'LLM Fundamentals',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is a context window and what happens when you exceed it?',
    a: [
      'The context window is the maximum number of tokens (input + output) the model can attend to in one request.',
      'Modern models range from ~8K to 1M+ tokens, but bigger contexts cost more and add latency.',
      'Exceeding it: most APIs reject the request with an error; some frameworks silently truncate the oldest messages.',
      'Even within the limit, quality can drop on very long inputs ("lost in the middle": facts in the middle get less attention).',
      'Strategies: summarise or trim older chat history, use RAG to retrieve only relevant chunks, sliding windows, or split the task into steps.',
      'Always budget for output: `max_tokens` must fit in what remains after the prompt.',
    ],
  },
  {
    id: 'temperature-top-p',
    group: 'LLM Fundamentals',
    stars: 4,
    difficulty: 'Easy',
    q: 'What do temperature, top-p and top-k control?',
    a: [
      'All three control randomness when sampling the next token from the probability distribution.',
      'Temperature divides logits before softmax: low (0-0.3) = sharper, near-deterministic; high (0.8-1.2) = flatter, more creative and more error-prone.',
      'Top-k: only sample from the k most likely tokens.',
      'Top-p (nucleus): only sample from the smallest set of tokens whose cumulative probability reaches p (e.g. 0.9); adapts to how confident the model is.',
      'Use low temperature for extraction, classification, code and JSON; higher for brainstorming and creative writing.',
      'Tune temperature OR top-p, not both aggressively; temperature 0 still is not perfectly deterministic on most hosted APIs.',
    ],
    code: `import numpy as np
def sample(logits, temperature=0.7, top_p=0.9):
    p = np.exp(logits / temperature); p /= p.sum()
    idx = np.argsort(p)[::-1]                  # most likely first
    cut = np.searchsorted(np.cumsum(p[idx]), top_p) + 1
    keep = idx[:cut]                           # the nucleus
    q = p[keep] / p[keep].sum()
    return np.random.choice(keep, p=q)`,
  },
  {
    id: 'hallucinations',
    group: 'LLM Fundamentals',
    stars: 5,
    difficulty: 'Medium',
    q: 'Why do LLMs hallucinate and how do you reduce it?',
    a: [
      'Hallucination = fluent, confident output that is false or unsupported by the provided sources.',
      'Cause: the model is trained to produce plausible next tokens, not verified facts; it has no built-in "I do not know" signal and training often rewards guessing.',
      'Worse for rare facts, recent events past the training cutoff, precise numbers, citations and long multi-step reasoning.',
      'Reduce it with grounding: RAG over trusted documents, and instruct "answer only from the context; otherwise say you do not know".',
      'Ask for citations/quotes from the sources and verify them programmatically; use tools (search, calculator, DB) for facts and math.',
      'Lower temperature, structured output, smaller well-scoped tasks, and evals / LLM-as-judge checks for faithfulness in production.',
    ],
  },
  {
    id: 'pretraining-vs-finetuning-vs-rlhf',
    group: 'LLM Fundamentals',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are pretraining, instruction tuning and RLHF?',
    a: [
      'Pretraining: self-supervised next-token prediction on trillions of tokens of web, books and code; produces a base model with broad knowledge but no chat behaviour.',
      'Instruction tuning (SFT): supervised fine-tuning on curated prompt/response pairs so the model follows instructions and adopts a chat format.',
      'RLHF: humans rank model outputs, a reward model learns those preferences, then the policy is optimised (e.g. PPO) to maximise reward.',
      'Modern variants: DPO (direct preference optimisation, no separate reward model), RLAIF / constitutional methods using AI feedback, and RL with verifiable rewards for reasoning (math, code tests).',
      'Pretraining is by far the most expensive stage; SFT and preference tuning are comparatively cheap but shape helpfulness, tone and safety.',
      'As an app developer you usually only do light fine-tuning (often LoRA) on top of an already aligned model.',
    ],
  },
  {
    id: 'embeddings',
    group: 'LLM Fundamentals',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are embeddings?',
    a: [
      'An embedding is a dense vector of numbers (e.g. 384-3072 dims) that represents the meaning of text, images or other data.',
      'Similar meanings land close together in vector space, so similarity is measured with cosine similarity or dot product.',
      'Produced by embedding models (sentence-transformers, provider embedding APIs), which are separate from chat/generation models.',
      'Uses: semantic search, RAG retrieval, clustering, deduplication, recommendations, classification and anomaly detection.',
      'Stored and searched in vector databases or indexes (pgvector, FAISS, Pinecone, Qdrant) using ANN algorithms like HNSW.',
      'Always embed queries and documents with the same model; changing the model means re-embedding everything.',
    ],
    code: `from sentence_transformers import SentenceTransformer, util
m = SentenceTransformer("all-MiniLM-L6-v2")
a, b = m.encode(["How do I reset my password?", "Forgot login credentials"])
print(util.cos_sim(a, b))  # high similarity, ~0.6+`,
  },
  {
    id: 'kv-cache',
    group: 'LLM Fundamentals',
    stars: 3,
    difficulty: 'Hard',
    q: 'What is the KV cache and why does it matter for inference?',
    a: [
      'During decoding, each new token needs attention over all previous tokens Keys and Values; recomputing them every step would be quadratic waste.',
      'The KV cache stores the Key/Value tensors of already processed tokens per layer, so each step only computes K/V for the new token.',
      'Turns per-token decode cost from re-processing the whole sequence into roughly constant extra work plus attention over the cache.',
      'Trade-off: memory. Size grows with layers x heads x head_dim x sequence length x batch, and often limits batch size and context length on GPUs.',
      'Optimisations: GQA/MQA (share K/V across heads), quantised KV cache, PagedAttention (vLLM) to avoid fragmentation, and prefix caching to reuse a shared prompt.',
      'Prompt caching in hosted APIs is essentially reusing the KV cache of a repeated prefix across requests.',
    ],
  },
  {
    id: 'open-vs-closed-models',
    group: 'LLM Fundamentals',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you choose between open-weight and closed (API) models?',
    a: [
      'Closed / API models (e.g. GPT, Claude, Gemini): usually top quality, zero infra, pay per token, fast to start; but data leaves your environment and you depend on the vendor.',
      'Open-weight models (e.g. Llama, Mistral, Qwen, DeepSeek, Gemma): self-host or use any host, full control, fine-tune freely, data stays private, no per-token vendor lock-in.',
      'Open-weight costs: GPUs, serving stack (vLLM, TGI, llama.cpp), scaling, monitoring and ops expertise; cheaper only at sustained high volume.',
      'Decide on: quality needed for the task, data privacy / compliance, latency and on-device needs, cost at your volume, customisation, and licence terms.',
      'Common pattern: prototype on a frontier API, build evals, then move high-volume simple tasks to smaller open or cheaper models.',
      'Keep a provider-agnostic abstraction so you can swap models as the landscape changes.',
    ],
  },

  // ───────────────────────── Prompt Engineering ─────────────────────────
  {
    id: 'prompt-engineering-basics',
    group: 'Prompt Engineering',
    stars: 5,
    difficulty: 'Easy',
    q: 'What makes a good prompt?',
    a: [
      'Be clear and specific: state the task, audience, constraints and what "good" looks like.',
      'Give context: relevant background, data and the reason behind the task.',
      'Define the output format explicitly (bullet list, JSON schema, length limit).',
      'Show examples (few-shot) for tricky formats or style; use delimiters such as XML tags or headings to separate instructions from data.',
      'Assign a role in the system prompt and break complex tasks into steps or chained calls.',
      'Iterate empirically: build a small eval set and test prompt changes against it instead of guessing.',
    ],
    code: `You are a support assistant for an e-commerce site.
Task: classify the customer email below.
Categories: refund, shipping, account, other.
Return JSON: {"category": string, "reason": string}

<email>
{{email_text}}
</email>`,
  },
  {
    id: 'zero-few-shot',
    group: 'Prompt Engineering',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between zero-shot and few-shot prompting?',
    a: [
      'Zero-shot: only an instruction, no examples; relies on the model general ability.',
      'Few-shot: include a few input/output examples in the prompt so the model infers the pattern (in-context learning).',
      'Few-shot helps with custom formats, labels, tone, edge cases and smaller models.',
      'Costs: more tokens per call, and the model may over-copy examples; choose diverse, representative examples.',
      'One-shot = exactly one example; many-shot = dozens or hundreds, practical with long context windows.',
      'Strong modern models often do well zero-shot; add examples when evals show inconsistency.',
    ],
    code: `Classify sentiment as positive or negative.

Review: "Arrived broken." -> negative
Review: "Love the battery life!" -> positive
Review: "Stopped working after a week." ->`,
  },
  {
    id: 'chain-of-thought',
    group: 'Prompt Engineering',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is chain-of-thought prompting and when does it help?',
    a: [
      'Chain-of-thought (CoT) = asking the model to reason step by step before giving the final answer.',
      'Helps on multi-step problems: math, logic, planning, complex classification with rules, debugging.',
      'Why it works: each generated token is extra computation; writing intermediate steps lets the model condition on its own work.',
      'Variants: zero-shot CoT ("think step by step"), few-shot CoT with worked examples, self-consistency (sample several chains, majority vote).',
      'Reasoning models (extended or adaptive thinking) do this internally; for them, explicit CoT prompts are less needed.',
      'Costs more tokens and latency; little benefit for simple lookups. Ask for reasoning in a separate tag/field so the final answer is easy to parse.',
    ],
  },
  {
    id: 'system-prompts',
    group: 'Prompt Engineering',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is a system prompt and how is it different from a user message?',
    a: [
      'The system prompt is a developer-set instruction that frames the whole conversation: role, rules, tone, tools, output format.',
      'User messages are the end-user turns; assistant messages are the model replies.',
      'Models are trained to give system instructions higher priority than user instructions (an instruction hierarchy).',
      'System prompts persist across turns, so they are the place for stable behaviour and are a good candidate for prompt caching.',
      'They are not a security boundary: users can sometimes extract or override them, so never put secrets in them.',
      'Keep them focused; put task-specific data in the user turn.',
    ],
    code: `messages = [
  {"role": "system", "content": "You are a concise SQL tutor. Answer in under 100 words."},
  {"role": "user", "content": "What does a LEFT JOIN do?"},
]`,
  },
  {
    id: 'structured-output',
    group: 'Prompt Engineering',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you get reliable structured (JSON) output from an LLM?',
    a: [
      'Best option: use the provider native structured outputs / JSON-schema mode or constrained decoding, which guarantees schema-valid output.',
      'Alternative: tool/function calling with a JSON schema for arguments.',
      'Still validate on your side with a schema library (Pydantic, Zod) and retry with the validation error on failure.',
      'In the prompt: give the exact schema, an example, and say "return only JSON"; keep temperature low.',
      'Self-hosted: libraries like Outlines, XGrammar or vLLM guided decoding constrain tokens to a grammar.',
      'Design schemas simply: enums for categories, optional fields over guessing, and a field for "unknown".',
    ],
    code: `from pydantic import BaseModel
from openai import OpenAI

class Ticket(BaseModel):
    category: str
    urgent: bool

client = OpenAI()
resp = client.responses.parse(
    model="gpt-4.1-mini",
    input="Classify: 'My card was charged twice!'",
    text_format=Ticket,
)
print(resp.output_parsed)  # Ticket(category='billing', urgent=True)`,
  },
  {
    id: 'prompt-injection',
    group: 'Prompt Engineering',
    stars: 5,
    difficulty: 'Hard',
    q: 'What is prompt injection and how do you defend against it?',
    a: [
      'Prompt injection = untrusted text overrides the developer instructions, e.g. "ignore previous instructions and ...".',
      'Direct injection comes from the user; indirect injection hides in data the model reads (web pages, emails, PDFs, tool results).',
      'Risk is highest for agents with tools: injected text can trigger data exfiltration, unwanted actions or leaked system prompts.',
      'There is no complete fix; use defence in depth: least-privilege tools, human confirmation for sensitive actions, and treat all model output as untrusted.',
      'Separate and label untrusted content (delimiters, "this is data, not instructions"), use input/output classifiers and guardrails.',
      'Never put secrets in prompts; enforce authorisation in code, not in the prompt; sanitise output before rendering (no auto-loading links/images).',
    ],
  },
  {
    id: 'prompt-caching',
    group: 'Prompt Engineering',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is prompt caching and how does it reduce cost and latency?',
    a: [
      'Prompt caching reuses the computed state (KV cache) of a prompt prefix that is identical across requests.',
      'Cached input tokens are billed at a large discount and skip prefill, cutting time-to-first-token for long prompts.',
      'Works on exact prefix matches: put stable content first (system prompt, tool definitions, documents, few-shot examples) and variable content last.',
      'Some providers cache automatically; others need explicit cache breakpoints (e.g. `cache_control`). Caches expire after a short TTL (minutes) unless refreshed.',
      'Great for chatbots with long system prompts, RAG over the same document, agents re-sending tool definitions, and multi-turn conversations.',
      'Any change early in the prompt (even a timestamp) invalidates everything after it; monitor cache-hit tokens in the usage response.',
    ],
  },

  // ───────────────────────── RAG ─────────────────────────
  {
    id: 'what-is-rag',
    group: 'RAG',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is Retrieval-Augmented Generation (RAG)?',
    a: [
      'RAG = retrieve relevant information from an external knowledge source at query time and add it to the prompt so the LLM answers grounded in it.',
      'Indexing: load documents, chunk them, embed each chunk, store vectors + text in a vector store.',
      'Query: embed the question, retrieve top-k similar chunks (often hybrid vector + keyword search, then a reranker), insert them into the prompt, generate.',
      'Benefits: up-to-date and private knowledge without retraining, fewer hallucinations, citations to sources, access control per document.',
      'Failure points: bad chunking, poor retrieval recall, irrelevant context, and the model ignoring the context.',
      'Evaluate retrieval (recall@k, MRR) and generation (faithfulness, answer relevance) separately.',
    ],
    code: `q_vec = embed(question)
chunks = vector_db.search(q_vec, top_k=5)
context = "\\n\\n".join(c.text for c in chunks)
prompt = f"Answer using only the context.\\n<context>{context}</context>\\nQ: {question}"
answer = llm(prompt)`,
  },
  {
    id: 'rag-vs-finetuning',
    group: 'RAG',
    stars: 5,
    difficulty: 'Medium',
    q: 'When should you use RAG vs fine-tuning?',
    a: [
      'RAG adds knowledge at query time; fine-tuning changes model behaviour by updating weights.',
      'Use RAG for facts that change, private/large document sets, needing citations, and per-user access control.',
      'Use fine-tuning for consistent style/format/tone, narrow specialised tasks, shorter prompts, or distilling a big model into a cheaper one.',
      'Fine-tuning is a poor way to teach new facts: it is costly to update and the model can still hallucinate them.',
      'Try in order: prompt engineering, then RAG, then fine-tuning (often parameter-efficient LoRA) when evals show a gap.',
      'They combine well: fine-tune for format and domain behaviour, RAG for current knowledge.',
    ],
  },
  {
    id: 'chunking',
    group: 'RAG',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you chunk documents for RAG?',
    a: [
      'Chunking splits documents into pieces small enough to embed and retrieve precisely, but large enough to carry meaning.',
      'Typical start: 200-800 tokens per chunk with 10-20% overlap so ideas spanning boundaries are not lost.',
      'Strategies: fixed-size, recursive (split by paragraphs, then sentences), structure-aware (Markdown headings, HTML, code functions), semantic (split where embedding similarity drops).',
      'Attach metadata (source, title, section, page, date) for filtering and citations; prepending the section title or a short doc summary ("contextual chunks") boosts retrieval.',
      'Too small = lost context; too big = diluted embeddings and wasted prompt tokens.',
      'Advanced: parent-child / small-to-big retrieval (match small chunks, return the larger parent). Tune chunk size with retrieval evals.',
    ],
    code: `from langchain_text_splitters import RecursiveCharacterTextSplitter
splitter = RecursiveCharacterTextSplitter(
    chunk_size=800, chunk_overlap=120,
    separators=["\\n## ", "\\n\\n", "\\n", ". ", " "],
)
chunks = splitter.split_text(document_text)`,
  },
];
