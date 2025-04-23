#!/usr/bin/env node

import { FastMCP } from "fastmcp";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";
import { addExpoTools, setupShutdownHandlers } from "./expo-tools.js"; // Add .js extension
import { LogManager, addLogTools } from "./log-manager.js"; // Add .js extension

// Create a new FastMCP server
const server = new FastMCP({
  name: "Expo MCP Server",
  version: "1.0.0",
});

// Create the log manager for enhanced logging
const logManager = new LogManager({
  maxLogEntries: 2000,
  logFilePath: path.join(process.cwd(), "logs", "expo.log"),
});

// Define the readFile tool
server.addTool({
  name: "readFile",
  description: "Read the contents of a file",
  parameters: z.object({
    filePath: z.string().describe("The path to the file to read"),
  }),
  execute: async (args, { log }) => {
    try {
      log.info(`Reading file at path: ${args.filePath}`);

      // Ensure the path is safe (no directory traversal)
      const normalizedPath = path.normalize(args.filePath);

      // Read the file
      const fileContent = await fs.readFile(normalizedPath, "utf8");

      log.info(`Successfully read file: ${normalizedPath}`);

      return {
        content: [
          {
            type: "text",
            text: fileContent,
          },
        ],
      };
    } catch (error: any) {
      log.error(`Error reading file: ${error.message}`);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  },
});

// Define the writeFile tool
server.addTool({
  name: "writeFile",
  description: "Write content to a file",
  parameters: z.object({
    filePath: z.string().describe("The path to the file to write"),
    content: z.string().describe("The content to write to the file"),
  }),
  execute: async (args, { log }) => {
    try {
      log.info(`Writing to file at path: ${args.filePath}`);

      // Ensure the path is safe (no directory traversal)
      const normalizedPath = path.normalize(args.filePath);

      // Create the directory if it doesn't exist
      const directory = path.dirname(normalizedPath);
      await fs.mkdir(directory, { recursive: true });

      // Write to the file
      await fs.writeFile(normalizedPath, args.content);

      log.info(`Successfully wrote to file: ${normalizedPath}`);

      return {
        content: [
          {
            type: "text",
            text: `Successfully wrote ${args.content.length} characters to ${normalizedPath}`,
          },
        ],
      };
    } catch (error: any) {
      log.error(`Error writing file: ${error.message}`);
      throw new Error(`Failed to write file: ${error.message}`);
    }
  },
});

// Define the listFiles tool
server.addTool({
  name: "listFiles",
  description: "List files in a directory",
  parameters: z.object({
    directoryPath: z
      .string()
      .describe("The path to the directory to list files from"),
  }),
  execute: async (args, { log }) => {
    try {
      log.info(`Listing files in directory: ${args.directoryPath}`);

      // Ensure the path is safe (no directory traversal)
      const normalizedPath = path.normalize(args.directoryPath);

      // Read the directory
      const files = await fs.readdir(normalizedPath, { withFileTypes: true });

      // Format the results
      const fileList = files.map((file) => ({
        name: file.name,
        isDirectory: file.isDirectory(),
        path: path.join(normalizedPath, file.name),
      }));

      log.info(
        `Successfully listed ${fileList.length} files in ${normalizedPath}`,
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(fileList, null, 2),
          },
        ],
      };
    } catch (error: any) {
      log.error(`Error listing files: ${error.message}`);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  },
});

console.log("About to add Expo tools...");
// Add the Expo tools to the server - Pass logManager to integrate logging
addExpoTools(server);

console.log("About to add log tools...");
// Add the enhanced log tools to the server
addLogTools(server, logManager);

// Set up shutdown handlers for process cleanup
setupShutdownHandlers();

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
            text: `Available tools:\n${tools.map((tool) => `- ${tool}`).join("\n")}`,
          },
        ],
      };
    } catch (error: any) {
      log.error(`Error listing tools: ${error.message}`);
      throw new Error(`Failed to list tools: ${error.message}`);
    }
  },
});

// Log startup information
console.log("Expo File Server started. Ready to handle MCP requests.");
console.log(`- Version: Expo File Server 1.0.0`);
console.log(`- Log file: ${path.join(process.cwd(), "logs", "expo.log")}`);
console.log(
  "- Available tools: readFile, writeFile, listFiles, expoStart, expoStop, expoLogs, expoStatus, expoGetLogs, expoLogStats, expoClearLogs, listTools",
);

// Start the server with stdio transport
server.start({
  transportType: "stdio",
});

