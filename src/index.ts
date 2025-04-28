#!/usr/bin/env node

import { FastMCP } from "fastmcp";
import { z } from "zod";
import * as path from "path";
import { readFile, writeFile, listFiles, tailFile } from "./file.js";

// Create a new FastMCP server
const server = new FastMCP({
  name: "Expo MCP Server",
  version: "1.0.0",
});

// Create an addTool function to pass to tool modules
const addTool = (tool: any) => server.addTool(tool);

// Add the file tools to the server
addTool({
  name: "readFile",
  description: "Read the contents of a file",
  parameters: z.object({
    filePath: z.string().describe("The path to the file to read"),
  }),
  execute: readFile,
});

addTool({
  name: "writeFile",
  description: "Write content to a file",
  parameters: z.object({
    filePath: z.string().describe("The path to the file to write"),
    content: z.string().describe("The content to write to the file"),
  }),
  execute: writeFile,
});

addTool({
  name: "listFiles",
  description: "List files in a directory",
  parameters: z.object({
    directoryPath: z
      .string()
      .describe("The path to the directory to list files from"),
  }),
  execute: listFiles,
});

addTool({
  name: "tailFile",
  description: "Read the last N lines from a file",
  parameters: z.object({
    filePath: z.string().describe("The path to the file to tail"),
    lines: z.number().int().positive().describe("Number of lines to read from the end of the file"),
  }),
  execute: tailFile,
});

// Create a simple debug tool to list all tools
server.addTool({
  name: "listTools",
  description: "List all available tools in this MCP server",
  parameters: z.object({}),
  execute: async (_, { log }) => {
    try {
      // Get all the tools (this is a workaround since we don't have direct access to the tools list)
      const tools = Object.keys((server as any)["_tools"] || {});

      return {
        content: [
          {
            type: "text",
            text: `Available tools:\n${tools
              .map((tool) => `- ${tool}`)
              .join("\n")}`,
          },
        ],
      };
    } catch (error: any) {
      log.error(`Error listing tools: ${error.message}`);
      throw new Error(`Failed to list tools: ${error.message}`);
    }
  },
});

// Start the server with stdio transport
server.start({
  transportType: "stdio",
});

process.on("SIGINT", () => {
  process.exit(0);
});
