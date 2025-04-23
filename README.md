# Expo MCP Server

A Model Context Protocol (MCP) server for working with Expo applications. This server enables AI assistants to manage Expo projects, run development servers, monitor logs, edit files, and fix errors.

## Features

- **Create and Initialize Expo Projects**: Create new Expo projects with specified templates
- **Manage Expo Development Servers**: Start, stop, and monitor Expo development servers
- **Access and Monitor Logs**: View real-time logs from running Expo servers
- **Error Analysis and Fixing**: Analyze errors and attempt automatic fixes for common issues
- **File Operations**: Read, write, and list files in your Expo projects
- **Package Management**: Run npm commands for dependency management

## Prerequisites

- Node.js 16.x or higher
- npm or pnpm package manager
- Expo CLI installed globally (`npm install -g expo-cli`) or accessible via npx

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Build the project:

```bash
npm run build
# or
pnpm build
```

## Usage

### Running the Server

To start the server:

```bash
npm start
# or
pnpm start
```

### Testing with the MCP Inspector

For development and testing, you can use the MCP Inspector:

```bash
npm run inspect
# or
pnpm inspect
```

This will open a web interface where you can test your MCP server.

### Using with Claude Desktop

To use this server with Claude Desktop:

1. Configure Claude Desktop to use your Expo MCP server by editing its configuration file.

   On macOS:
   ```
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

   On Windows:
   ```
   %APPDATA%/Claude/claude_desktop_config.json
   ```

2. Add the following to the configuration:

   ```json
   {
     "mcpServers": {
       "expo-mcp-server": {
         "command": "/path/to/your/build/index.js",
         "env": {
           "DEBUG": "true"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop.

## Available Tools

### Project Management

- `expo_init`: Create a new Expo project
- `expo_start`: Start an Expo development server
- `expo_stop`: Stop a running Expo development server

### Monitoring and Debugging

- `expo_logs`: Get logs from a running Expo server
- `expo_analyze_errors`: Analyze errors in Expo logs
- `expo_fix_error`: Attempt to fix detected errors

### File Operations

- `read_file`: Read file content
- `write_file`: Write content to a file
- `list_files`: List files in a directory

### Package Management

- `run_npm_command`: Run npm commands in your project

## Examples

Here are some examples of how to use the tools with Claude:

### Creating a New Expo Project

```
Please use expo_init to create a new Expo project called "my-app" with the blank template.
```

### Starting the Development Server

```
Can you start the Expo development server for my project at "/path/to/my-app"?
```

### Debugging Errors

```
My Expo app has errors. Can you analyze the errors in my project at "/path/to/my-app" and try to fix them?
```

## Troubleshooting

If you encounter issues:

1. Check the logs using the `expo_logs` tool
2. Make sure your project paths are correct
3. Verify that the Expo CLI is properly installed
4. Try running the Expo commands directly in your terminal to see if they work outside the MCP server

## License

MIT