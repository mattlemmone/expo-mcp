import { FastMCP } from "fastmcp";
import { z } from "zod";
import * as path from "path";
// Make sure the path to process.js is correct
import { createProcess, ProcessManager } from "./process.js";
import { LogManager } from "./log-manager.js";

// Type declarations for global objects
declare global {
  var processes: {
    [key: string]: ProcessManager;
  };
  var expoLogs: Array<{
    type: "stdout" | "stderr";
    data: string;
    timestamp: string;
  }>;
}

/**
 * Add Expo-related tools to an existing FastMCP server
 * @param server The FastMCP server instance
 * @param logManager Optional LogManager instance for enhanced logging
 */
export function addExpoTools(server: FastMCP) {
  // Define the expoStart tool
  server.addTool({
    name: "expoStart",
    description: "Start an Expo development server",
    parameters: z.object({
      projectPath: z.string().describe("Path to the Expo project directory"),
    }),
    execute: async (args, { log }) => {
      try {
        log.info(`Starting Expo server at path: ${args.projectPath}`);

        // Create command array with optional arguments
        const command = "npm";
        const commandArgs = ["run", "ios"];

        // Create a global process manager instance to track the running process
        if (!global.processes) {
          global.processes = {};
        }

        // Stop existing process if running
        if (global.processes.expo) {
          log.info("Stopping existing Expo process...");
          await global.processes.expo.stop();
        }

        // Create and start process
        global.processes.expo = await createProcess({
          command,
          args: commandArgs,
          projectPath: args.projectPath,
          onStdout: (data: string) => {
            // Store logs for later retrieval
            if (!global.expoLogs) {
              global.expoLogs = [];
            }
            global.expoLogs.push({
              type: "stdout",
              data,
              timestamp: new Date().toISOString(),
            });
            // Cap log size to prevent memory issues
            if (global.expoLogs.length > 1000) {
              global.expoLogs.shift();
            }
          },
          onStderr: (data: string) => {
            if (!global.expoLogs) {
              global.expoLogs = [];
            }
            global.expoLogs.push({
              type: "stderr",
              data,
              timestamp: new Date().toISOString(),
            });
            if (global.expoLogs.length > 1000) {
              global.expoLogs.shift();
            }
          },
          onError: (error: Error) => {
            log.error(`Expo error: ${error.message}`);
          },
          onExit: (code: number | null, signal: string | null) => {
            log.info(
              `Expo process exited with code ${code} and signal ${signal || "none"}`,
            );
          },
        });

        log.info(
          `Expo server started with PID: ${global.processes.expo.getPid()}`,
        );

        return {
          content: [
            {
              type: "text",
              text: `Successfully started Expo development server at ${args.projectPath}`,
            },
          ],
        };
      } catch (error: any) {
        log.error(`Error starting Expo server: ${error.message}`);
        throw new Error(`Failed to start Expo server: ${error.message}`);
      }
    },
  });

  // Define the expoLogs tool
  server.addTool({
    name: "expoLogs",
    description: "Get logs from the running Expo server",
    parameters: z.object({
      count: z
        .number()
        .optional()
        .default(50)
        .describe("Number of log entries to retrieve"),
      type: z
        .enum(["all", "stdout", "stderr"])
        .optional()
        .default("all")
        .describe("Type of logs to retrieve"),
    }),
    execute: async (args, { log }) => {
      try {
        const count = args.count || 50;
        const logType = args.type || "all";

        if (!global.expoLogs || global.expoLogs.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No Expo logs available. Make sure the Expo server is running.",
              },
            ],
          };
        }

        // Filter logs by type if requested
        let filteredLogs = global.expoLogs;
        if (logType !== "all") {
          filteredLogs = global.expoLogs.filter(
            (entry) => entry.type === logType,
          );
        }

        // Get the last N logs
        const recentLogs = filteredLogs.slice(-count);

        // Format logs for display
        const formattedLogs = recentLogs
          .map((entry) => `[${entry.timestamp}] [${entry.type}] ${entry.data}`)
          .join("\n");

        return {
          content: [
            {
              type: "text",
              text: formattedLogs || "No matching logs found.",
            },
          ],
        };
      } catch (error: any) {
        log.error(`Error retrieving Expo logs: ${error.message}`);
        throw new Error(`Failed to retrieve Expo logs: ${error.message}`);
      }
    },
  });

  // Define the expoStop tool
  server.addTool({
    name: "expoStop",
    description: "Stop the running Expo development server",
    parameters: z.object({}),
    execute: async (_, { log }) => {
      try {
        if (!global.processes || !global.processes.expo) {
          return {
            content: [
              {
                type: "text",
                text: "No Expo server is currently running.",
              },
            ],
          };
        }

        const isRunning = global.processes.expo.isRunning();

        if (!isRunning) {
          return {
            content: [
              {
                type: "text",
                text: "Expo server is not running.",
              },
            ],
          };
        }

        log.info("Stopping Expo server...");
        await global.processes.expo.stop();

        return {
          content: [
            {
              type: "text",
              text: "Successfully stopped Expo development server.",
            },
          ],
        };
      } catch (error: any) {
        log.error(`Error stopping Expo server: ${error.message}`);
        throw new Error(`Failed to stop Expo server: ${error.message}`);
      }
    },
  });

  // Define the expoStatus tool
  server.addTool({
    name: "expoStatus",
    description: "Check if an Expo server is running and get its status",
    parameters: z.object({}),
    execute: async (_, { log }) => {
      try {
        if (!global.processes || !global.processes.expo) {
          return {
            content: [
              {
                type: "text",
                text: "No Expo server has been started.",
              },
            ],
          };
        }

        const isRunning = global.processes.expo.isRunning();
        const pid = global.processes.expo.getPid();

        // Count logs by type
        const stdoutCount = global.expoLogs
          ? global.expoLogs.filter((log) => log.type === "stdout").length
          : 0;
        const stderrCount = global.expoLogs
          ? global.expoLogs.filter((log) => log.type === "stderr").length
          : 0;

        return {
          content: [
            {
              type: "text",
              text: `Expo Status:
- Running: ${isRunning ? "Yes" : "No"}
- Process ID: ${pid || "N/A"}
- Log entries: ${global.expoLogs?.length || 0} (${stdoutCount} stdout, ${stderrCount} stderr)`,
            },
          ],
        };
      } catch (error: any) {
        log.error(`Error checking Expo status: ${error.message}`);
        throw new Error(`Failed to check Expo status: ${error.message}`);
      }
    },
  });
}

/**
 * Set up shutdown handlers to clean up processes when the MCP server exits
 */
export function setupShutdownHandlers() {
  const handleShutdown = async () => {
    if (global.processes) {
      // Using console.error for critical shutdown messages
      console.error(
        "Shutting down MCP server, stopping all managed processes...",
      );

      for (const processKey in global.processes) {
        if (
          global.processes[processKey] &&
          global.processes[processKey].isRunning()
        ) {
          try {
            await global.processes[processKey].stop();
            console.error(`Stopped ${processKey} process.`);
          } catch (error) {
            console.error(`Error stopping ${processKey} process:`, error);
          }
        }
      }
    }
  };

  // Register shutdown handlers
  process.on("SIGINT", handleShutdown);
  process.on("SIGTERM", handleShutdown);
  process.on("exit", handleShutdown);
}