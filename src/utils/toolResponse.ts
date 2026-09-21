import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const toToolResponse = (output: { [key: string]: unknown }, isError = false): CallToolResult => {
  try {
    const outputString = JSON.stringify(output);
    return {
      content: [
        {
          type: "text",
          text: outputString,
        },
      ],
      structuredContent: output,
      isError,
    };
  } catch {
    return {
      content: [],
      structuredContent: output,
      isError,
    };
  }
};

/**
 * Reduces an unknown thrown value to the string fields the tool output schemas
 * declare. Stack traces are deliberately dropped: they leak local filesystem
 * paths and bundle offsets, and give the model nothing it can act on.
 */
export const normalizeError = (err: unknown): { message: string; details?: string } => {
  if (err instanceof Error) {
    return { message: err.message };
  }

  return {
    message: "An unknown error occurred",
    details: typeof err === "string" ? err : JSON.stringify(err),
  };
};
