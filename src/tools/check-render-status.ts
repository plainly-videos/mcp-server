import type { InferSchema, ToolMetadata } from "xmcp";
import { z } from "zod";
import env from "../env";
import { getSdk } from "../lib/sdk";
import { toToolResponse } from "../utils/toolResponse";

export const schema = {
  renderId: z.string().describe("The render ID returned from the `render_item` tool."),
};

export const outputSchema = {
  // Render information
  message: z.string().describe("A message describing the render status."),
  renderId: z.string().describe("The render job ID."),
  renderDetailsPageUrl: z.string().optional().describe("URL to the render details page."),
  projectDesignId: z.string().optional().describe("Parent identifier (projectId or designId)."),
  templateVariantId: z
    .string()
    .optional()
    .describe("Template/variant identifier (the renderable leaf under the parent)."),
  projectDesignName: z.string().optional().describe("Name of the project or design."),
  templateVariantName: z.string().optional().describe("Name of the template or variant."),
  state: z
    .enum(["PENDING", "THROTTLED", "QUEUED", "IN_PROGRESS", "DONE", "FAILED", "INVALID", "CANCELLED"])
    .optional()
    .describe("The current state of the render job."),

  // Success output
  output: z.string().optional().describe("The render output URL (only available when state is DONE)."),

  // Error information
  errorMessage: z.string().optional().describe("Error message, if any."),
  errorDetails: z.string().optional().describe("Error details, if any."),
};

export const metadata: ToolMetadata = {
  name: "check_render_status",
  description: `
Check the status of a render job.

Available states:
- PENDING: The render job has been created but not yet added to the queue.
- THROTTLED: The render job is waiting due to rate limiting. It will be started as soon as a slot opens, no need for manual retries.
- QUEUED: The render job is in the queue and will start soon.
- IN_PROGRESS: The render job is currently being processed.
- DONE: The render job has completed successfully. The output URL will be provided.
- FAILED: The render job encountered an error and did not complete successfully. Error details will be provided.
- INVALID: The render job was invalid (e.g., due to incorrect parameters). Error details will be provided.
- CANCELLED: The render job was cancelled by the user.

Response format:
- Always include a link to the render details page.
- If the render is still in progress (PENDING, THROTTLED, QUEUED, IN_PROGRESS) tell user to check the status again later.
- If the render is DONE, return the output URL and the render page details.
- If the render FAILED or is INVALID, return the error message and details.

Use when:
- You need to check the progress of a render job
- You want to retrieve the final render output URL
- You want to retrieve render error details if the job failed
      `,
  annotations: {
    title: "Check Render Status",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
};

export default async function checkRenderStatus({ renderId }: InferSchema<typeof schema>) {
  try {
    const render = await getSdk().getRenderItem(renderId);

    const common = {
      renderId: render.id,
      renderDetailsPageUrl: `${env.PLAINLY_APP_URL}/dashboard/renders/${render.id}`,
      projectDesignId: render.projectId,
      templateVariantId: render.templateId,
      projectDesignName: render.projectName,
      templateVariantName: render.templateName,
      state: render.state,
    };

    // Handle successful completion
    if (render.state === "DONE") {
      return toToolResponse({
        message: "Render completed successfully.",
        ...common,
        output: render.output,
      });
    }

    if (render.state === "CANCELLED") {
      return toToolResponse({
        message: "Render was cancelled.",
        ...common,
      });
    }

    // Handle error states
    if (render.state === "FAILED" || render.state === "INVALID") {
      return toToolResponse(
        {
          message: "Render failed.",
          ...common,
          errorMessage: render.error.message,
          errorDetails: JSON.stringify(render.error.details),
        },
        true,
      );
    }

    // Processing
    return toToolResponse({
      message: "Render is processing. Please wait and check back later.",
      ...common,
    });
  } catch (err: unknown) {
    return toToolResponse(
      {
        message: "Render status could not be retrieved.",
        renderId,
        renderDetailsPageUrl: `${env.PLAINLY_APP_URL}/dashboard/renders/${renderId}`,
        errorMessage: err instanceof Error ? err.message : "Failed to check render status",
      },
      true,
    );
  }
}
