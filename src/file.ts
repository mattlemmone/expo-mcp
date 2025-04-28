import fs from "fs";
import * as path from "path";
import { createReadStream } from "fs";

type LogContext = { log: { info: (message: string) => void; error: (message: string) => void } };

/**
 * Read the contents of a file
 */
export async function readFile(args: { filePath: string }, { log }: LogContext) {
  try {
    log.info(`Reading file at path: ${args.filePath}`);

    const normalizedPath = path.normalize(args.filePath);
    const fileContent = await fs.promises.readFile(normalizedPath, "utf8");

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
}

/**
 * Write content to a file
 */
export async function writeFile(args: { filePath: string; content: string }, { log }: LogContext) {
  try {
    log.info(`Writing to file at path: ${args.filePath}`);

    const normalizedPath = path.normalize(args.filePath);
    const directory = path.dirname(normalizedPath);
    await fs.promises.mkdir(directory, { recursive: true });
    await fs.promises.writeFile(normalizedPath, args.content);

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
}

/**
 * List files in a directory
 */
export async function listFiles(args: { directoryPath: string }, { log }: LogContext) {
  try {
    log.info(`Listing files in directory: ${args.directoryPath}`);

    const normalizedPath = path.normalize(args.directoryPath);
    const files = await fs.promises.readdir(normalizedPath, { withFileTypes: true });

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
}

/**
 * Tail a file - read the last N lines of a file
 */
export async function tailFile(args: { filePath: string; lines: number }, { log }: LogContext) {
  try {
    log.info(`Tailing file at path: ${args.filePath} (${args.lines} lines)`);

    const normalizedPath = path.normalize(args.filePath);
    
    // Read the entire file content
    const fileContent = await fs.promises.readFile(normalizedPath, "utf8");
    
    // Split by newlines and get the last N lines
    const allLines = fileContent.split('\n');
    const lastLines = allLines.slice(-args.lines).join('\n');

    log.info(`Successfully tailed ${args.lines} lines from file: ${normalizedPath}`);

    return {
      content: [
        {
          type: "text",
          text: lastLines,
        },
      ],
    };
  } catch (error: any) {
    log.error(`Error tailing file: ${error.message}`);
    throw new Error(`Failed to tail file: ${error.message}`);
  }
}
