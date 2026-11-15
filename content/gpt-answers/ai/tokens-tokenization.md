**Tokens** are the small units of text an LLM actually reads and writes, typically whole words, pieces of words, punctuation or bytes, each mapped to an integer id. **Tokenization** is the process of converting raw text into that sequence of ids (and back again).

## Why Not Just Use Words or Characters?

- **Words**: the vocabulary would be enormous and could not handle typos, new words or other languages.
- **Characters**: sequences become very long, making models slower and context windows fill up quickly.
- **Sub-words**: a balance. Common words are a single token, rare words are split into meaningful pieces.

```
"unbelievably" -> ["un", "believ", "ably"]
"Hello world"  -> ["Hello", " world"]
"ChatGPT"      -> ["Chat", "G", "PT"]
```

Notice that the leading space is usually part of the token (`" world"`).

## How Sub-word Tokenizers Work

### Byte-Pair Encoding (BPE)

The most common approach (used by GPT-style and many open models):

1. Start with a base vocabulary of individual bytes or characters.
2. Count every adjacent pair in a large training corpus.
3. Merge the most frequent pair into a new token.
4. Repeat until the vocabulary reaches the target size (e.g. 50K-200K tokens).

At inference time, the learned merges are applied to new text deterministically.

### Other Algorithms

| Tokenizer | Idea | Used by |
|---|---|---|
| **BPE / byte-level BPE** | Merge most frequent pairs | GPT family, Llama 3, many others |
| **WordPiece** | Merge pairs that maximise likelihood | BERT |
| **SentencePiece (Unigram/BPE)** | Works on raw text incl. spaces, language-agnostic | T5, Gemma, many multilingual models |

## Example: Counting Tokens

```python
import tiktoken

enc = tiktoken.get_encoding("o200k_base")   # tokenizer used by recent OpenAI models
text = "Tokenization is surprisingly important!"

ids = enc.encode(text)
print(ids)                                  # list of integers
print(len(ids), "tokens")                   # roughly 5-6 tokens
print([enc.decode([i]) for i in ids])       # see each piece
```

Each model family has its own tokenizer, so always count with the matching one (or the provider token-counting endpoint).

## Rules of Thumb

- English: about **4 characters per token** or **~0.75 words per token**.
- 1,000 tokens is roughly 750 English words.
- Code, JSON, numbers and non-Latin scripts typically use **more tokens** per character.

## Why Tokens Matter in Practice

- **Cost**: APIs bill per input and output token.
- **Context window**: limits (e.g. 128K or 1M) are measured in tokens.
- **Latency**: generation speed is measured in tokens per second.
- **Model quirks**: because the model sees chunks, not letters, it can struggle with counting characters, spelling backwards, or some arithmetic on long numbers.
- **Multilingual fairness**: the same sentence can cost 2-3x more tokens in some languages.

## Common Pitfalls

- Estimating cost using word count instead of a tokenizer.
- Forgetting that system prompts, tool definitions and chat history all count toward tokens.
- Assuming two different models tokenize the same text identically.
- Truncating text by characters and accidentally cutting a token or multi-byte character.

## Summary

- Tokens are sub-word units mapped to integer ids; they are the model's real input and output.
- Most LLMs use learned sub-word tokenizers such as **BPE** or **SentencePiece**.
- Token counts drive **cost, context limits and latency**, and explain several odd model behaviours.
