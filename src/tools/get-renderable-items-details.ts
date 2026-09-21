import type { InferSchema, ToolMetadata } from "xmcp";
import { z } from "zod";
import { getSdk } from "../lib/sdk";
import { toToolResponse } from "../utils/toolResponse";

export const schema = {
  renderableItemId: z.string().describe("Identifier of the parent item to inspect (projectId or designId)."),
  isDesign: z.boolean().describe("True if the parent item is a Design; false if it is a Project."),
};

export const outputSchema = {
  itemDetails: z
    .array(
      z.object({
        isDesign: z.boolean().describe("True when the parent is a Design; false when it is a Project."),
        projectDesignId: z.string().describe("Parent identifier echoed back (projectId or designId)."),
        templateVariantId: z.string().describe("Template/variant identifier (the renderable leaf under the parent)."),
        exampleVideoUrl: z
          .string()
          .url()
          .optional()
          .describe("Public preview video URL (usually MP4) if available for this template/variant."),

        parameters: z
          .array(
            z.object({
              key: z
                .string()
                .describe(
                  "Parameter key used by the render API. If description/label is missing, use this as the final hint to infer purpose.",
                ),
              mandatory: z.boolean().describe("Whether the parameter must be provided to render successfully."),
              type: z
                .enum(["STRING", "MEDIA", "MEDIA (image)", "MEDIA (audio)", "MEDIA (video)", "COLOR"])
                .describe(
                  "Expected data type. Respect specific media subtypes (image/audio/video) when supplying values.",
                ),
              description: z
                .string()
                .nullable()
                .describe("Human-readable explanation of the parameter's purpose, if available."),
              label: z
                .string()
                .nullable()
                .describe("UI label for the parameter, used when description is missing or brief."),
              defaultValue: z
                .any()
                .nullable()
                .optional()
                .describe("Default value to use if none is provided. May be null or missing."),
            }),
          )
          .describe(
            "Parameters required by this template/variant. Provide all parameters marked mandatory; others are optional.",
          ),
      }),
    )
    .describe("One entry per template/variant under the requested parent, with the parameters needed to render each."),
};

export const metadata: ToolMetadata = {
  name: "get_renderable_items_details",
  description: `
Return the renderable templates/variants under a specific Project or Design, including the parameters required to render each.

How to use:
- Call this after the user selects a candidate from \`list_renderable_items\`.
- For each returned template/variant:
  1) Read its parameters.
  2) Collect values for all parameters marked mandatory.
  3) Respect the declared type (e.g., MEDIA (image) vs MEDIA (video)).

Guidance:
- Prefer \`description\` to understand the intent of each parameter; fall back to \`label\`, then \`key\` if needed.
- If any mandatory parameter is missing or unclear, ask the user to provide it—do not guess.
- If the parent has multiple templates/variants, choose the one that best matches the user's stated goals and constraints; otherwise present the options.

Use when:
- The user wants details/parameters for a chosen template/variant.
- Immediately before preparing values and calling render_item.

Follow-ups:
- \`render_item\` — submit a render for the chosen template/variant with the collected parameter values.
`,
  annotations: {
    title: "Get Renderable Item Details",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getRenderableItemsDetails({ renderableItemId, isDesign }: InferSchema<typeof schema>) {
  const itemDetails = await getSdk().getRenderableItemsDetails(renderableItemId, isDesign);

  return toToolResponse({ itemDetails });
}
