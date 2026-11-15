**LoRA (Low-Rank Adaptation)** is a parameter-efficient fine-tuning method that **freezes the original model weights** and trains small low-rank matrices added to selected layers, so only a tiny fraction of parameters are updated. **QLoRA** goes further: it loads the frozen base model in **4-bit quantized** form and trains LoRA adapters on top, which makes it possible to fine-tune very large models on a single GPU.

## The problem LoRA solves

Full fine-tuning updates **every** weight. For a 7B-parameter model that means storing gradients and optimiser state for billions of parameters, which needs well over 100 GB of GPU memory, and each fine-tuned version is a full multi-gigabyte copy of the model.

## How LoRA works

For a weight matrix `W` (size d × k), LoRA does not learn a full update ΔW. It learns two small matrices:

```
W' = W + ΔW = W + (alpha / r) · B · A

W : d × k   (frozen)
B : d × r   (trainable, initialised to zero)
A : r × k   (trainable, random init)
r : rank, e.g. 8, 16, 64   (r << d, k)
```

**Example:** for a 4096 × 4096 attention matrix:
- Full update: about 16.8M parameters
- LoRA with r = 16: 4096 × 16 + 16 × 4096 ≈ **131K** parameters (under 1%)

The idea: the **change** needed to adapt a pretrained model to a task has low "intrinsic rank", so a low-rank update captures most of it.

Because B starts at zero, training begins exactly from the base model's behaviour.

### Benefits

- **Much less memory**: no gradients or optimiser state for frozen weights.
- **Tiny adapter files**: often 10-200 MB instead of many GB.
- **Swappable adapters**: one base model can serve many tasks or customers by loading different adapters (vLLM and other servers support multi-LoRA serving).
- **No inference overhead if merged**: `W + BA` can be folded into the weights.
- **Quality** close to full fine-tuning for most instruction and domain tasks.

## How QLoRA works

QLoRA (2023) adds quantization to LoRA:

1. **4-bit NormalFloat (NF4)**: a data type designed for normally distributed weights, used to store the frozen base model.
2. **Double quantization**: quantizes the quantization constants too, saving more memory.
3. **Paged optimisers**: absorb memory spikes by paging optimiser state to CPU RAM.
4. The LoRA adapters are trained in **16-bit** (BF16), and the 4-bit weights are dequantized on the fly during the forward and backward passes.

**Result:** a 65-70B model can be fine-tuned on a single 48-80 GB GPU, and 7-8B models fit on consumer GPUs with 16-24 GB.

## Comparison

| Method | Trainable params | GPU memory (7B model, approx.) | Speed | Quality |
|---|---|---|---|---|
| Full fine-tuning | 100% | 100+ GB | Baseline | Best (in principle) |
| LoRA (16-bit base) | about 0.1-1% | about 16-24 GB | Fast | Near full fine-tuning |
| QLoRA (4-bit base) | about 0.1-1% | about 6-10 GB | Somewhat slower (dequantization) | Close to LoRA |

## Example with Hugging Face PEFT

```python
import torch
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training

# QLoRA: load the base model in 4-bit NF4
bnb = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=torch.bfloat16,
)
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.1-8B", quantization_config=bnb)
model = prepare_model_for_kbit_training(model)

# Attach LoRA adapters
lora = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    task_type="CAUSAL_LM",
)
model = get_peft_model(model, lora)
model.print_trainable_parameters()
# trainable params: ~42M || all params: ~8B || trainable%: ~0.5
# ...then train with transformers Trainer / TRL SFTTrainer
```

## Key hyperparameters

- **`r` (rank)**: capacity of the adapter. 8-16 suits simple style tasks; 32-64 suits harder domain shifts.
- **`lora_alpha`**: scaling factor, often set to r or 2r.
- **`target_modules`**: applying LoRA to all linear layers (attention plus MLP) usually beats attention-only.
- **Learning rate**: higher than for full fine-tuning (for example 1e-4 to 2e-4).

## Limitations

- Can underperform full fine-tuning on very large distribution shifts, such as teaching a new language.
- QLoRA training is slower than LoRA because of dequantization overhead.
- Merging an adapter into a quantized model needs care (merge into the full-precision weights, then re-quantize).

## Summary

- LoRA freezes the model and trains small low-rank matrices, typically under 1% of parameters, with near full-fine-tuning quality.
- QLoRA stores the frozen base in 4-bit NF4, so large models can be fine-tuned on one GPU.
- Adapters are small, swappable and mergeable, which makes customisation cheap to train and serve.
