import type { InferSchema, ToolMetadata } from "xmcp";
import { z } from "zod";
import env from "../env";
import {
  GeneralRenderError,
  InvalidRenderError,
  MissingParametersError,
  PlainlyMcpServerError,
  ProjectDesignNotFoundError,
  TemplateVariantNotFoundError,
} from "../lib/errors";
import { getSdk } from "../lib/sdk";
import type { PlainlySdk, RenderableItemDetails } from "../sdk";
import { normalizeError, toToolResponse } from "../utils/toolResponse";

export const schema = {
  isDesign: z.boolean().describe("True when the parent is a Design; false when it is a Project."),
  projectDesignId: z.string().describe("Parent identifier (projectId or designId)."),
  templateVariantId: z.string().describe("Template/variant identifier (the renderable leaf under the parent)."),
  parameters: z
    .record(z.string(), z.any())
    .describe(
      "Key-value parameters required by the chosen template/variant to customize the render. Mandatory parameters must be provided. Parameter type must be respected.",
    ),
};

export const outputSchema = {
  // Successful response
  renderId: z.string().optional().describe("Server-assigned render job ID."),
  renderDetailsPageUrl: z.string().optional().describe("URL to the render details page."),
  projectDesignId: z.string().optional().describe("Parent identifier (projectId or designId)."),
  templateVariantId: z
    .string()
    .optional()
    .describe("Template/variant identifier (the renderable leaf under the parent)."),
  projectDesignName: z.string().optional().describe("Name of the project or design."),
  templateVariantName: z.string().optional().describe("Name of the template or variant."),
  // Failure response
  message: z.string().optional().describe("Message describing the failure, if any."),
  solution: z.string().optional().describe("Suggested resolution for the failure, if any."),
  details: z.string().optional().describe("Error details, if any."),
};

export const metadata: ToolMetadata = {
  name: "render_item",
  description: `
Create a render for a selected Project template or Design variant with specified parameters.

How to use:
- Call this after the user selects a candidate from \`get_renderable_items_details\`.
- Call this only once the user approved all parameters for the chosen template/variant.

Guidance:
- Never submit more than one render with the same parameters, unless the user explicitly requests it.
- Template parameters must be nested under the top-level \`parameters\` object (do not place them at the top level).
- Use parameters to customize the render.
- All mandatory parameters must be provided.
- Provide values for optional parameters if it makes sense.
- Parameter types must be respected:
      - STRING: text string relevant to the parameter context.
      - MEDIA: URL to a media file (image, audio, or video). Ensure the URL is publicly accessible and points directly to the media file.
      - MEDIA (image): URL to an image file (jpg, png, etc.).
      - MEDIA (audio): URL to an audio file (mp3, wav, etc.).
      - MEDIA (video): URL to a video file (mp4, mov, etc.).
      - COLOR: hex color code (e.g. FF5733).
- If a parameter has a default value and the user does not provide a value, the default will be used.
- If the user is unsure about a parameter, ask for clarification rather than guessing.
- When referencing parameters in conversation, use their \`label\` or \`description\` for clarity.
Example:
- Input shape: { isDesign, projectDesignId, templateVariantId, parameters: { title: "My Title", image: "https://..." } }

Use when:
- The user wants to create a video from a specific template/variant with defined parameters.
      `,
  annotations: {
    title: "Render Item",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
};

export default async function renderItem({
  isDesign,
  projectDesignId,
  templateVariantId,
  parameters,
}: InferSchema<typeof schema>) {
  // TODO: Handle object parameters "my.parameter.x"

  try {
    const sdk = getSdk();

    const projectDesignItems = await validateProjectDesignExists(sdk, isDesign, projectDesignId);

    const renderableItem = validateTemplateVariantExists(projectDesignItems, templateVariantId);

    validateTemplateVariantParameters(renderableItem, parameters);

    // If everything looks good, submit the render
    const render = await sdk.renderItem({
      isDesign,
      projectDesignId,
      templateVariantId,
      parameters,
    });

    // Check for API-level errors
    if (render.error) {
      // Specific handling for invalid renders
      if (render.state === "INVALID") {
        const invalidParams: { key?: string; errors: string[] }[] = [];

        render.parametrizationResults
          .filter((r) => r.mandatoryNotResolved || r.fatalError)
          .forEach((r) => {
            invalidParams.push({
              key: r.parametrization?.value,
              errors: r.errorMessages ?? [],
            });
          });

        throw new InvalidRenderError(`${render.error.message || ""}`, invalidParams);
      }

      // General error
      throw new GeneralRenderError(`${render.error.message || ""}`, render.error);
    }

    // Successful submission
    return toToolResponse({
      renderId: render.id,
      renderDetailsPageUrl: `${env.PLAINLY_APP_URL}/dashboard/renders/${render.id}`,
      projectDesignId: render.projectId,
      templateVariantId: render.templateId,
      projectDesignName: render.projectName,
      templateVariantName: render.templateName,
    });
  } catch (err: unknown) {
    // Known errors with specific handling
    if (err instanceof PlainlyMcpServerError) {
      return toToolResponse(
        {
          message: err.message,
          solution: err.solution,
          details: err.details,
        },
        true,
      );
    }

    // All other errors
    return toToolResponse(normalizeError(err), true);
  }
}

const validateProjectDesignExists = async (
  sdk: PlainlySdk,
  isDesign: boolean,
  projectDesignId: string,
): Promise<RenderableItemDetails[]> => {
  const projectDesignItems = await sdk.getRenderableItemsDetails(projectDesignId, isDesign);

  if (projectDesignItems.length === 0) {
    throw new ProjectDesignNotFoundError(projectDesignId);
  }

  return projectDesignItems;
};

const validateTemplateVariantExists = (
  projectDesignItems: RenderableItemDetails[],
  templateVariantId: string,
): RenderableItemDetails => {
  const renderableItem = projectDesignItems.find((item) => item.templateVariantId === templateVariantId);

  if (!renderableItem) {
    throw new TemplateVariantNotFoundError(templateVariantId, projectDesignItems[0].projectDesignId);
  }

  return renderableItem;
};

const validateTemplateVariantParameters = (
  renderableItem: RenderableItemDetails,
  parameters: Record<string, unknown>,
): void => {
  const mandatoryParams = renderableItem.parameters.filter((p) => p.mandatory);
  const providedParams = Object.keys(parameters);
  const missingParams = mandatoryParams.filter((p) => !providedParams.includes(p.key));

  if (missingParams.length > 0) {
    throw new MissingParametersError(missingParams.map((p) => ({ key: p.key, label: p.label })));
  }
};
