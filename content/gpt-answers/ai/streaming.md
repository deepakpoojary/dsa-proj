You stream LLM responses so users see text **as soon as the first tokens are generated** instead of waiting several seconds for the full answer. Technically, you request `stream: true` from the model API, receive incremental chunks (usually via **Server-Sent Events**), and forward them to the client as they arrive.

## Why stream?

LLMs generate output **one token at a time**. A 500-token answer might take 5-10 seconds to finish, but the first token arrives in a few hundred milliseconds.

- **Better perceived latency**: users start reading almost immediately (time to first token, TTFT, is what they feel)
- **Better UX**: the "typing" effect signals the system is working
- **Early cancellation**: users can stop a bad answer, saving tokens and cost
- **Avoid timeouts**: long responses don't hit gateway or proxy timeouts as easily
- **Agent UIs**: show intermediate steps and tool calls as they happen

## How it works

```text
Browser  <--- SSE / streamed HTTP ---  Your backend  <--- SSE chunks ---  LLM API
          "Hel" "lo" ", how" ...                        delta tokens
```

1. Your backend calls the LLM API with streaming enabled.
2. The API returns an event stream; each event contains a small **delta** of text (or a piece of a tool call).
3. Your backend forwards each delta to the browser over **SSE**, a streamed `fetch` response, or WebSockets.
4. The client appends deltas to the UI and handles the final "done" event.

## Example: backend (Node.js / TypeScript)

```ts
import OpenAI from 'openai';
import express from 'express';

const client = new OpenAI();
const app = express();
app.use(express.json());

app.post('/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no'); // stop nginx from buffering the stream

  const controller = new AbortController();
  req.on('close', () => controller.abort()); // stop generating if the user leaves

  try {
    const stream = await client.chat.completions.create(
      { model: 'gpt-4.1-mini', messages: req.body.messages, stream: true },
      { signal: controller.signal },
    );
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? '';
      if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: 'generation_failed' })}\n\n`);
  } finally {
    res.end();
  }
});
```

## Example: client

```ts
const response = await fetch('/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages }),
});

const reader = response.body!.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  const events = buffer.split('\n\n');
  buffer = events.pop() ?? ''; // keep any incomplete event for the next read
  for (const event of events) {
    const data = event.replace(/^data: /, '');
    if (data === '[DONE]') continue;
    appendToUI(JSON.parse(data).delta);
  }
}
```

Frameworks such as the Vercel AI SDK wrap this pattern in helpers.

## Things to handle

- **Partial structured output**: JSON and tool-call arguments arrive in fragments; accumulate them and parse only when complete (or use a partial-JSON parser for live previews).
- **Errors mid-stream**: the HTTP status is already 200, so send an error event and show it in the UI.
- **Cancellation**: abort the upstream request when the client disconnects.
- **Proxies and buffering**: disable buffering in nginx, CDNs and serverless platforms; set adequate timeouts.
- **Guardrails**: output moderation is harder because text is shown before it is complete. Check chunks incrementally, or buffer sentences before showing them for sensitive use cases.
- **Logging**: assemble the full response at the end for tracing, token counts and evals.

## SSE vs WebSockets

| | SSE / streamed HTTP | WebSockets |
|---|---|---|
| Direction | Server to client | Bidirectional |
| Complexity | Simple, works over plain HTTP | Needs connection management |
| Typical use | Chat responses | Voice, realtime collaboration |

## Summary

- Streaming cuts perceived latency to the time of the first token and allows cancellation.
- Enable `stream: true`, read deltas from the SSE stream and forward them to the client.
- Handle partial JSON, mid-stream errors, disconnects, proxy buffering and incremental guardrails.
