import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getRenderItem } from "../sdk";
import { PLAINLY_APP_URL } from "../constants";

export function registerCheckRenderStatus(server: McpServer) {
  const Input = {
    renderId: z
      .string()
      .describe("The render ID returned from the `render_item` tool."),
  };

  const Output = {
    // Status information
    message: z
      .string()
      .describe("A human-readable message for the render status."),
    renderId: z.string().describe("The render job ID."),
    renderDetailsPageUrl: z
      .string()
      .optional()
      .describe("URL to the render details page."),
    state: z
      .enum([
        "PENDING",
        "THROTTLED",
        "QUEUED",
        "IN_PROGRESS",
        "DONE",
        "FAILED",
        "INVALID",
        "CANCELLED",
      ])
      .describe("The current state of the render job."),
    projectName: z
      .string()
      .optional()
      .describe("Name of the project or design."),
    templateName: z
      .string()
      .optional()
      .describe("Name of the template or variant."),

    // Success output
    output: z
      .string()
      .optional()
      .describe("The render output URL (only available when state is DONE)."),

    // Error information
    errorMessage: z.string().optional().describe("Error message, if any."),
    errorSolution: z.string().optional().describe("Error solution, if any."),
    errorDetails: z.any().optional().describe("Error details, if any."),
  };

  server.registerTool(
    "check_render_status",
    {
      title: "Check Render Status",
      description: `
Check the status of a render job and optionally wait for completion.

Use when:
- You need to check the progress of a render job
- You want to retrieve the final render output URL
- You want to retrieve render error details if the job failed
      `,
      inputSchema: Input,
      outputSchema: Output,
    },
    async ({ renderId }) => {
      try {
        const render = await getRenderItem(renderId);

        // Handle successful completion
        if (render.state === "DONE") {
          return {
            content: [],
            structuredContent: {
              message: "Render completed successfully.",
              renderId: render.id,
              renderDetailsPageUrl: `${PLAINLY_APP_URL}/dashboard/renders/${render.id}`,
              state: render.state,
              projectName: render.projectName,
              templateName: render.templateName,
              output: render.output,
            },
          };
        }

        if (render.state === "CANCELLED") {
          return {
            content: [],
            structuredContent: {
              message: "Render was cancelled.",
              renderId: render.id,
              state: render.state,
              projectName: render.projectName,
              templateName: render.templateName,
            },
          };
        }

        // Handle error states
        if (render.state === "FAILED" || render.state === "INVALID") {
          return {
            content: [],
            structuredContent: {
              message: "Render failed.",
              renderId: render.id,
              state: render.state,
              projectName: render.projectName,
              templateName: render.templateName,
              errorMessage: render.error.message,
              errorDetails: JSON.stringify(render.error.details),
            },
            isError: true,
          };
        }

        return {
          content: [],
          structuredContent: {
            message: "Render failed.",
            renderId: render.id,
            state: render.state,
            projectName: render.projectName,
            templateName: render.templateName,
          },
        };
      } catch (err: any) {
        return {
          content: [],
          structuredContent: {
            message: "Render status could not be retrieved.",
            renderId,
            errorMessage: err.message || "Failed to check render status",
            errorDetails: err,
          },
          isError: true,
        };
      }
    }
  );
}
