import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const toToolResponse = (
  output: {
    [key: string]: any;
  },
  isError = false
): CallToolResult => {
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
