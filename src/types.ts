import { z } from "zod";

/**
 * Type definition for the addTool function that tools modules will use
 */
export type AddToolFunction = <T extends z.ZodType>(tool: {
  name: string;
  description: string;
  parameters: T;
  execute: (
    args: z.infer<T>,
    context: { log: { info: (message: string) => void; error: (message: string) => void } }
  ) => Promise<{
    content: Array<{ type: string; text: string }>;
  }>;
}) => void;
