A large language model generates text by **repeatedly predicting the next token**. It reads everything written so far, produces a probability for every token in its vocabulary, picks one, appends it, and repeats until it decides to stop.

## The Core Idea: Next-Token Prediction

During training, the model sees trillions of tokens of text and learns one task: given a sequence, predict what comes next. To get good at that across code, books, conversations and documentation, it has to learn grammar, facts, reasoning patterns and style. Everything an LLM "knows" is stored in its **weights** (billions of numeric parameters).

Modern LLMs are **decoder-only transformers**. They use **self-attention** so that every position can look back at all earlier tokens when deciding what comes next.

## Step by Step

1. **Tokenize** the prompt into integer ids (`"Hello world"` might become `[9906, 1917]`).
2. **Embed** each id into a vector and add positional information.
3. **Run the transformer stack**: dozens of layers of attention + feed-forward networks refine each token representation.
4. **Project to logits**: the final vector is turned into one score per vocabulary token (often 100K+ tokens).
5. **Softmax** converts scores into a probability distribution.
6. **Sample** a token using a decoding strategy (greedy, temperature, top-p).
7. **Append** the token and go back to step 3.
8. **Stop** at an end-of-sequence token, a stop sequence, or `max_tokens`.

```
"The cat sat on the" ──► [transformer] ──► P(next token)
                                             " mat"   0.41
                                             " floor" 0.18
                                             " sofa"  0.09
                                             ...
                         sample " mat" ──► "The cat sat on the mat"
```

## A Minimal Generation Loop

```python
import torch

def generate(model, tokenizer, prompt, max_tokens=50, temperature=0.7):
    ids = tokenizer.encode(prompt, return_tensors="pt")
    for _ in range(max_tokens):
        logits = model(ids).logits[:, -1, :]          # scores for the next token only
        probs = torch.softmax(logits / temperature, dim=-1)
        next_id = torch.multinomial(probs, num_samples=1)  # sample one token
        if next_id.item() == tokenizer.eos_token_id:
            break
        ids = torch.cat([ids, next_id], dim=-1)       # append and loop
    return tokenizer.decode(ids[0])
```

Real inference servers add a **KV cache** so earlier tokens are not recomputed each step.

## Prefill vs Decode

| Phase | What happens | Speed |
|---|---|---|
| **Prefill** | Whole prompt processed in parallel | Fast per token, compute-bound |
| **Decode** | One output token per forward pass | Slower, memory-bandwidth-bound |

This is why output tokens are usually priced higher than input tokens and why long answers take longer than long prompts.

## How a Base Model Becomes a Chatbot

- **Pretraining** produces a base model that continues text.
- **Instruction tuning** teaches it to follow instructions in a chat format.
- **Preference tuning** (RLHF, DPO and similar) makes answers more helpful, honest and safe.

The chat interface is still next-token prediction; the conversation is simply formatted as one long sequence with role markers.

## Important Consequences

- **No memory between calls**: each request must include the conversation history it needs.
- **Plausible, not verified**: the model optimises for likely text, which is why it can **hallucinate**.
- **Randomness is a setting**: temperature and top-p control how creative or deterministic outputs are.
- **Limited context**: it can only attend to what fits in its **context window**.

## Summary

- An LLM is a transformer that predicts a probability distribution over the next token.
- Text is generated **autoregressively**: predict, sample, append, repeat.
- Prompt processing is parallel (prefill), output generation is sequential (decode).
- Training stages (pretraining, instruction tuning, preference tuning) shape what those predictions look like.
