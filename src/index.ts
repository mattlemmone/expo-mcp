#!/usr/bin/env node

import { FastMCP } from "fastmcp";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";

// Create a new FastMCP server
const server = new FastMCP({
  name: "File Server",
  version: "1.0.0",
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
      const fileContent = await fs.readFile(normalizedPath, 'utf8');
      
      log.info(`Successfully read file: ${normalizedPath}`);
      
      return {
        content: [
          { 
            type: "text", 
            text: fileContent 
          }
        ]
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
            text: `Successfully wrote ${args.content.length} characters to ${normalizedPath}` 
          }
        ]
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
    directoryPath: z.string().describe("The path to the directory to list files from"),
  }),
  execute: async (args, { log }) => {
    try {
      log.info(`Listing files in directory: ${args.directoryPath}`);
      
      // Ensure the path is safe (no directory traversal)
      const normalizedPath = path.normalize(args.directoryPath);
      
      // Read the directory
      const files = await fs.readdir(normalizedPath, { withFileTypes: true });
      
      // Format the results
      const fileList = files.map(file => ({
        name: file.name,
        isDirectory: file.isDirectory(),
        path: path.join(normalizedPath, file.name)
      }));
      
      log.info(`Successfully listed ${fileList.length} files in ${normalizedPath}`);
      
      return {
        content: [
          { 
            type: "text", 
            text: JSON.stringify(fileList, null, 2) 
          }
        ]
      };
    } catch (error: any) {
      log.error(`Error listing files: ${error.message}`);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  },
});

// Start the server with stdio transport
server.start({
  transportType: "stdio",
});

console.error("File Server started. Ready to handle MCP requests.");
