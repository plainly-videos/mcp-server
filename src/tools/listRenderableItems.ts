import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listRenderableItems } from "../sdk";

export function registerListRenderableItems(server: McpServer) {
  const Input = {
    excludeDesigns: z
      .boolean()
      .optional()
      .describe(
        "If true, excludes designs from the results. Avoid setting both excludeDesigns and excludeProjects to true."
      ),
    excludeProjects: z
      .boolean()
      .optional()
      .describe(
        "If true, excludes projects from the results. Avoid setting both excludeDesigns and excludeProjects to true."
      ),
  };
  const Output = {
    items: z
      .array(
        z.object({
          isDesign: z
            .boolean()
            .describe(
              "True when the parent is a Design; false when it is a Project."
            ),
          id: z.string().describe("Parent identifier (projectId or designId)."),
          name: z.string().describe("Parent display name."),
          description: z
            .string()
            .nullable()
            .describe(
              "Short description used for discovery and relevance matching."
            ),
          metadata: z
            .object({
              category: z
                .string()
                .nullable()
                .describe(
                  "High-level category label for Designs (if present)."
                ),
              attributes: z
                .record(z.any())
                .nullable()
                .describe(
                  "Additional key-value metadata (e.g., tags, labels). May be null/omitted when unavailable."
                ),
            })
            .describe(
              "Metadata primarily used for semantic filtering and recommendations."
            ),
          templates: z
            .array(
              z.object({
                id: z
                  .string()
                  .describe("Template/variant identifier (renderable leaf)."),
                name: z.string().describe("Template/variant display name."),
                aspectRatio: z
                  .string()
                  .describe(
                    "Aspect ratio string (e.g., '16:9', '1:1', '9:16')."
                  ),
                durationSeconds: z
                  .number()
                  .describe("Template/variant duration in seconds."),
              })
            )
            .describe(
              "Lightweight preview of renderable leaf options under this parent (no parameter schema here)."
            ),
        })
      )
      .describe(
        "Renderable parents (Projects/Designs) with preview of their templates/variants."
      ),
  };

  server.registerTool(
    "list_renderable_items",
    {
      title: "List Renderable Items",
      description: `
Return all Projects and Designs the authenticated user can render.
Designs are pre-made projects with variants available for all users.
Projects are created and maintained by the user, and may have custom templates.

Each item includes a lightweight preview of its templates/variants (name, aspect ratio, duration) plus a parent-level description and metadata (tags, category, attributes).

Filtering guidance (semantic first):
- First, determine relevance using: metadata.tags, metadata.category, metadata.attributes, description, and name.
- Only after a semantic match, consider technical fit (aspectRatio, durationSeconds) to break ties.
- Do not guess or list unrelated items. If nothing is relevant, respond: "No suitable templates found."

Use when:
- The user wants to browse, search, or choose a template/variant.
- Before recommending or starting a render for a targeted campaign, platform, or audience.

Follow-ups:
- \`get_renderable_item_details\` — fetch the full parameter schema/defaults for the chosen template/variant before rendering.
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
