**Quantization** reduces the numeric precision used to store a model's weights (and sometimes its activations and KV cache), for example from 16-bit floats to 8-bit or 4-bit values. This shrinks memory use and usually speeds up inference, at the cost of some, often small, loss in accuracy.

## Why it matters

Model memory is roughly **parameters × bytes per parameter**:

| Precision | Bytes per param | 8B model | 70B model |
|---|---|---|---|
| FP32 | 4 | 32 GB | 280 GB |
| FP16 / BF16 | 2 | 16 GB | 140 GB |
| INT8 / FP8 | 1 | 8 GB | 70 GB |
| INT4 / NF4 | 0.5 | about 4-5 GB | about 35-40 GB |

(Weights only; the KV cache and activations need extra memory.)

So 4-bit quantization lets a 70B model run on a single high-memory GPU or a pair of consumer GPUs, and an 8B model run on a laptop.

## How it works

Quantization maps a range of floating-point values onto a small set of integers using a **scale** (and sometimes a **zero point**):

```
q = round(x / scale) + zero_point          # quantize
x ≈ (q - zero_point) * scale                # dequantize
```

```python
import numpy as np

w = np.random.randn(8).astype(np.float32)
scale = np.abs(w).max() / 127                      # symmetric INT8
q = np.clip(np.round(w / scale), -127, 127).astype(np.int8)
w_hat = q.astype(np.float32) * scale

print("max error:", np.abs(w - w_hat).max())       # small rounding error
```

Real methods use **per-channel or per-group scales** (for example one scale per 128 weights) so that outlier values do not destroy precision for everything else.

## Types of quantization

### By when it happens
- **Post-training quantization (PTQ)**: quantize an already-trained model, often with a small calibration dataset. This is fast and most common.
  - **GPTQ**: minimises layer-wise reconstruction error.
  - **AWQ**: protects the weights tied to important activations.
  - **GGUF** (llama.cpp): popular formats such as Q4_K_M for CPU and local inference.
  - **bitsandbytes**: on-the-fly 8-bit and 4-bit (NF4) loading.
- **Quantization-aware training (QAT)**: simulate quantization during training so the model learns to tolerate it. Better quality at low bit-widths, but it needs training compute.

### By what is quantized
- **Weight-only** (for example W4A16): weights in 4-bit, computation in 16-bit. Great for memory-bound decoding.
- **Weights and activations** (for example W8A8, FP8): enables faster low-precision matrix maths on supporting hardware.
- **KV-cache quantization**: shrinks memory for long contexts and large batches.

## Why it can be faster

LLM token generation is usually **memory-bandwidth bound**: each new token requires reading all the weights from GPU memory. Fewer bytes per weight means less data to move, which means more tokens per second. Real speed-ups depend on **kernel and hardware support** (for example FP8 tensor cores on recent NVIDIA GPUs, and optimised INT4 kernels in vLLM, TensorRT-LLM and llama.cpp).

## Trade-offs

| Benefit | Cost |
|---|---|
| 2-4x less memory | Some accuracy loss |
| Run larger models on cheaper hardware | Quality drops faster at 3 bits and below |
| Higher throughput and lower latency | Not every hardware or kernel combination is faster |
| Lower serving cost | Calibration, format conversion and tooling effort |
| Bigger batches and longer contexts | Sensitive tasks (maths, code, long reasoning) degrade first |

Rules of thumb:
- **8-bit / FP8**: usually near-lossless.
- **4-bit** (good methods such as AWQ, GPTQ or Q4_K_M): small, often acceptable drop.
- **Below 4 bits**: noticeable degradation for most models.
- Larger models tend to tolerate quantization better than small ones.
- A **larger model at 4-bit** often beats a **smaller model at 16-bit** for the same memory.

## Example: loading a 4-bit model

```python
import torch
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

config = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4",
                            bnb_4bit_compute_dtype=torch.bfloat16)
model = AutoModelForCausalLM.from_pretrained("mistralai/Mistral-7B-Instruct-v0.3",
                                             quantization_config=config, device_map="auto")
```

## Best practices

- **Evaluate on your own tasks**: perplexity alone hides task-specific regressions.
- Use **calibration data** that resembles real traffic.
- Prefer **well-tested pre-quantized checkpoints** from model publishers where available.
- Match the format to the runtime: GGUF for llama.cpp or Ollama; AWQ, GPTQ or FP8 for vLLM and TensorRT-LLM.

## Summary

- Quantization stores weights (and optionally activations and KV cache) in fewer bits, cutting memory 2-4x and often increasing speed.
- 8-bit is nearly free; 4-bit is usually a good trade; lower bit-widths hurt quality.
- Choose PTQ for speed of adoption and QAT for best low-bit quality, and always validate on your own workload.
