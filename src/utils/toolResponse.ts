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

export const normalizeError = (err: unknown): { message: string; details?: unknown } => {
  if (err instanceof Error) {
    return {
      message: err.message,
      details: err.stack ?? err,
    };
  }

  return {
    message: "An unknown error occurred",
    details: err,
  };
};
