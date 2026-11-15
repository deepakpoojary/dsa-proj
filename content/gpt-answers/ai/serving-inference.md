To self-host an open model you run it behind an **inference server** such as **vLLM**, SGLang, TGI or TensorRT-LLM on GPUs. These servers use **continuous batching**, efficient **KV-cache management** (PagedAttention) and optional **quantisation** to serve many concurrent users with high throughput, usually through an OpenAI-compatible API.

## Why self-host?

- **Data privacy and control**: data never leaves your infrastructure
- **Cost at scale**: cheaper per token at high, steady utilisation
- **Customisation**: serve fine-tuned models and LoRA adapters
- **Predictable latency** without third-party rate limits

The downside is the ops burden: GPUs, scaling, upgrades and on-call.

## Quick start with vLLM

```bash
pip install vllm

# Serve an instruct model with an OpenAI-compatible API on port 8000
vllm serve meta-llama/Llama-3.1-8B-Instruct \
  --max-model-len 8192 \
  --gpu-memory-utilization 0.90 \
  --enable-prefix-caching
```

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="unused")
resp = client.chat.completions.create(
    model="meta-llama/Llama-3.1-8B-Instruct",
    messages=[{"role": "user", "content": "Summarise PagedAttention in one sentence."}],
)
print(resp.choices[0].message.content)
```

Because the API is OpenAI-compatible, most SDKs and frameworks work by changing the base URL.

## Key concepts

### Prefill and decode

- **Prefill**: process all input tokens in parallel (compute-bound); determines time to first token
- **Decode**: generate tokens one by one (memory-bandwidth-bound); each step reads the model weights and KV cache

### KV cache

For every token in context, the model stores attention keys and values. This **KV cache** grows with sequence length and number of concurrent requests and is often the main limit on concurrency.

### PagedAttention

vLLM stores the KV cache in fixed-size **pages** (like virtual memory), avoiding fragmentation and over-allocation. More sequences fit on the GPU, and shared prefixes can reuse the same pages (**prefix caching**).

### Continuous batching

Static batching waits for a batch to fill and for all its sequences to finish. **Continuous (in-flight) batching** adds new requests and removes finished ones at every decode step, keeping the GPU busy and multiplying throughput.

```text
Static:      [A A A A A A][B B B . . .]   GPU idle while waiting for the longest sequence
Continuous:  A B C, A B D, A E D, F E D   new requests join as soon as a slot frees up
```

## Sizing GPU memory

```text
GPU memory ≈ model weights + KV cache + overhead

weights ≈ parameters x bytes per parameter
  8B  in FP16 ≈ 16 GB     8B  in INT4 ≈ ~5 GB
  70B in FP16 ≈ 140 GB    70B in FP8  ≈ 70 GB
```

Whatever is left after the weights determines how many tokens of KV cache, and therefore how many concurrent users, you can serve.

## Optimisations

| Technique | What it does | Trade-off |
|---|---|---|
| Quantisation (FP8, AWQ, GPTQ INT4) | Smaller weights, faster decode | Small quality loss; evaluate |
| Tensor parallelism | Splits a model across GPUs | Needs fast interconnect |
| Prefix caching | Reuses KV for shared prompts | Memory for cached prefixes |
| Speculative decoding | Draft model proposes tokens, big model verifies | Extra model, gains vary |
| Multi-LoRA serving | Many fine-tunes on one base model | Slight overhead per adapter |
| Chunked prefill | Interleaves long prefills with decodes | Tuning required |

## Production setup

- **Containerise** the server and deploy on Kubernetes or a managed GPU platform
- **Autoscale** on queue depth, pending requests or GPU utilisation, not CPU
- Put a **gateway** in front for auth, rate limiting, routing and logging
- Monitor TTFT, tokens per second, KV-cache usage, queue length and GPU memory
- Warm up replicas; model loading can take minutes
- Pin model and server versions and run evals before upgrading

## Throughput vs latency

Larger batches give higher total throughput (tokens per second across users) but can increase per-request latency. Tune `max_num_seqs` and batch token limits for your SLA.

## Summary

- Serve open models with vLLM or similar servers, which expose an OpenAI-compatible API.
- Continuous batching and PagedAttention maximise GPU utilisation; quantisation, tensor parallelism and speculative decoding help fit and speed up models.
- Size memory for weights plus KV cache, autoscale on queue depth, and weigh control and cost against operational effort.
