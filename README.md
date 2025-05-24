# File MCP

[![smithery badge](https://smithery.ai/badge/@mattlemmone/file-mcp)](https://smithery.ai/server/@mattlemmone/file-mcp)

A Model Context Protocol (MCP) server that provides file system operations through a standardized API.
Mainly just doing this so I can prototype and integrate error logs into mcp clients.

## Usage

### CLI

```bash
npm run build
npm start
```

### Development

```bash
npm run dev
```

### Testing

```bash
npm run inspect
```

### Available Tools

| Tool Name   | Description                             |
| ----------- | --------------------------------------- |
| `readFile`  | Read contents of a file                 |
| `writeFile` | Write content to a file                 |
| `listFiles` | List files in a directory               |
| `tailFile`  | Read the last N lines from a file       |
| `listTools` | List all tools registered in the server |

## Installation

### Installing via Smithery

To install File MCP for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@mattlemmone/file-mcp):

```bash
npx -y @smithery/cli install @mattlemmone/file-mcp --client claude
```

### Manual Installation
```bash
npm install
```

## Build

```bash
npm run build
```

## License

MIT
