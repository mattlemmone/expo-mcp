// Updated for ES modules compatibility
import { spawn } from "child_process";
import { EventEmitter } from "events";
/**
 * ProcessManager class for spawning and managing child processes
 */
export class ProcessManager extends EventEmitter {
    /**
     * Create a new ProcessManager instance
     * @param options ProcessManager options
     */
    constructor(options) {
        super();
        this.process = null;
        this.isKilling = false;
        this.options = options;
        // Ensure parent process kill also kills child
        process.on("exit", this.handleProcessExit.bind(this));
        // Handle other termination signals
        process.on("SIGINT", this.handleProcessExit.bind(this));
        process.on("SIGTERM", this.handleProcessExit.bind(this));
        process.on("SIGHUP", this.handleProcessExit.bind(this));
    }
    /**
     * Start the child process
     * @returns Promise that resolves when the process is started
     */
    start() {
        return new Promise((resolve, reject) => {
            try {
                const { command, args = [], cwd, projectPath, env } = this.options;
                // Determine the working directory
                const workingDirectory = projectPath || cwd || process.cwd();
                // Spawn the child process
                this.process = spawn(command, args, {
                    cwd: workingDirectory,
                    env: { ...process.env, ...env },
                    stdio: ["pipe", "pipe", "pipe"],
                    shell: true,
                    windowsHide: true,
                });
                const { process: childProcess } = this;
                // Handle standard output
                if (childProcess.stdout) {
                    childProcess.stdout.on("data", (data) => {
                        const strData = data.toString().trim();
                        this.emit("stdout", strData);
                        if (this.options.onStdout) {
                            this.options.onStdout(strData);
                        }
                    });
                }
                // Handle error output
                if (childProcess.stderr) {
                    childProcess.stderr.on("data", (data) => {
                        const strData = data.toString().trim();
                        this.emit("stderr", strData);
                        if (this.options.onStderr) {
                            this.options.onStderr(strData);
                        }
                    });
                }
                // Handle process error
                childProcess.on("error", (error) => {
                    this.emit("error", error);
                    if (this.options.onError) {
                        this.options.onError(error);
                    }
                    reject(error);
                });
                // Handle process exit
                childProcess.on("exit", (code, signal) => {
                    this.emit("exit", code, signal);
                    if (this.options.onExit) {
                        this.options.onExit(code, signal);
                    }
                    this.process = null;
                });
                // Process started successfully
                this.emit("start", childProcess.pid);
                resolve();
            }
            catch (error) {
                this.emit("error", error);
                if (this.options.onError) {
                    this.options.onError(error);
                }
                reject(error);
            }
        });
    }
    /**
     * Stop the child process
     * @param signal Signal to send to the child process
     * @returns Promise that resolves when the process is stopped
     */
    stop(signal = "SIGTERM") {
        return new Promise((resolve) => {
            if (!this.process) {
                resolve();
                return;
            }
            this.isKilling = true;
            // Set up exit handler to resolve the promise
            const exitHandler = () => {
                this.process = null;
                this.isKilling = false;
                resolve();
            };
            // If process is already exited, resolve immediately
            if (!this.process.pid) {
                exitHandler();
                return;
            }
            // Set up one-time exit listener
            this.process.once("exit", exitHandler);
            // Send kill signal
            this.process.kill(signal);
        });
    }
    /**
     * Check if the process is running
     * @returns boolean indicating if the process is running
     */
    isRunning() {
        return this.process !== null && !this.isKilling;
    }
    /**
     * Get the process ID
     * @returns The process ID or null if not running
     */
    getPid() {
        return this.process?.pid ?? null;
    }
    /**
     * Handle parent process exit
     */
    handleProcessExit() {
        if (this.process) {
            // No need for promises here as we're shutting down
            this.process.kill("SIGKILL");
            this.process = null;
        }
    }
}
/**
 * Helper function to create and start a process
 * @param options ProcessManager options
 * @returns ProcessManager instance
 */
export async function createProcess(options) {
    const manager = new ProcessManager(options);
    await manager.start();
    return manager;
}
//# sourceMappingURL=process.js.map