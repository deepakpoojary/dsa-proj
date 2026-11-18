import type { BankQuestion } from './types';

// Generative AI interview bank: how generative models work (text, image,
// audio, multimodal) and the concepts behind them. Applied LLM engineering
// (RAG, agents, prompting, LLMOps) lives in the AI Engineer bank.
export const GENAI: BankQuestion[] = [
  // ───────────────────────── Foundations ─────────────────────────
  {
    id: 'what-is-generative-ai',
    group: 'Foundations',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is generative AI?',
    a: [
      'Generative AI is a class of models that create new content (text, images, audio, video, code) rather than only labelling or scoring existing data.',
      'It learns the patterns of a training distribution and then samples new outputs that resemble it.',
      'Main model families: autoregressive transformers (text, code), diffusion models (images, video, audio), GANs and VAEs (older image work).',
      'Outputs are conditioned on an input such as a text prompt, an image or audio, which makes the models steerable.',
      'Generation is probabilistic: the same prompt can give different outputs, and outputs can be fluent but wrong.',
      'Typical uses: chat assistants, coding help, summarisation, image and video creation, speech synthesis, synthetic data.',
    ],
  },
  {
    id: 'generative-vs-discriminative',
    group: 'Foundations',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between generative and discriminative models?',
    a: [
      'A discriminative model learns `P(y | x)`: the boundary between classes, e.g. spam vs not spam.',
      'A generative model learns `P(x)` or `P(x, y)`: how the data itself is distributed, so it can sample new `x`.',
      'Discriminative examples: logistic regression, SVMs, a BERT classifier head.',
      'Generative examples: Naive Bayes, GANs, VAEs, diffusion models, GPT-style LLMs (which model `P(next token | previous tokens)`).',
      'Discriminative models are usually simpler and more accurate for pure classification; generative models are needed to create data.',
      'An LLM can do classification too, by generating the label as text, which blurs the line in practice.',
    ],
  },
  {
    id: 'ai-ml-dl-genai',
    group: 'Foundations',
    stars: 4,
    difficulty: 'Easy',
    q: 'How do AI, machine learning, deep learning and generative AI relate?',
    a: [
      'AI is the broad field of making machines do tasks that need intelligence, including rule-based systems and search.',
      'Machine learning is the subset of AI where behaviour is learned from data instead of hand-written rules.',
      'Deep learning is the subset of ML that uses multi-layer neural networks to learn features automatically.',
      'Generative AI is the subset of (mostly deep) learning focused on producing new content.',
      'LLMs are generative deep learning models for language; foundation models are large general-purpose models that can be adapted to many tasks.',
      'Nested view: AI > ML > DL > GenAI > LLMs.',
    ],
  },
  {
    id: 'foundation-models',
    group: 'Foundations',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is a foundation model?',
    a: [
      'A large model pretrained on broad data (often self-supervised) that can be adapted to many downstream tasks.',
      'Adaptation happens through prompting, fine-tuning, adapters or retrieval rather than training from scratch.',
      'Examples span modalities: LLMs, image-text models like CLIP, image generators, speech models.',
      'Economics: one very expensive pretraining run is amortised over thousands of applications.',
      'Risk: flaws and biases in the base model are inherited by everything built on top of it (homogenisation).',
    ],
  },
  {
    id: 'emergent-abilities',
    group: 'Foundations',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are emergent abilities in large models?',
    a: [
      'Capabilities that appear in larger models but are near-absent in smaller ones, e.g. multi-step arithmetic or in-context learning.',
      'In-context learning (learning a task from examples in the prompt) is the best-known example.',
      'Some research argues emergence is partly a measurement artefact: sharp jumps come from all-or-nothing metrics like exact match, while smooth metrics show gradual improvement.',
      'Practical takeaway: capabilities are hard to predict from small-scale experiments, which matters for safety evaluations.',
      'Interview tip: present both views rather than claiming emergence is magic.',
    ],
  },
  {
    id: 'scaling-laws',
    group: 'Foundations',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are scaling laws and what did the Chinchilla result show?',
    a: [
      'Scaling laws: test loss falls as a smooth power law as you increase parameters, data and compute.',
      'This lets labs predict a large model\'s loss from smaller runs before spending the full budget.',
      'Chinchilla (compute-optimal) finding: for a fixed compute budget, parameters and training tokens should grow roughly together, about 20 tokens per parameter.',
      'Many earlier models were undertrained: too many parameters for the data they saw.',
      'In practice teams now train smaller models on far more tokens than "compute-optimal" because inference cost depends on model size.',
      'Newer axis: test-time compute scaling, where letting a model think longer also improves results.',
    ],
    code: `# Chinchilla rule of thumb
params = 7e9
tokens_optimal = 20 * params        # ~140B tokens
train_flops = 6 * params * tokens_optimal   # ~5.9e21 FLOPs`,
  },
  {
    id: 'parameters-vs-tokens',
    group: 'Foundations',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between model parameters and training tokens?',
    a: [
      'Parameters are the learned weights of the network (e.g. "7B" = 7 billion numbers); they decide model size and memory.',
      'Training tokens are how much text the model saw during pretraining (often trillions).',
      'Memory for inference ≈ params × bytes per param: 7B at 16-bit ≈ 14 GB, at 4-bit ≈ 3.5 GB, plus KV cache.',
      'More parameters = more capacity; more tokens = better use of that capacity.',
      'Hyperparameters (learning rate, batch size, layers) are set by humans and are not learned.',
    ],
  },
  {
    id: 'training-compute',
    group: 'Foundations',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you estimate the compute needed to train an LLM?',
    a: [
      'Rule of thumb: training FLOPs ≈ `6 × N × D` (N = parameters, D = training tokens).',
      'The 6 comes from ~2 FLOPs per param per token for the forward pass and ~4 for the backward pass.',
      'Inference costs about `2 × N` FLOPs per generated token.',
      'Divide by GPU throughput × utilisation (MFU, often 30-50%) to get GPU-hours.',
      'Memory, not FLOPs, is often the real limit: weights, gradients, optimizer states (Adam keeps 2 extra values per param) and activations.',
      'Large runs use data, tensor and pipeline parallelism plus ZeRO/FSDP sharding across thousands of GPUs.',
    ],
    code: `N, D = 70e9, 2e12                 # 70B params, 2T tokens
flops = 6 * N * D                  # 8.4e23
gpu_flops = 1e15 * 0.4             # ~1 PFLOP/s peak at 40% MFU
gpu_hours = flops / gpu_flops / 3600   # ~580k GPU-hours`,
  },

  // ───────────────────────── Neural Net Basics for GenAI ─────────────────────────
  {
    id: 'backprop-gradient-descent',
    group: 'Neural Net Basics for GenAI',
    stars: 4,
    difficulty: 'Easy',
    q: 'How do backpropagation and gradient descent train a neural network?',
    a: [
      'Forward pass: inputs flow through the layers to produce a prediction, then a loss measures how wrong it is.',
      'Backpropagation applies the chain rule backwards through the network to get the gradient of the loss for every weight.',
      'Gradient descent updates each weight a small step against its gradient: `w = w - lr * grad`.',
      'Mini-batch SGD uses a small batch per step; LLMs typically use the Adam/AdamW optimizer with warmup and a decaying learning-rate schedule.',
      'Too high a learning rate diverges; too low trains slowly or stalls.',
      'Problems: vanishing/exploding gradients, mitigated with residuals, normalisation, good initialisation and gradient clipping.',
    ],
    code: `for x, y in loader:
    loss = loss_fn(model(x), y)   # forward
    optimizer.zero_grad()
    loss.backward()               # backprop: compute grads
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    optimizer.step()              # gradient descent update`,
  },
  {
    id: 'cross-entropy-loss',
    group: 'Neural Net Basics for GenAI',
    stars: 4,
    difficulty: 'Medium',
    q: 'Why is cross-entropy the loss used to train language models?',
    a: [
      'Next-token prediction is a classification over the vocabulary, and cross-entropy is the standard classification loss.',
      'For one token it is `-log p(correct token)`: confident right answers cost ~0, confident wrong answers cost a lot.',
      'Minimising cross-entropy is the same as maximising the likelihood of the training text.',
      'The loss is averaged over all token positions in the batch.',
      'Perplexity is just `exp(cross-entropy)`, so the two move together.',
      'Label smoothing or z-loss are small tweaks sometimes added for stability.',
    ],
    code: `import torch.nn.functional as F
logits = model(input_ids)              # (batch, seq, vocab)
loss = F.cross_entropy(
    logits[:, :-1].reshape(-1, vocab),  # predict position t+1
    input_ids[:, 1:].reshape(-1))       # targets shifted by one`,
  },
  {
    id: 'overfitting-generalization',
    group: 'Neural Net Basics for GenAI',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is overfitting and how is it handled in generative models?',
    a: [
      'Overfitting: the model memorises training data and does worse on unseen data; training loss keeps falling while validation loss rises.',
      'Large LLM pretraining rarely overfits because each token is seen about once; fine-tuning on small datasets overfits easily.',
      'Remedies: more or more diverse data, early stopping on validation loss, dropout, weight decay, fewer epochs, smaller learning rate.',
      'PEFT methods like LoRA reduce trainable parameters, which also limits overfitting.',
      'In generative models overfitting shows up as memorised, regurgitated training examples, which is also a privacy and copyright risk.',
    ],
  },
  {
    id: 'softmax-function',
    group: 'Neural Net Basics for GenAI',
    stars: 4,
    difficulty: 'Easy',
    q: 'What does softmax do and where is it used in a transformer?',
    a: [
      'Softmax turns a vector of raw scores (logits) into probabilities that are positive and sum to 1: `exp(z_i) / sum(exp(z_j))`.',
      'Used at the output layer to get a distribution over the next token.',
      'Also used inside attention to turn Q·K scores into attention weights.',
      'It exaggerates differences: the largest logit gets a disproportionate share.',
      'Dividing logits by a temperature before softmax flattens (T > 1) or sharpens (T < 1) the distribution.',
      'Implemented with the max subtracted first for numerical stability.',
    ],
    code: `import numpy as np
def softmax(z):
    z = z - z.max()          # avoid overflow
    e = np.exp(z)
    return e / e.sum()`,
  },
  {
    id: 'activation-functions',
    group: 'Neural Net Basics for GenAI',
    stars: 3,
    difficulty: 'Medium',
    q: 'Which activation functions do modern transformers use and why?',
    a: [
      'Activations add non-linearity; without them stacked layers collapse into one linear map.',
      'ReLU (`max(0, x)`) is cheap but has "dead" neurons with zero gradient for negative inputs.',
      'GELU is a smooth ReLU-like curve, used in BERT and GPT-2/3.',
      'SwiGLU (Swish-gated linear unit) is the common choice in modern LLM feed-forward layers; it uses a gating branch and usually performs better at the same compute.',
      'Sigmoid and tanh saturate and cause vanishing gradients, so they are rare in hidden layers now (still used for gates).',
    ],
    code: `import torch.nn.functional as F
def swiglu_ffn(x, W1, W2, W3):
    return (F.silu(x @ W1) * (x @ W3)) @ W2   # gate * value -> down-proj`,
  },
  {
    id: 'layernorm-rmsnorm',
    group: 'Neural Net Basics for GenAI',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are LayerNorm and RMSNorm, and what is pre-norm vs post-norm?',
    a: [
      'Normalisation keeps activations at a stable scale so deep networks train reliably.',
      'LayerNorm normalises each token vector to zero mean and unit variance across its features, then applies a learned scale and shift.',
      'RMSNorm skips the mean subtraction and only divides by the root-mean-square; it is cheaper and works as well, so most modern LLMs use it.',
      'Unlike BatchNorm, both work per token, so they do not depend on batch size and suit variable-length sequences.',
      'Post-norm (original transformer) normalises after the residual add; pre-norm normalises the input to each sub-layer and is more stable for deep models.',
    ],
    code: `def rms_norm(x, weight, eps=1e-6):
    rms = (x.pow(2).mean(-1, keepdim=True) + eps).sqrt()
    return x / rms * weight`,
  },
  {
    id: 'dropout-regularization',
    group: 'Neural Net Basics for GenAI',
    stars: 2,
    difficulty: 'Easy',
    q: 'What is dropout and is it still used in LLMs?',
    a: [
      'Dropout randomly zeroes a fraction of activations during training so the network cannot rely on any single unit.',
      'At inference it is turned off (`model.eval()`), and activations are scaled so expected values match.',
      'It is a regulariser that reduces overfitting on small datasets.',
      'Many large LLM pretraining runs use little or no dropout because a single pass over huge data barely overfits.',
      'It still appears in fine-tuning, e.g. `lora_dropout` in LoRA configs.',
    ],
  },

  // ───────────────────────── Transformer Deep Dive ─────────────────────────
  {
    id: 'qkv-attention-math',
    group: 'Transformer Deep Dive',
    stars: 5,
    difficulty: 'Medium',
    q: 'Walk through the Q, K, V math of scaled dot-product attention. Why divide by sqrt(d_k)?',
    a: [
      'Each token embedding `x` is projected by learned matrices: `Q = xW_Q`, `K = xW_K`, `V = xW_V`.',
      'Query = what this token is looking for; Key = what each token offers; Value = the information it passes on.',
      'Scores `QK^T` give the similarity of every query with every key, an `n × n` matrix.',
      'Dividing by `sqrt(d_k)` keeps the dot products from growing with dimension, which would push softmax into saturated regions with tiny gradients.',
      'Softmax over each row gives attention weights; output = weights × V, a context-aware mix of values.',
      'The result is projected back with `W_O` and added to the residual stream.',
    ],
    code: `Q, K, V = x @ W_q, x @ W_k, x @ W_v      # (n, d_k)
scores  = Q @ K.T / sqrt(d_k)            # (n, n)
weights = softmax(scores, axis=-1)       # each row sums to 1
out     = weights @ V                    # (n, d_k)`,
  },
  {
    id: 'multi-head-attention',
    group: 'Transformer Deep Dive',
    stars: 4,
    difficulty: 'Medium',
    q: 'Why use multi-head attention, and what are MQA and GQA?',
    a: [
      'Multi-head attention splits the model dimension into `h` heads, each with its own Q/K/V projections, and runs attention in parallel.',
      'Different heads can specialise: local syntax, long-range references, copying, position.',
      'Head outputs are concatenated and projected back with `W_O`; total compute is similar to one big head.',
      'Multi-query attention (MQA) shares one K/V head across all query heads, shrinking the KV cache a lot.',
      'Grouped-query attention (GQA) is the middle ground: groups of query heads share a K/V head; it is the common choice in modern LLMs.',
      'MQA/GQA mainly speed up decoding, which is memory-bandwidth bound on the KV cache.',
    ],
  },
  {
    id: 'positional-encodings-rope',
    group: 'Transformer Deep Dive',
    stars: 4,
    difficulty: 'Hard',
    q: 'Why do transformers need positional encodings, and how does RoPE work?',
    a: [
      'Attention is permutation-invariant: without position info, "dog bites man" and "man bites dog" look the same.',
      'Original transformer: fixed sinusoidal vectors added to the input embeddings.',
      'Learned absolute embeddings (BERT, GPT-2) work but do not extrapolate past the trained length.',
      'RoPE (rotary embeddings) rotates Q and K vectors by an angle proportional to position, so `q·k` depends only on the relative distance.',
      'RoPE is applied inside attention, not added to embeddings, and is used by most modern open LLMs.',
      'Context extension tricks (position interpolation, NTK scaling, YaRN) rescale RoPE frequencies to handle longer sequences; ALiBi is an alternative that adds a distance penalty to scores.',
    ],
    code: `# RoPE on one pair of dims (x1, x2) at position p
theta = p * base ** (-2 * i / d)
x1_rot = x1 * cos(theta) - x2 * sin(theta)
x2_rot = x1 * sin(theta) + x2 * cos(theta)`,
  },
  {
    id: 'encoder-decoder-variants',
    group: 'Transformer Deep Dive',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between encoder-only, decoder-only and encoder-decoder transformers?',
    a: [
      'Encoder-only (BERT, RoBERTa): bidirectional attention, trained with masked language modelling; best for understanding tasks like classification, NER and embeddings.',
      'Decoder-only (GPT family, Llama, most chat LLMs): causal attention, trained to predict the next token; best for generation.',
      'Encoder-decoder (original Transformer, T5, BART): encoder reads the input bidirectionally, decoder generates with cross-attention to the encoder; strong for translation and summarisation.',
      'Decoder-only won for general LLMs because one simple objective scales well and every task can be framed as text continuation.',
      'Embedding and reranker models are still often encoder-style.',
    ],
  },
  {
    id: 'causal-masking',
    group: 'Transformer Deep Dive',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is causal masking and why is it needed?',
    a: [
      'A causal mask stops each position from attending to future positions, by setting those scores to `-inf` before softmax.',
      'It makes training match inference: at generation time future tokens do not exist yet.',
      'It lets one forward pass train on every position at once (teacher forcing), predicting token t+1 from tokens 1..t.',
      'The mask is an upper-triangular matrix of blocked positions.',
      'Padding masks are separate: they hide padding tokens in batched inputs.',
      'Encoder models (BERT) do not use a causal mask, which is why they see context in both directions.',
    ],
    code: `n = 4
mask = torch.triu(torch.ones(n, n), diagonal=1).bool()
# [[F,T,T,T],
#  [F,F,T,T],   True = blocked (future)
#  [F,F,F,T],
#  [F,F,F,F]]
scores = scores.masked_fill(mask, float("-inf"))`,
  },
  {
    id: 'attention-complexity-flashattention',
    group: 'Transformer Deep Dive',
    stars: 4,
    difficulty: 'Hard',
    q: 'Why is attention quadratic in sequence length, and how does FlashAttention help?',
    a: [
      'Every token attends to every other token, so the score matrix is `n × n`: O(n²) compute and, naively, O(n²) memory.',
      'Doubling context roughly quadruples attention cost, which limits long-context models.',
      'FlashAttention computes exact attention in tiles that fit in fast on-chip SRAM, using an online softmax, so the full `n × n` matrix is never written to GPU memory.',
      'Result: memory becomes O(n) and wall-clock time drops a lot because it is IO-aware; the maths is unchanged (not an approximation).',
      'Approximate alternatives reduce the O(n²) itself: sliding-window, sparse, linear attention, and state-space models like Mamba.',
      'At inference, PagedAttention (vLLM) handles the separate problem of KV-cache memory fragmentation.',
    ],
  },
  {
    id: 'mixture-of-experts',
    group: 'Transformer Deep Dive',
    stars: 4,
    difficulty: 'Hard',
    q: 'What is a Mixture of Experts (MoE) model?',
    a: [
      'An MoE layer replaces the single feed-forward block with many expert FFNs plus a small router (gating network).',
      'For each token the router picks the top-k experts (often 1-2 of 8 or more), so only a fraction of parameters run per token.',
      'This gives a large total parameter count with the per-token compute of a much smaller dense model.',
      'All experts must still sit in memory, so MoE saves FLOPs, not VRAM.',
      'Training challenges: load balancing (an auxiliary loss stops the router sending everything to a few experts), instability and expert-parallel communication cost.',
      'Many frontier and open models use MoE because it gives better quality per unit of compute.',
    ],
    code: `def moe_layer(x, experts, router, k=2):
    scores = softmax(router(x))           # (num_experts,)
    top = scores.topk(k)
    return sum(w * experts[i](x) for w, i in zip(top.values, top.indices))`,
  },
  {
    id: 'residual-connections',
    group: 'Transformer Deep Dive',
    stars: 3,
    difficulty: 'Medium',
    q: 'What do residual connections do in a transformer?',
    a: [
      'Each sub-layer adds its output to its input: `x = x + Attention(Norm(x))`, then `x = x + FFN(Norm(x))`.',
      'Gradients get a direct path back through the identity, which prevents vanishing gradients in deep stacks.',
      'Each layer only needs to learn a small update (a residual) rather than a whole new representation.',
      'The running sum is called the residual stream; interpretability work treats layers as reading from and writing to it.',
      'Without residuals, transformers with dozens of layers would be very hard to train.',
    ],
    code: `def block(x):
    x = x + attn(rms_norm(x))   # pre-norm + residual
    x = x + ffn(rms_norm(x))
    return x`,
  },

  // ───────────────────────── Decoding & Generation ─────────────────────────
  {
    id: 'greedy-vs-sampling',
    group: 'Decoding & Generation',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between greedy decoding and sampling?',
    a: [
      'Greedy decoding always picks the highest-probability token: deterministic and fast.',
      'Greedy text tends to be repetitive and bland, and can miss better sequences that start with a lower-probability token.',
      'Sampling draws the next token from the probability distribution, giving variety and creativity.',
      'Sampling is usually shaped with temperature, top-k, top-p or min-p to avoid low-probability junk.',
      'Use greedy (or temperature 0) for extraction, classification and code; sampling for creative writing and brainstorming.',
      'Even at temperature 0, outputs may vary slightly across runs due to batching and floating-point non-determinism.',
    ],
  },
  {
    id: 'beam-search',
    group: 'Decoding & Generation',
    stars: 3,
    difficulty: 'Medium',
    q: 'How does beam search work and why is it rarely used for chat LLMs?',
    a: [
      'Beam search keeps the `B` best partial sequences (beams) at each step instead of just one.',
      'Each beam is extended by every candidate token; the top `B` by total log-probability survive.',
      'It finds higher-likelihood sequences than greedy and works well for translation, summarisation and speech recognition.',
      'A length penalty is needed because longer sequences accumulate lower log-probabilities.',
      'For open-ended generation it produces dull, repetitive text (high likelihood is not the same as good text) and costs B× compute.',
      'Chat LLMs therefore use sampling; beam search remains common in seq2seq and ASR.',
    ],
    code: `beams = [([], 0.0)]                       # (tokens, log_prob)
for _ in range(max_len):
    cands = [(t + [tok], lp + logp)
             for t, lp in beams
             for tok, logp in top_tokens(model, t)]
    beams = sorted(cands, key=lambda c: c[1], reverse=True)[:B]`,
  },
  {
    id: 'top-k-sampling',
    group: 'Decoding & Generation',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is top-k sampling and how does it compare with top-p and min-p?',
    a: [
      'Top-k keeps only the `k` most likely tokens, renormalises, and samples from them.',
      'Weakness: a fixed `k` is too wide when the model is confident and too narrow when many tokens are plausible.',
      'Top-p (nucleus) instead keeps the smallest set whose cumulative probability reaches `p`, so the set size adapts.',
      'Min-p keeps tokens whose probability is at least a fraction of the top token\'s, which also adapts to confidence.',
      'They can be combined, and temperature is applied before the filtering.',
    ],
    code: `def top_k_sample(logits, k=50, temperature=0.8):
    logits = logits / temperature
    vals, idx = logits.topk(k)
    probs = softmax(vals)
    return idx[torch.multinomial(probs, 1)]`,
  },
  {
    id: 'repetition-penalty',
    group: 'Decoding & Generation',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do repetition, frequency and presence penalties work?',
    a: [
      'They lower the logits of tokens that have already appeared, to reduce loops and repeated phrases.',
      'Presence penalty: a flat subtraction if the token appeared at all, nudging toward new topics.',
      'Frequency penalty: subtraction proportional to how many times the token appeared.',
      'Repetition penalty (Hugging Face style): divides positive logits (or multiplies negative ones) of seen tokens by a factor > 1.',
      'Too strong a penalty hurts output that legitimately repeats words, like code, names or JSON keys.',
      '`no_repeat_ngram_size` is a harder rule that bans repeating any n-gram.',
    ],
    code: `for tok, count in counts.items():
    logits[tok] -= presence_penalty + count * frequency_penalty`,
  },
  {
    id: 'speculative-decoding',
    group: 'Decoding & Generation',
    stars: 4,
    difficulty: 'Hard',
    q: 'What is speculative decoding?',
    a: [
      'A small, fast draft model proposes several tokens ahead; the large target model checks them all in one parallel forward pass.',
      'Accepted tokens are kept; at the first rejection the target model\'s own token is used and drafting restarts.',
      'A rejection-sampling acceptance rule guarantees the output distribution is exactly that of the target model, so quality is unchanged.',
      'It works because decoding is memory-bandwidth bound: verifying 5 tokens costs about the same as generating 1.',
      'Speed-up (often 2-3×) depends on how often the draft agrees with the target.',
      'Variants: Medusa extra heads, EAGLE, lookahead decoding, and n-gram or prompt-lookup drafting with no draft model.',
    ],
    code: `draft = small_model.generate(ctx, n=5)          # cheap guesses
p_target = big_model.probs(ctx + draft)          # one parallel pass
for i, tok in enumerate(draft):
    if not accept(tok, p_target[i], p_draft[i]):
        ctx += draft[:i] + [resample(p_target[i])]; break
else:
    ctx += draft`,
  },
  {
    id: 'logprobs-usage',
    group: 'Decoding & Generation',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are logprobs and what can you use them for?',
    a: [
      'Logprobs are the log of the probability the model gave each generated token (and optionally the top alternatives).',
      'Many APIs expose them via a `logprobs` / `top_logprobs` option.',
      'Uses: confidence scores for classification (compare logprobs of "yes" vs "no"), flagging uncertain spans, and calibrating thresholds.',
      'Sequence probability is the sum of token logprobs; average negative logprob gives perplexity.',
      'Caveat: token probability is not the same as factual correctness, and RLHF-tuned models are often over-confident.',
      'Reasoning models and some providers restrict logprob access.',
    ],
    code: `resp = client.chat(prompt, logprobs=True, top_logprobs=2, max_tokens=1)
top = resp.choices[0].logprobs.content[0].top_logprobs
conf = {t.token: math.exp(t.logprob) for t in top}   # {'yes': 0.92, 'no': 0.07}`,
  },
  {
    id: 'constrained-decoding',
    group: 'Decoding & Generation',
    stars: 3,
    difficulty: 'Hard',
    q: 'What is constrained (grammar-guided) decoding?',
    a: [
      'At each step the decoder masks out tokens that would break a grammar, regex or JSON schema, so only valid continuations can be sampled.',
      'The output is guaranteed to parse, unlike prompting alone.',
      'Implemented by compiling the schema into a state machine that tracks which tokens are allowed next.',
      'Libraries and engines: Outlines, XGrammar, llama.cpp GBNF grammars, guidance; providers use it behind "strict" structured output modes.',
      'Overly tight constraints can lower quality because the model is forced off its preferred path.',
    ],
    code: `for step in range(max_tokens):
    logits = model(ctx)[-1]
    allowed = fsm.allowed_tokens(state)
    logits[~allowed] = float("-inf")     # mask invalid tokens
    tok = sample(logits); state = fsm.next(state, tok)`,
  },

  // ───────────────────────── Training & Alignment ─────────────────────────
  {
    id: 'mlm-vs-clm',
    group: 'Training & Alignment',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is the difference between masked language modelling and causal language modelling?',
    a: [
      'Masked LM (MLM, BERT): hide ~15% of tokens and predict them from context on both sides.',
      'Causal LM (CLM, GPT): predict each next token from only the tokens before it.',
      'MLM gives strong bidirectional representations for understanding tasks but cannot generate text naturally.',
      'CLM learns from every token position and directly supports generation, which is why it dominates LLMs.',
      'Span corruption (T5) masks contiguous spans and has a decoder reconstruct them, a hybrid objective.',
      'Both are self-supervised: labels come from the text itself, so no human annotation is needed.',
    ],
  },
  {
    id: 'instruction-tuning-sft',
    group: 'Training & Alignment',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is instruction tuning (supervised fine-tuning) and why is it needed after pretraining?',
    a: [
      'A pretrained base model only continues text; asked a question it may continue with more questions.',
      'SFT trains it on curated (instruction, response) pairs so it learns to follow instructions and adopt an assistant format.',
      'Data is formatted with a chat template (system/user/assistant roles and special tokens).',
      'Loss is usually computed only on the response tokens, masking the prompt.',
      'Quality beats quantity: a few thousand to hundreds of thousands of high-quality, diverse examples go a long way.',
      'SFT is typically followed by preference optimisation (RLHF, DPO) to further align behaviour.',
    ],
    code: `example = {"messages": [
  {"role": "user", "content": "Summarise: ..."},
  {"role": "assistant", "content": "The text says ..."}]}
ids = tokenizer.apply_chat_template(example["messages"])
labels = mask_prompt_tokens(ids)     # loss only on the assistant reply`,
  },
  {
    id: 'rlhf-reward-model-ppo',
    group: 'Training & Alignment',
    stars: 4,
    difficulty: 'Hard',
    q: 'Explain the RLHF pipeline: reward model and PPO.',
    a: [
      'Step 1: start from an SFT model.',
      'Step 2: collect human comparisons: for one prompt, labellers rank two or more responses.',
      'Step 3: train a reward model (an LLM with a scalar head) so preferred responses score higher, using a pairwise loss `-log σ(r_chosen - r_rejected)`.',
      'Step 4: optimise the policy with PPO to maximise reward, with a KL penalty against the SFT model so it does not drift into gibberish that fools the reward model.',
      'PPO needs several models in memory (policy, reference, reward, value), which makes it expensive and finicky.',
      'Simpler alternatives: DPO-style methods, and GRPO (group-relative baselines, no value model), widely used for reasoning RL with verifiable rewards.',
    ],
    code: `# reward model loss (pairwise / Bradley-Terry)
loss = -F.logsigmoid(rm(chosen) - rm(rejected)).mean()
# PPO objective (per sample)
objective = reward - beta * kl(policy, reference)`,
  },
  {
    id: 'reward-hacking',
    group: 'Training & Alignment',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is reward hacking in RLHF?',
    a: [
      'The policy finds ways to get a high reward-model score without actually being better.',
      'Classic symptoms: overly long answers, flattery and sycophancy, confident tone, or exploiting quirks in an automated checker.',
      'It happens because the reward model is an imperfect proxy (Goodhart\'s law).',
      'Mitigations: KL penalty to the reference model, reward-model ensembles, refreshing the reward model with new data, length normalisation, and verifiable rewards (unit tests, exact answers).',
      'Monitor with held-out human evaluation, not just reward score.',
    ],
  },
  {
    id: 'constitutional-ai',
    group: 'Training & Alignment',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is Constitutional AI?',
    a: [
      'An alignment method from Anthropic where a written set of principles (a constitution) guides the model instead of large amounts of human harm labels.',
      'Supervised phase: the model critiques and revises its own responses against the principles; it is then fine-tuned on the revisions.',
      'RL phase: an AI model compares response pairs using the principles, and those AI preferences train the reward model (RLAIF).',
      'Benefits: scalable, less human exposure to harmful content, and the values are explicit and auditable.',
      'Goal is a model that is helpful and harmless, explaining refusals rather than being evasive.',
    ],
  },
  {
    id: 'rlaif',
    group: 'Training & Alignment',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is RLAIF and how does it differ from RLHF?',
    a: [
      'RLAIF = Reinforcement Learning from AI Feedback: preference labels come from a capable LLM instead of humans.',
      'The pipeline is otherwise the same: preferences → reward model (or direct preference optimisation) → policy optimisation.',
      'Much cheaper and faster to scale than human labelling.',
      'Risks: the labeller\'s biases and blind spots are copied, and models may prefer their own style.',
      'Common practice mixes AI labels with a smaller set of human labels and human audits.',
    ],
  },
  {
    id: 'catastrophic-forgetting',
    group: 'Training & Alignment',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is catastrophic forgetting and how do you prevent it during fine-tuning?',
    a: [
      'When a model is fine-tuned on a narrow task, it can lose general abilities it had before (knowledge, instruction following, safety behaviour).',
      'Caused by large weight updates that overwrite representations useful for other tasks.',
      'Mitigations: lower learning rate and fewer epochs, PEFT (LoRA freezes base weights), mixing in general or replay data.',
      'Regularisation methods like EWC penalise changes to weights important for earlier tasks.',
      'Always evaluate on general benchmarks and safety tests, not just the target task, after fine-tuning.',
    ],
  },
  {
    id: 'synthetic-data',
    group: 'Training & Alignment',
    stars: 3,
    difficulty: 'Medium',
    q: 'How is synthetic data used to train generative models, and what are the risks?',
    a: [
      'Strong models generate training data for other models: instruction pairs, reasoning traces, code with tests, preference pairs.',
      'Benefits: cheap, scalable, covers rare cases, and avoids private data.',
      'Quality control is key: filter with verifiers (run the code, check the maths), dedupe, and use LLM judges or reward models.',
      'Risks: copying the teacher\'s errors and biases, low diversity, and model collapse if training only on model outputs over generations.',
      'Check provider terms: some licences restrict using outputs to train competing models.',
    ],
  },
  {
    id: 'peft-methods',
    group: 'Training & Alignment',
    stars: 3,
    difficulty: 'Medium',
    q: 'Besides LoRA, what parameter-efficient fine-tuning (PEFT) methods exist?',
    a: [
      'PEFT freezes most base weights and trains a small number of new parameters, cutting memory and storage.',
      'Adapters: small bottleneck MLP layers inserted inside each transformer block.',
      'Prefix tuning: learnable key/value vectors prepended at every attention layer.',
      'Prompt (soft prompt) tuning: learnable embedding vectors prepended only to the input.',
      'IA³ scales activations with learned vectors; BitFit trains only bias terms.',
      'LoRA variants like DoRA are popular because LoRA weights can be merged into the base model with no inference overhead.',
    ],
    code: `from peft import PrefixTuningConfig, get_peft_model
cfg = PrefixTuningConfig(task_type="CAUSAL_LM", num_virtual_tokens=20)
model = get_peft_model(base_model, cfg)
model.print_trainable_parameters()   # tiny fraction of total`,
  },

  // ───────────────────────── Image & Multimodal ─────────────────────────
  {
    id: 'gans',
    group: 'Image & Multimodal',
    stars: 4,
    difficulty: 'Medium',
    q: 'How does a GAN (Generative Adversarial Network) work?',
    a: [
      'Two networks play a minimax game: a generator turns random noise into fake samples; a discriminator tries to tell real from fake.',
      'The generator is trained to fool the discriminator; the discriminator is trained to catch it.',
      'At equilibrium the generator\'s distribution matches the real data and the discriminator guesses 50/50.',
      'Strengths: very fast single-pass generation and sharp images (StyleGAN faces).',
      'Weaknesses: unstable training, mode collapse, and no easy text conditioning or likelihood.',
      'Diffusion models have largely replaced GANs for image generation, though GAN-style losses still appear in decoders and super-resolution.',
    ],
    code: `for real in loader:
    fake = G(torch.randn(bs, z_dim))
    d_loss = bce(D(real), 1) + bce(D(fake.detach()), 0)
    d_opt.zero_grad(); d_loss.backward(); d_opt.step()
    g_loss = bce(D(fake), 1)            # try to fool D
    g_opt.zero_grad(); g_loss.backward(); g_opt.step()`,
  },
  {
    id: 'gan-mode-collapse',
    group: 'Image & Multimodal',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is mode collapse in GANs and how is it addressed?',
    a: [
      'Mode collapse: the generator produces only a few kinds of output (e.g. the same face) because they reliably fool the discriminator.',
      'The model ignores large parts of the real data distribution, so diversity is poor.',
      'Causes: the generator overfits to current discriminator weaknesses and the two networks chase each other.',
      'Fixes: Wasserstein loss (WGAN) with gradient penalty, minibatch discrimination, spectral normalisation, unrolled GANs, and careful learning-rate balancing.',
      'Diffusion models and VAEs, being likelihood-based, rarely suffer from it, one reason they took over.',
    ],
  },
  {
    id: 'vaes-latent-space',
    group: 'Image & Multimodal',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is a VAE and what is a latent space?',
    a: [
      'A Variational Autoencoder has an encoder that maps an input to a distribution (mean and variance) in a small latent space, and a decoder that reconstructs it.',
      'A latent space is a compressed representation where nearby points correspond to similar data.',
      'Loss = reconstruction loss + KL divergence pushing the latent distribution toward a standard normal, which makes the space smooth and sampleable.',
      'The reparameterisation trick `z = mu + sigma * eps` lets gradients flow through the random sampling.',
      'Plain VAEs give blurry images, but VAE encoders/decoders are a core part of latent diffusion models.',
    ],
    code: `mu, logvar = encoder(x)
z = mu + torch.exp(0.5 * logvar) * torch.randn_like(mu)   # reparam trick
x_hat = decoder(z)
kl = -0.5 * torch.sum(1 + logvar - mu**2 - logvar.exp())
loss = F.mse_loss(x_hat, x) + kl`,
  },
  {
    id: 'diffusion-models',
    group: 'Image & Multimodal',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do diffusion models generate images?',
    a: [
      'Forward process: gradually add Gaussian noise to a training image over many steps until it is pure noise (fixed, no learning).',
      'Reverse process: a neural network (U-Net or diffusion transformer) learns to predict and remove the noise at each step.',
      'Training is simple: pick a random timestep, noise the image, and train the network to predict that noise with MSE loss.',
      'Generation starts from random noise and denoises step by step, conditioned on text embeddings.',
      'Samplers (DDIM, DPM-Solver) cut steps from ~1000 to ~20-50; distillation and consistency/flow methods reach 1-4 steps.',
      'Strengths: high quality, diverse, stable training; weakness: slower than single-pass GANs.',
    ],
    code: `# training step
t = randint(0, T)
noise = torch.randn_like(x0)
x_t = sqrt(alpha_bar[t]) * x0 + sqrt(1 - alpha_bar[t]) * noise
loss = F.mse_loss(unet(x_t, t, text_emb), noise)`,
  },
  {
    id: 'latent-stable-diffusion',
    group: 'Image & Multimodal',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is latent diffusion (Stable Diffusion) and why is it efficient?',
    a: [
      'Instead of diffusing in pixel space, a VAE first compresses the image into a much smaller latent (e.g. 512×512×3 → 64×64×4).',
      'The diffusion model denoises in this latent space, which is far cheaper in compute and memory.',
      'The VAE decoder turns the final latent back into a full-resolution image.',
      'Text conditioning comes from a text encoder (CLIP or T5) whose embeddings enter the denoiser via cross-attention.',
      'Newer models swap the U-Net for a diffusion transformer (DiT) and often use flow matching instead of classic noise schedules.',
      'Open weights made it the base for a large ecosystem of LoRAs, ControlNets and fine-tunes.',
    ],
  },
  {
    id: 'classifier-free-guidance',
    group: 'Image & Multimodal',
    stars: 3,
    difficulty: 'Hard',
    q: 'What is classifier-free guidance (CFG)?',
    a: [
      'A technique to make diffusion outputs follow the prompt more closely.',
      'During training the text condition is randomly dropped (e.g. 10% of the time), so one model learns both conditional and unconditional prediction.',
      'At sampling, both predictions are made and the result is pushed away from unconditional toward conditional.',
      'The guidance scale `w` (often ~5-8) trades prompt adherence against diversity and naturalness; too high gives oversaturated images.',
      'Negative prompts work by replacing the unconditional branch with the negative prompt\'s prediction.',
      'It doubles compute per step unless guidance is distilled into the model.',
    ],
    code: `eps_uncond = model(x_t, t, empty_prompt)
eps_cond   = model(x_t, t, prompt)
eps = eps_uncond + w * (eps_cond - eps_uncond)`,
  },
  {
    id: 'clip-contrastive',
    group: 'Image & Multimodal',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is CLIP and how does contrastive learning work?',
    a: [
      'CLIP trains an image encoder and a text encoder together on hundreds of millions of image-caption pairs.',
      'Contrastive objective: in a batch, matching image-text pairs should have high cosine similarity and all mismatched pairs low.',
      'The result is a shared embedding space where images and text can be compared directly.',
      'Enables zero-shot classification: embed prompts like "a photo of a dog" and pick the closest to the image embedding.',
      'Used as the text encoder in image generators, for image search and for filtering datasets; SigLIP replaces softmax with a sigmoid loss.',
    ],
    code: `img = normalize(image_encoder(images))     # (B, d)
txt = normalize(text_encoder(texts))       # (B, d)
logits = img @ txt.T / temperature          # (B, B)
labels = torch.arange(B)                    # diagonal = matches
loss = (F.cross_entropy(logits, labels) + F.cross_entropy(logits.T, labels)) / 2`,
  },
  {
    id: 'text-to-image-pipeline',
    group: 'Image & Multimodal',
    stars: 4,
    difficulty: 'Medium',
    q: 'Walk through a text-to-image generation pipeline end to end.',
    a: [
      'Prompt → text encoder (CLIP/T5/LLM) produces embeddings.',
      'Sample random noise in latent space (seeded for reproducibility).',
      'The denoiser runs N steps, conditioned on text via cross-attention, with classifier-free guidance.',
      'A scheduler/sampler decides the noise level and update at each step.',
      'The VAE decoder converts the final latent to pixels; optional upscaler or refiner adds detail.',
      'Safety filters check both the prompt and the output image; provenance metadata or watermarks may be added.',
    ],
    code: `from diffusers import AutoPipelineForText2Image
pipe = AutoPipelineForText2Image.from_pretrained(model_id).to("cuda")
img = pipe("a red fox in snow, watercolor",
           num_inference_steps=30, guidance_scale=6.0,
           generator=torch.Generator("cuda").manual_seed(42)).images[0]`,
  },
  {
    id: 'controlnet',
    group: 'Image & Multimodal',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is ControlNet?',
    a: [
      'An add-on network that gives a diffusion model spatial control from an extra input such as edges, depth maps, human pose or scribbles.',
      'It copies the denoiser\'s encoder as a trainable branch while the original weights stay frozen.',
      'The branch connects back through zero-initialised convolutions, so training starts without disturbing the base model.',
      'Lets users fix composition or pose precisely while the text prompt controls style and content.',
      'Related tools: IP-Adapter (image prompts), T2I-Adapter, and LoRAs for styles or characters.',
    ],
  },
  {
    id: 'vision-language-models',
    group: 'Image & Multimodal',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do vision-language models (VLMs) let an LLM understand images?',
    a: [
      'A vision encoder (often a ViT, e.g. CLIP/SigLIP) splits the image into patches and produces patch embeddings.',
      'A projector (MLP or cross-attention resampler) maps those embeddings into the LLM\'s token embedding space.',
      'The image becomes a sequence of "visual tokens" placed alongside text tokens in the prompt.',
      'Training: first align the projector on image-caption data, then instruction-tune on visual Q&A.',
      'Images consume many tokens; high-resolution images are tiled, which raises cost.',
      'Weak spots: counting, precise spatial reasoning, small text and hallucinated objects.',
    ],
  },
  {
    id: 'multimodal-llms',
    group: 'Image & Multimodal',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is a natively multimodal LLM and how does it differ from a pipeline of separate models?',
    a: [
      'A pipeline chains specialist models, e.g. speech-to-text → LLM → text-to-speech; simple but loses information like tone and adds latency.',
      'A natively multimodal model is trained on several modalities together, mapping each into a shared token space.',
      'Inputs (text, image, audio, video frames) are tokenised by modality-specific encoders or discrete tokenizers.',
      'Some models also output non-text modalities (speech, images) directly.',
      'Benefits: cross-modal reasoning, lower latency for voice, keeps emotion and visual detail.',
      'Trade-offs: harder to train and evaluate, and expensive in tokens for images and video.',
    ],
  },
  {
    id: 'speech-models',
    group: 'Image & Multimodal',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do modern speech-to-text and text-to-speech models work?',
    a: [
      'Speech-to-text (ASR): audio is converted to a log-mel spectrogram and fed to an encoder-decoder transformer (e.g. Whisper) that outputs text tokens.',
      'Large weakly-supervised training makes ASR robust to accents and noise and enables multilingual transcription and translation.',
      'Text-to-speech: older systems predicted a mel spectrogram then used a vocoder to make audio.',
      'Modern TTS often uses neural audio codecs that turn audio into discrete tokens, so a language model can generate speech tokens like text.',
      'Voice cloning from a few seconds of audio is possible, which raises consent and fraud concerns.',
      'Real-time voice agents care most about latency: streaming ASR, fast TTS or speech-to-speech models.',
    ],
  },
  {
    id: 'video-generation',
    group: 'Image & Multimodal',
    stars: 2,
    difficulty: 'Hard',
    q: 'How do text-to-video models work and what makes video hard?',
    a: [
      'Most extend latent diffusion to video: a video VAE compresses frames in space and time into a latent volume.',
      'A diffusion transformer denoises spacetime patches, attending across both frames and spatial positions.',
      'Hard parts: temporal consistency (objects keep identity), plausible physics and motion, and huge compute and memory.',
      'Training data is limited and noisy compared with images, so captions are often generated by VLMs.',
      'Clip length and resolution are capped by compute; longer videos are built by extending or stitching clips.',
    ],
  },

  // ───────────────────────── Evaluation & Risks ─────────────────────────
  {
    id: 'perplexity',
    group: 'Evaluation & Risks',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is perplexity and what are its limits as a metric?',
    a: [
      'Perplexity = `exp(average negative log-likelihood per token)` on held-out text.',
      'Intuition: the effective number of tokens the model is choosing between; lower is better.',
      'Useful for comparing checkpoints during pretraining and for detecting domain shift.',
      'Only comparable between models with the same tokenizer and test data.',
      'Does not measure helpfulness, factuality or instruction following; aligned chat models often have worse perplexity but are more useful.',
    ],
    code: `nll = F.cross_entropy(logits[:, :-1].flatten(0, 1),
                      ids[:, 1:].flatten())
perplexity = torch.exp(nll)`,
  },
  {
    id: 'bleu-rouge',
    group: 'Evaluation & Risks',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are BLEU and ROUGE, and why are they weak for LLM evaluation?',
    a: [
      'Both compare generated text against reference text using n-gram overlap.',
      'BLEU is precision-oriented (how much of the output appears in the reference), traditionally used for machine translation.',
      'ROUGE is recall-oriented (how much of the reference appears in the output), used for summarisation; ROUGE-L uses longest common subsequence.',
      'They miss paraphrases: a correct answer worded differently scores poorly.',
      'Semantic metrics (BERTScore, embedding similarity), LLM-as-judge and human review correlate better for open-ended outputs.',
    ],
  },
  {
    id: 'fid-clip-score',
    group: 'Evaluation & Risks',
    stars: 2,
    difficulty: 'Medium',
    q: 'How are image generation models evaluated (FID, CLIP score)?',
    a: [
      'FID (Fréchet Inception Distance): compares the feature distributions of real and generated images using an Inception network; lower is better.',
      'FID captures both quality and diversity but needs thousands of samples and is sensitive to implementation details.',
      'CLIP score: cosine similarity between an image and its prompt in CLIP space; measures prompt alignment.',
      'Inception Score is older and less trusted.',
      'Automated metrics miss aesthetics, text rendering and composition, so human preference studies and arena-style comparisons are the main signal.',
    ],
  },
  {
    id: 'human-evaluation',
    group: 'Evaluation & Risks',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you run a good human evaluation of a generative model?',
    a: [
      'Define clear criteria and rubrics (helpfulness, correctness, safety, tone) with examples of each score.',
      'Prefer pairwise comparisons (A vs B) over absolute 1-10 scores: they are more consistent.',
      'Blind and randomise the order so raters do not know which model produced which output.',
      'Use several raters per item and measure inter-annotator agreement (e.g. Cohen\'s kappa).',
      'Use domain experts for specialised content, and sample prompts that reflect real usage.',
      'Arena-style leaderboards aggregate crowd pairwise votes into Elo/Bradley-Terry ratings.',
    ],
  },
  {
    id: 'bias-in-genai',
    group: 'Evaluation & Risks',
    stars: 4,
    difficulty: 'Easy',
    q: 'Where does bias come from in generative models and how can it be reduced?',
    a: [
      'Training data reflects social stereotypes and over-represents some languages, regions and groups.',
      'Shows up as stereotyped image generations (e.g. who appears as "a CEO"), uneven quality across languages, and skewed text associations.',
      'Alignment can add its own biases, e.g. labeller preferences or over-refusal for some topics.',
      'Mitigation: data curation and balancing, targeted fine-tuning, evaluation sets that slice by demographic, and red-teaming.',
      'Measure before and after; trade-offs exist between debiasing and accuracy.',
    ],
  },
  {
    id: 'deepfakes-watermarking',
    group: 'Evaluation & Risks',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are deepfakes and how do watermarking and provenance help?',
    a: [
      'Deepfakes are realistic synthetic images, video or audio of real people, used for fraud, misinformation and harassment.',
      'Invisible watermarks embed a signal in generated content that detectors can read (e.g. SynthID).',
      'Text watermarking biases token choices toward a secret "green list"; it is detectable statistically but weakened by paraphrasing.',
      'Provenance standards like C2PA attach signed metadata describing how content was created or edited.',
      'Post-hoc AI detectors are unreliable and produce false positives, so they should not be the only evidence.',
      'No method is foolproof: crops, re-encoding and editing can strip marks.',
    ],
  },
  {
    id: 'copyright-data-licensing',
    group: 'Evaluation & Risks',
    stars: 3,
    difficulty: 'Medium',
    q: 'What copyright and data-licensing issues surround generative AI?',
    a: [
      'Models are trained on scraped web data that includes copyrighted work; whether this is fair use or allowed under text-and-data-mining exceptions is being decided in courts and law.',
      'Outputs can reproduce training data (memorisation) or closely imitate a protected style or character.',
      'Copyright protection for purely AI-generated output is limited in many jurisdictions; human creative input matters.',
      'Mitigations: licensed or opt-out-respecting datasets, deduplication, output filters, and provider IP indemnities.',
      'Check model licences too: open-weight models may restrict commercial use or user counts.',
    ],
  },
  {
    id: 'model-collapse',
    group: 'Evaluation & Risks',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is model collapse?',
    a: [
      'Degradation that happens when models are trained repeatedly on data generated by earlier models.',
      'Rare patterns (the tails of the distribution) disappear first, then outputs become narrow and repetitive.',
      'A growing risk as AI-generated content fills the web that future models scrape.',
      'Mitigations: keep a large share of real human data, track data provenance, filter synthetic data and accumulate rather than replace data.',
      'Different from mode collapse in GANs, which happens within a single training run.',
    ],
  },
  {
    id: 'jailbreaks-vs-injection',
    group: 'Evaluation & Risks',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is a jailbreak and how is it different from prompt injection?',
    a: [
      'A jailbreak is when the user themself crafts input to bypass the model\'s safety training (role-play, hypotheticals, obfuscated encodings, many-shot examples).',
      'Prompt injection is when untrusted content (a web page, email, document) carries instructions that hijack an application built on the model.',
      'Jailbreak target: the model\'s policies. Injection target: the app and its tools and data.',
      'Defences against jailbreaks: safety training, adversarial training, input/output classifiers and red-teaming.',
      'Neither is fully solved, so high-risk actions need limits outside the model.',
    ],
  },
  {
    id: 'memorization-privacy',
    group: 'Evaluation & Risks',
    stars: 3,
    difficulty: 'Medium',
    q: 'How can generative models leak private training data?',
    a: [
      'Models can memorise and reproduce rare or duplicated sequences verbatim, including emails, phone numbers or keys.',
      'Extraction attacks prompt the model to regurgitate training data; membership inference tests whether a record was in the training set.',
      'Memorisation grows with model size, repetition of the data and number of epochs.',
      'Mitigations: deduplicate and scrub PII before training, differential privacy (DP-SGD), output filters.',
      'Fine-tuning on sensitive data is a particular risk, because small datasets are memorised easily.',
      'Regulation (e.g. GDPR) raises questions like the right to erasure, which is hard to apply to trained weights.',
    ],
  },
  {
    id: 'eu-ai-act',
    group: 'Evaluation & Risks',
    stars: 2,
    difficulty: 'Easy',
    q: 'What should an engineer know about the EU AI Act?',
    a: [
      'A risk-based EU regulation: unacceptable-risk uses are banned, high-risk uses carry strict obligations, limited-risk uses have transparency duties.',
      'Banned examples include social scoring and certain manipulative or biometric uses.',
      'High-risk areas (hiring, credit, education, critical infrastructure) need risk management, data governance, logging, human oversight and documentation.',
      'General-purpose AI model providers have their own duties: technical documentation, copyright policy and training-data summaries, with extra duties for models with systemic risk.',
      'Transparency: users must be told they are dealing with AI, and synthetic content should be labelled.',
      'Obligations phase in over several years, so check current timelines for your use case.',
    ],
  },

  // ───────────────────────── Practical GenAI ─────────────────────────
  {
    id: 'choosing-a-model',
    group: 'Practical GenAI',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you choose a generative model for a given task?',
    a: [
      'Start from the task: required quality, modality (text, vision, audio), context length, tool use and reasoning needs.',
      'Build a small eval set from real examples and compare candidates on it; public benchmarks are only a first filter.',
      'Weigh cost per token, latency and throughput against quality: often a smaller model is good enough.',
      'Consider deployment constraints: data privacy, on-prem or region requirements, licence terms.',
      'Prototype with the strongest model to find the quality ceiling, then try cheaper models or fine-tuning to hit cost targets.',
      'Avoid lock-in with an abstraction layer so you can swap models as they improve.',
    ],
  },
  {
    id: 'small-language-models',
    group: 'Practical GenAI',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are small language models (SLMs) and when should you use them?',
    a: [
      'Models with roughly a few hundred million to a few billion parameters, trained on high-quality or distilled data.',
      'Much cheaper and faster, and can run on a single GPU, a laptop or a phone.',
      'Good for narrow tasks: classification, extraction, routing, autocomplete, simple chat.',
      'Fine-tuned SLMs often match large models on a specific task.',
      'Weaker at broad knowledge, long multi-step reasoning and rare languages.',
      'A common pattern is to route easy requests to an SLM and escalate hard ones to a large model.',
    ],
  },
  {
    id: 'on-device-ai',
    group: 'Practical GenAI',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are the benefits and challenges of running generative AI on-device?',
    a: [
      'Benefits: privacy (data stays local), offline use, no per-token cost and low latency.',
      'Constraints: limited RAM, memory bandwidth, battery and heat.',
      'Techniques: small models, 4-bit or lower quantisation, pruning, distillation and NPU-optimised kernels.',
      'Runtimes: llama.cpp / GGUF, ONNX Runtime, Core ML, MLX, ExecuTorch, MediaPipe.',
      'Hybrid designs run simple tasks locally and send complex ones to the cloud.',
    ],
    code: `# run a quantised model locally with llama.cpp bindings
from llama_cpp import Llama
llm = Llama(model_path="model-q4_k_m.gguf", n_ctx=4096)
print(llm("Q: What is RoPE? A:", max_tokens=64)["choices"][0]["text"])`,
  },
  {
    id: 'reasoning-models-test-time-compute',
    group: 'Practical GenAI',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are reasoning models and test-time compute?',
    a: [
      'Reasoning models are trained (often with RL on verifiable rewards like maths and code) to produce a long internal chain of thought before answering.',
      'Test-time compute: spending more inference tokens on thinking improves accuracy, a new scaling axis beside model size.',
      'Other forms: sampling many answers and voting (self-consistency), best-of-N with a verifier, search over steps.',
      'Big gains on maths, coding, planning and multi-step problems; little gain on simple lookups or creative tasks.',
      'Costs: more tokens, higher latency and price; many APIs expose a thinking budget or effort setting.',
      'Thinking tokens may be hidden or summarised, and the visible reasoning is not guaranteed to reflect the true process.',
    ],
  },
  {
    id: 'long-context-vs-rag',
    group: 'Practical GenAI',
    stars: 4,
    difficulty: 'Medium',
    q: 'When would you put everything into a long context window instead of using retrieval?',
    a: [
      'Long context is simplest when the corpus is small enough to fit and the task needs reasoning across the whole thing (e.g. one contract, a codebase subset).',
      'It avoids retrieval misses and chunking errors.',
      'Downsides: cost and latency scale with input size, and quality can drop for facts buried in the middle ("lost in the middle").',
      'Retrieval scales to corpora far beyond any window, supports fresh data and per-user access control, and is cheaper per query.',
      'Prompt caching makes repeated long contexts cheaper, shifting the trade-off.',
      'Common answer: hybrid, retrieve generously then let a long-context model reason over the results.',
    ],
  },
  {
    id: 'hugging-face-ecosystem',
    group: 'Practical GenAI',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is Hugging Face and what are its main libraries?',
    a: [
      'Hugging Face is a hub for sharing open models, datasets and demo apps (Spaces), plus open-source libraries.',
      '`transformers`: load and run pretrained models with `AutoModel`, `AutoTokenizer` and `pipeline`.',
      '`datasets` for loading and processing data; `tokenizers` for fast tokenisation.',
      '`peft` for LoRA and other adapters; `trl` for SFT, DPO and RL fine-tuning; `accelerate` for multi-GPU training.',
      '`diffusers` for image, video and audio diffusion pipelines.',
      'Model cards document intended use, training data, licence and limitations; always read the licence.',
    ],
    code: `from transformers import pipeline
gen = pipeline("text-generation", model="<org>/<model>")
print(gen("Explain diffusion in one line:", max_new_tokens=40)[0]["generated_text"])`,
  },
  {
    id: 'langchain-llamaindex',
    group: 'Practical GenAI',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are LangChain and LlamaIndex for, and when should you skip them?',
    a: [
      'Both are orchestration frameworks for building LLM applications.',
      'LangChain: common interfaces for models, prompts, tools, memory and chains; LangGraph adds stateful agent graphs.',
      'LlamaIndex: focused on connecting data to LLMs: loaders, indexing, retrieval and query engines.',
      'Benefits: fast prototyping, many integrations, easy model switching.',
      'Downsides: extra abstraction layers, fast-changing APIs and harder debugging.',
      'Many production teams use provider SDKs directly for simple flows and adopt a framework only where it clearly saves work.',
    ],
  },
  {
    id: 'genai-use-cases',
    group: 'Practical GenAI',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are strong real-world use cases for generative AI?',
    a: [
      'Coding assistants: completion, explanation, test generation, refactoring and coding agents.',
      'Knowledge work: summarisation, drafting, translation, search over internal documents.',
      'Customer support: answer drafting, ticket triage and self-service agents.',
      'Data work: extracting structured fields from unstructured documents, classification at scale.',
      'Creative and media: images, video, voice-over, marketing copy, design ideation.',
      'Best fits share traits: errors are cheap or reviewable, and drafts save real human time.',
    ],
  },
  {
    id: 'genai-limitations',
    group: 'Practical GenAI',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are the main limitations of generative AI today?',
    a: [
      'Can produce confident, fluent but wrong output, so high-stakes outputs need verification.',
      'Knowledge is frozen at a training cutoff unless connected to tools or retrieval.',
      'Non-deterministic: the same input can give different outputs, which complicates testing.',
      'Weak spots: exact arithmetic without tools, precise counting, very long multi-step plans, and rare domains.',
      'Cost and latency at scale, plus security risks like prompt injection.',
      'Legal and ethical open questions: copyright, privacy, bias and accountability for decisions.',
    ],
  },
];
