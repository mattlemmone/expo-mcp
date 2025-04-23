#!/usr/bin/env node
import { createProcess } from "./process-manager";
import { resolve } from "path";
import * as readline from "readline";
// Setup readline interface for interactive CLI
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
// ANSI color codes for better CLI output
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
};
// Print colored message
function print(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}
// Print help message
function printHelp() {
    print("cyan", "\n=== Process Manager CLI ===");
    print("bright", "\nUsage: node cli.js <command> [args...] [options]");
    print("bright", "\nOptions:");
    print("yellow", "  --path, -p <path>   Project path (default: current directory)");
    print("yellow", "  --help, -h          Show this help message");
    print("bright", "\nExample:");
    print("green", "  node cli.js expo start -p ./my-expo-project");
    print("green", "  node cli.js npm run dev");
    print("green", '  node cli.js "ls -la"\n');
}
// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
        printHelp();
        process.exit(0);
    }
    let projectPath = process.cwd();
    let commandArgs = [];
    let mainCommand = "";
    // Extract project path
    const pathIndex = args.findIndex((arg) => arg === "--path" || arg === "-p");
    if (pathIndex !== -1 && pathIndex < args.length - 1) {
        projectPath = resolve(args[pathIndex + 1]);
        // Remove path arguments
        args.splice(pathIndex, 2);
    }
    // If first argument contains spaces, treat the entire string as a command
    if (args[0] && args[0].includes(" ")) {
        mainCommand = args[0].split(" ")[0];
        commandArgs = args[0].split(" ").slice(1);
    }
    else {
        mainCommand = args[0] || "";
        commandArgs = args.slice(1);
    }
    return {
        command: mainCommand,
        args: commandArgs,
        projectPath,
    };
}
// Run the process manager
async function runProcess() {
    const { command, args, projectPath } = parseArgs();
    if (!command) {
        print("red", "Error: No command specified");
        printHelp();
        process.exit(1);
    }
    print("cyan", `Starting process: ${command} ${args.join(" ")}`);
    print("yellow", `Working directory: ${projectPath}`);
    let processManager = null;
    try {
        processManager = await createProcess({
            command,
            args,
            projectPath,
            onStdout: (data) => print("green", `[stdout] ${data}`),
            onStderr: (data) => print("red", `[stderr] ${data}`),
            onError: (error) => print("red", `[error] ${error.message}`),
            onExit: (code, signal) => {
                print("cyan", `\nProcess exited with code ${code} and signal ${signal || "none"}`);
                rl.close();
                process.exit(0);
            },
        });
        print("magenta", "\n=== Process started successfully ===");
        print("bright", "Press Ctrl+C to stop the process");
        print("yellow", 'Type "exit" to stop the process gracefully');
        // Listen for user input
        rl.on("line", (input) => {
            if (input.trim().toLowerCase() === "exit") {
                print("cyan", "Stopping process gracefully...");
                processManager?.stop().then(() => {
                    rl.close();
                    process.exit(0);
                });
            }
        });
    }
    catch (error) {
        print("red", `Failed to start process: ${error.message}`);
        rl.close();
        process.exit(1);
    }
}
// Run the CLI
runProcess().catch((error) => {
    print("red", `Unhandled error: ${error.message}`);
    process.exit(1);
});
//# sourceMappingURL=process_cli.js.map