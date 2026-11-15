Choose based on **task quality, data constraints, cost at your volume, latency and how much control you need**. Closed API models are usually the fastest path to the highest quality with zero infrastructure, while open-weight models give you control, privacy and potentially lower cost at scale in exchange for operational work.

## Definitions

- **Closed / API models**: weights are private; you call a hosted endpoint and pay per token (e.g. GPT, Claude and Gemini models).
- **Open-weight models**: weights are downloadable under a licence; you can self-host, fine-tune and inspect them (e.g. Llama, Mistral, Qwen, DeepSeek, Gemma families). "Open-weight" is more precise than "open source", since training data and code are often not released.

## Comparison

| Factor | Closed (API) | Open-weight |
|---|---|---|
| Peak quality | Usually frontier | Close behind, sometimes on par for specific tasks |
| Time to start | Minutes | Days to weeks to set up serving |
| Infrastructure | None | GPUs, serving stack, scaling, monitoring |
| Cost model | Pay per token | Fixed GPU cost; cheap per token at high utilisation |
| Data privacy | Data sent to vendor (with contractual protections, regional options) | Can stay fully in your environment |
| Customisation | Prompting, some hosted fine-tuning | Full fine-tuning, LoRA, quantisation, architecture tweaks |
| Vendor lock-in | Higher; models can be deprecated | Low; you own the artefact |
| Latency control | Shared infrastructure, rate limits | Tunable; on-prem or on-device possible |
| Licensing | Terms of service | Varies (Apache-2.0, MIT, custom licences with restrictions) |

## Key Questions to Ask

1. **How hard is the task?** Complex reasoning, agents and coding often benefit from frontier models. Classification, extraction or summarisation can run well on smaller open models.
2. **What are the data rules?** Regulated data, air-gapped environments or strict residency needs push toward self-hosting (or private cloud deployments of either kind).
3. **What is the volume?** Low or spiky traffic favours APIs. Sustained high volume can make dedicated GPUs cheaper.
4. **Do you need deep customisation?** Heavy fine-tuning or running on edge devices favours open weights.
5. **Does the team have MLOps skills?** Serving, autoscaling, upgrades and safety filtering are real ongoing work.

## A Rough Cost Sketch

```python
# Back-of-envelope: when does self-hosting break even?
api_cost_per_m_tokens = 1.00          # USD, blended input/output for a mid-tier API model
monthly_tokens_m = 5_000              # 5B tokens per month

gpu_hourly = 4.00                     # USD per GPU-hour
gpus = 4
monthly_gpu_cost = gpu_hourly * gpus * 24 * 30

api_monthly = api_cost_per_m_tokens * monthly_tokens_m
print(f"API: ${api_monthly:,.0f}  vs  self-host GPUs: ${monthly_gpu_cost:,.0f} + ops time")
```

Plug in real prices and measured throughput (e.g. with vLLM) before deciding; engineering and on-call time often dominate.

## A Common, Pragmatic Strategy

1. **Prototype with a strong API model** to prove the product works.
2. **Build an eval set** that measures what quality means for your use case.
3. **Route by difficulty**: send easy, high-volume requests to a smaller or open model; keep hard ones on a frontier model.
4. **Distil or fine-tune** an open model on high-quality outputs if cost or privacy demands it.
5. **Keep an abstraction layer** (a gateway or SDK wrapper) so switching providers is a config change.

## Common Pitfalls

- Comparing models on public benchmarks instead of **your own** evals.
- Underestimating the operational cost of self-hosting.
- Ignoring licence terms (usage caps, acceptable-use clauses).
- Hard-coding one vendor's API shape throughout the codebase.

## Summary

- Closed APIs: best quality and speed to market, less control.
- Open weights: control, privacy and customisation, at the cost of infrastructure and expertise.
- Decide with your own evals, data rules and volume, and keep the architecture model-agnostic so you can mix both.
