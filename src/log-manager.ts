import * as fs from "fs/promises";
import * as path from "path";
import { FastMCP } from "fastmcp";
import { z } from "zod";

/**
 * Interface for log entry
 */
interface LogEntry {
  type: "stdout" | "stderr";
  data: string;
  timestamp: string;
}

/**
 * Log Manager class for enhanced log handling
 */
export class LogManager {
  private logs: LogEntry[] = [];
  private maxLogEntries: number;
  private logFilePath?: string;
  private logFileEnabled: boolean = false;

  /**
   * Create a new LogManager instance
   * @param options Configuration options
   */
  constructor(options: {
    maxLogEntries?: number;
    logFilePath?: string;
  } = {}) {
    this.maxLogEntries = options.maxLogEntries || 1000;
    
    if (options.logFilePath) {
      this.logFilePath = options.logFilePath;
      this.logFileEnabled = true;
    }
  }

  /**
   * Add a log entry
   * @param type Type of log (stdout or stderr) 
   * @param data Log message
   */
  public async addLog(type: "stdout" | "stderr", data: string): Promise<void> {
    const entry: LogEntry = {
      type,
      data,
      timestamp: new Date().toISOString()
    };

    // Add to in-memory logs
    this.logs.push(entry);
    
    // Cap the log size
    if (this.logs.length > this.maxLogEntries) {
      this.logs.shift();
    }

    // Write to log file if enabled
    if (this.logFileEnabled && this.logFilePath) {
      try {
        // Ensure directory exists
        const logDir = path.dirname(this.logFilePath);
        await fs.mkdir(logDir, { recursive: true }).catch(() => {});
        
        // Append log entry to file
        const logLine = `[${entry.timestamp}] [${entry.type}] ${entry.data}\n`;
        await fs.appendFile(this.logFilePath, logLine, 'utf8');
      } catch (error) {
        console.error("Failed to write to log file:", error);
      }
    }
  }

  /**
   * Get log entries based on filter criteria
   * @param options Filter options
   */
  public getLogs(options: {
    type?: "stdout" | "stderr" | "all";
    count?: number;
    filter?: string;
    after?: string; // timestamp to filter logs after
  } = {}): LogEntry[] {
    let filteredLogs = this.logs;
    
    // Filter by type
    if (options.type && options.type !== "all") {
      filteredLogs = filteredLogs.filter(log => log.type === options.type);
    }
    
    // Filter by timestamp - Fix for undefined error
    if (options.after) {
      filteredLogs = filteredLogs.filter(log => {
        // Only compare if after is defined and not empty
        return options.after ? log.timestamp > options.after : true;
      });
    }
    
    // Filter by content
    if (options.filter) {
      const filterLower = options.filter.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.data.toLowerCase().includes(filterLower)
      );
    }
    
    // Get the last N logs
    if (options.count) {
      filteredLogs = filteredLogs.slice(-options.count);
    }
    
    return filteredLogs;
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get log statistics
   */
  public getStats(): {
    totalEntries: number;
    stdoutCount: number;
    stderrCount: number;
    oldestLogTimestamp: string | null;
    newestLogTimestamp: string | null;
  } {
    const stdoutCount = this.logs.filter(log => log.type === "stdout").length;
    const stderrCount = this.logs.filter(log => log.type === "stderr").length;
    
    return {
      totalEntries: this.logs.length,
      stdoutCount,
      stderrCount,
      oldestLogTimestamp: this.logs.length > 0 ? this.logs[0].timestamp : null,
      newestLogTimestamp: this.logs.length > 0 ? this.logs[this.logs.length - 1].timestamp : null
    };
  }
}

/**
 * Add enhanced log management tools to an existing FastMCP server
 * @param server The FastMCP server instance
 * @param logManager The LogManager instance
 */
export function addLogTools(server: FastMCP, logManager: LogManager) {
  // Define the getLogs tool with enhanced filtering
  server.addTool({
    name: "expoGetLogs",
    description: "Get filtered logs from the Expo server with advanced options",
    parameters: z.object({
      count: z.number().optional().default(50).describe("Number of log entries to retrieve"),
      type: z.enum(["all", "stdout", "stderr"]).optional().default("all").describe("Type of logs to retrieve"),
      filter: z.string().optional().describe("Filter logs containing this text"),
      after: z.string().optional().describe("Get logs after this timestamp (ISO format)"),
      format: z.enum(["text", "json"]).optional().default("text").describe("Output format")
    }),
    execute: async (args, { log }) => {
      try {
        log.info("Retrieving filtered logs", { 
          count: args.count, 
          type: args.type,
          filter: args.filter || "none",
          after: args.after || "none"
        });
        
        // Get filtered logs
        const logs = logManager.getLogs({
          type: args.type as "stdout" | "stderr" | "all",
          count: args.count,
          filter: args.filter,
          after: args.after
        });
        
        log.info(`Found ${logs.length} matching log entries`);
        
        if (logs.length === 0) {
          return {
            content: [
              { 
                type: "text", 
                text: "No matching logs found."
              }
            ]
          };
        }
        
        // Format based on user preference
        if (args.format === "json") {
          return {
            content: [
              { 
                type: "text", 
                text: JSON.stringify(logs, null, 2) 
              }
            ]
          };
        } else {
          // Format as text
          const formattedLogs = logs.map(entry => 
            `[${entry.timestamp}] [${entry.type}] ${entry.data}`
          ).join("\n");
          
          return {
            content: [
              { 
                type: "text", 
                text: formattedLogs
              }
            ]
          };
        }
      } catch (error: any) {
        log.error(`Error retrieving logs: ${error.message}`);
        throw new Error(`Failed to retrieve logs: ${error.message}`);
      }
    },
  });
  
  // Define a tool to get log statistics
  server.addTool({
    name: "expoLogStats",
    description: "Get statistics about the expo logs",
    parameters: z.object({}),
    execute: async (_, { log }) => {
      try {
        log.info("Retrieving log statistics");
        const stats = logManager.getStats();
        
        log.info(`Log statistics retrieved: ${stats.totalEntries} total entries`);
        
        return {
          content: [
            { 
              type: "text", 
              text: `Log Statistics:
- Total entries: ${stats.totalEntries}
- Standard output entries: ${stats.stdoutCount}
- Standard error entries: ${stats.stderrCount}
- Oldest log: ${stats.oldestLogTimestamp || "N/A"}
- Newest log: ${stats.newestLogTimestamp || "N/A"}`
            }
          ]
        };
      } catch (error: any) {
        log.error(`Error retrieving log statistics: ${error.message}`);
        throw new Error(`Failed to retrieve log statistics: ${error.message}`);
      }
    },
  });
  
  // Define a tool to clear logs
  server.addTool({
    name: "expoClearLogs",
    description: "Clear all stored logs",
    parameters: z.object({}),
    execute: async (_, { log }) => {
      try {
        log.info("Clearing all logs");
        logManager.clearLogs();
        log.info("All logs successfully cleared");
        
        return {
          content: [
            { 
              type: "text", 
              text: "Successfully cleared all logs."
            }
          ]
        };
      } catch (error: any) {
        log.error(`Error clearing logs: ${error.message}`);
        throw new Error(`Failed to clear logs: ${error.message}`);
      }
    },
  });
}