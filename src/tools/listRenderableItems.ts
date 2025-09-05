import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listRenderableItems } from "../sdk";

export function registerListRenderableItems(server: McpServer) {
  const Input = {
    excludeDesigns: z
      .boolean()
      .optional()
      .describe("If true, exclude designs from the results."),
    excludeProjects: z
      .boolean()
      .optional()
      .describe("If true, exclude projects from the results."),
  };
  const Output = {
    items: z.array(
      z.object({
        isDesign: z
          .boolean()
          .describe("True if source is a Design; false if a Project."),
        id: z.string().describe("Project/design id (projectId or designId)."),
        name: z.string().describe("Project/design display name."),
        description: z
          .string()
          .nullable()
          .describe("Short description of the project/design."),
        metadata: z.object({
          category: z.string().nullable().describe("Design category (if any)."),
          attributes: z
            .record(z.any())
            .nullable()
            .describe("Additional tags/props; may be empty."),
        }),
        templates: z
          .array(
            z.object({
              id: z.string().describe("Template/variant id (renderable leaf)."),
              name: z.string().describe("Template/variant display name."),
              aspectRatio: z.string().describe("e.g., '16:9', '1:1', etc."),
              durationSeconds: z.number().describe("Duration in seconds."),
            })
          )
          .describe("Lightweight preview of renderable leaf options."),
      })
    ),
  };

  server.registerTool(
    "list_renderable_items",
    {
      title: "List Renderable Items",
      description: `
Return all projects and design templates the authenticated user can render. Each item includes a lightweight preview of its templates or variants with name, aspect ratio, duration, description, and metadata (tags, category, attributes).

Inputs:
- excludeDesigns (boolean, optional): If true, exclude designs from the results.
- excludeProjects (boolean, optional): If true, exclude projects from the results.

Filtering guidance:
- Use metadata.tags, metadata.category, metadata.attributes, and description to find templates relevant to the user's request (e.g., social ads, Instagram, e-commerce).
- Do not use aspect ratio or duration for filtering.
- Do not guess or return unrelated templates.
- If no template has metadata or description fields matching the user's request, respond clearly: "No suitable templates found."

Use when:
- The user wants to browse or choose a template.
- Before recommending or starting a render.
To find templates for targeted campaigns, platforms, or audiences.

Follow-ups:

- "get_renderable_item_details" - fetch parameter schema/defaults for the chosen template/variant.
      `,
      inputSchema: Input,
      outputSchema: Output,
    },
    async ({ excludeDesigns, excludeProjects }) => {
      const items = await listRenderableItems({
        excludeDesigns,
        excludeProjects,
      });

      return {
        content: [{ type: "text", text: JSON.stringify(items) }],
        structuredContent: { items },
      };
    }
  );
}
