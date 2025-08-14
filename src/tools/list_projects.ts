import { ToolDefinition } from '../types.js';
import { PlainlySdk } from '../sdk.js';
import { Design } from '../types/design.js';

export const listProjectsTool: ToolDefinition = {
  definition: {
    name: 'list_projects',
    description: 'List all available designs for rendering from Plainly API',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  
  handler: async () => {
    try {
      const sdk = new PlainlySdk();
      const designs: Design[] = await sdk.listDesigns();
      
      const designInfo = designs.map(design => ({
        id: design.id,
        name: design.name,
        description: design.description,
        category: design.category,
        palettes: design.palettes
      }));
      
      return {
        content: [
          {
            type: 'text',
            text: `Found ${designs.length} available designs:\n\n${designInfo.map(d => 
              `" ${d.name} (${d.id})\n  Category: ${d.category}\n  Description: ${d.description}\n  Color Palettes: ${d.palettes}`
            ).join('\n\n')}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error listing designs: ${error.message}`,
          },
        ],
      };
    }
  },
};