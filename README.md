# Expo MCP Server

A Model Context Protocol (MCP) server that provides development and debugging tools for Expo-based React Native applications. This project integrates logging, process management, and file tooling to streamline automation and AI-based workflows.

## Features

- Start, stop, and monitor Expo development servers
- Capture and filter `stdout` / `stderr` logs
- Read, write, and list files in the project directory
- Query log statistics and clear logs
- Extendable via custom MCP tools
- Includes a packed single-file representation for AI processing (via Repomix)

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

| Tool Name       | Description                               |
|----------------|-------------------------------------------|
| `expoStart`     | Start Expo dev server (iOS by default)     |
| `expoStop`      | Stop running Expo dev server               |
| `expoStatus`    | Show status and logs for Expo server       |
| `expoLogs`      | Retrieve recent Expo logs                  |
| `expoGetLogs`   | Filtered logs with advanced options        |
| `expoLogStats`  | Summary statistics of current logs         |
| `expoClearLogs` | Clear all stored logs                      |
| `readFile`      | Read contents of a file                    |
| `writeFile`     | Write content to a file                    |
| `listFiles`     | List files in a directory                  |
| `listTools`     | List all tools registered in the server    |

## Project Structure

```
src/
├── expo-tools.ts     # Expo-related MCP tools
├── index.ts          # Server entry point
├── log-manager.ts    # In-memory + file logger
├── process.ts        # Cross-platform process management
.gitignore
package.json
tsconfig.json
```

## Tech Stack

- TypeScript
- FastMCP (Model Context Protocol server)
- Zod for input validation
- Node.js 23.x

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

## Known Issues / To-Do

- MCP server shutdown does not always kill the child Expo process
- Relies on global state to track process existence; should verify by PID instead
- Logs are not helpful when the server fails to start; improve error diagnostics
- Clients misunderstand `expoLogs` usage, leading to incorrect assumptions and unnecessary restarts
- Should query logs from persisted log files instead of in-memory child process events for robustness
- `npm run start` is... unkillable?

## License

MIT

