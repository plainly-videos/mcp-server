import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listRenderableItems, RenderableTemplate } from "../sdk";
import { asPlainObject } from "../utils/schema";

export function registerListRenderableItems(server: McpServer) {
  const Input = {};
  const Output = {
    items: z.array(
      z.object({
        isDesign: z.boolean(),
        id: z.string(),
        name: z.string(),
        description: z.string(),
        metadata: z.object({
          category: z.string().optional(),
          attributes: z.record(z.any()).optional(),
        }),
        templates: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            aspectRatio: z.string(),
            duration: z.number(),
          })
        ),
      })
    ),
  };

  server.registerTool(
    "list_renderable_items",
    {
      title: "List Renderable Items (Projects & Designs)",
      description:
        "Return all user projects and predefined designs the authenticated user can render. " +
        "Use this to show choices before picking a template or starting a render. ",
      inputSchema: Input,
      outputSchema: Output,
    },
    async () => {
      const apiItems = await listRenderableItems();

      const items = (apiItems ?? []).map((x: any) => ({
        id: String(x.id),
        name: String(x.name),
        description: String(x.description ?? ""),
        isDesign: Boolean(x.isDesign),

        metadata: {
          category:
            typeof x?.metadata?.category === "string"
              ? x.metadata.category
              : undefined,
          attributes: asPlainObject(x?.metadata?.attributes),
        },

        templates: (Array.isArray(x.templates) ? x.templates : []).map(
          (t: RenderableTemplate) => ({
            id: String(t.id),
            name: String(t.name),
            aspectRatio: String(t.aspectRatio ?? ""),
            duration: Number(t.duration ?? 0),
          })
        ),
      }));

      return {
        content: [{ type: "text", text: JSON.stringify(items) }],
        structuredContent: { items },
      };
    }
  );
}
