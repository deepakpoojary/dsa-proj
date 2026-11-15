The **Model Context Protocol (MCP)** is an open standard that defines how AI applications connect to external **tools, data sources and prompts** through a common interface. Anthropic introduced it in November 2024, and it has since been adopted across the industry, including by OpenAI, Google, Microsoft and most major IDEs and agent frameworks. It is often described as **"USB-C for AI"**: build an integration once as an MCP server, and any MCP-compatible client can use it.

## The problem it solves

Before MCP, every AI app needed custom glue code for every integration:

```
M apps × N tools = M × N custom integrations
```

With MCP, each app implements the **client** side once and each tool implements the **server** side once:

```
M clients + N servers → everything interoperates
```

## Architecture

```
┌─────────────────── Host application ───────────────────┐
│  (Claude Desktop, IDE, ChatGPT, custom agent)          │
│                                                        │
│   LLM ◄──► MCP client ──┐    MCP client ──┐            │
└─────────────────────────┼─────────────────┼────────────┘
                          │ JSON-RPC 2.0    │
                          ▼                 ▼
                 ┌──────────────┐   ┌──────────────┐
                 │ MCP server:  │   │ MCP server:  │
                 │ GitHub       │   │ Postgres     │
                 └──────────────┘   └──────────────┘
```

- **Host**: the AI application the user interacts with.
- **Client**: lives inside the host and keeps a 1:1 connection to a server.
- **Server**: exposes capabilities, for example wrapping an API, database or filesystem.

Messages use **JSON-RPC 2.0**. Clients and servers negotiate capabilities when they connect.

## What servers expose

| Primitive | Controlled by | Purpose | Example |
|---|---|---|---|
| **Tools** | Model | Actions or functions the LLM can call | `create_issue`, `run_query` |
| **Resources** | Application | Read-only data loaded into context | File contents, DB schema |
| **Prompts** | User | Reusable prompt templates or workflows | "Summarise this PR" |

Clients can also offer features to servers, such as **sampling** (a server asks the host's LLM for a completion) and **elicitation** (a server asks the user for input).

## Transports

- **stdio**: the server runs as a local subprocess. Simple and common for desktop and IDE tools.
- **Streamable HTTP**: for remote, hosted servers, with **OAuth 2.1**-based authorisation.

## Example: a minimal MCP server (Python SDK)

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("notes")

NOTES: dict[str, str] = {}

@mcp.tool()
def add_note(title: str, body: str) -> str:
    """Save a note with a title and body."""
    NOTES[title] = body
    return f"Saved note '{title}'"

@mcp.resource("notes://{title}")
def read_note(title: str) -> str:
    """Return the body of a saved note."""
    return NOTES.get(title, "Not found")

if __name__ == "__main__":
    mcp.run()   # stdio transport by default
```

A host is then configured to launch the server, for example:

```json
{
  "mcpServers": {
    "notes": { "command": "python", "args": ["notes_server.py"] }
  }
}
```

The type hints and docstrings become the tool's **JSON Schema and description**, which the LLM uses to decide when to call it.

## MCP vs plain function calling

- **Function calling** is the model-level ability to emit a structured tool call.
- **MCP** is the **integration protocol** that makes those tools discoverable and reusable across apps. Under the hood, the host still turns MCP tools into function-calling definitions for the model.

## Security considerations

- **Only install trusted servers**: a server runs code and can access data.
- **Tool poisoning / prompt injection**: malicious tool descriptions or returned content can manipulate the model.
- **Least privilege**: scope tokens narrowly and prefer read-only access.
- **Human approval** for sensitive tool calls.
- **Context bloat**: many servers with many tools consume tokens and confuse tool selection, so enable only what you need.

## Summary

- MCP is an open, JSON-RPC-based protocol that standardises how AI apps connect to tools, resources and prompts.
- It replaces M × N custom integrations with reusable servers that work in any MCP client.
- Treat MCP servers like any third-party code: vet them, scope their permissions, and guard against prompt injection.
