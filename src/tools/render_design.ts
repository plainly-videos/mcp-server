import { ToolDefinition } from '../types.js';
import { PlainlySdk } from '../sdk.js';
import { DesignRenderDto, DestructedRender } from '../types/design.js';

export const renderDesignTool: ToolDefinition = {
  definition: {
    name: 'render_design',
    description: 'Render a design with specified parameters, variant, and color palette',
    inputSchema: {
      type: 'object',
      properties: {
        designId: {
          type: 'string',
          description: 'The ID of the design to render',
        },
        variantId: {
          type: 'string',
          description: 'Optional variant ID to specify aspect ratio/size',
        },
        colorPalette: {
          type: 'string',
          description: 'Optional color palette group to use (e.g., BLUE, WHITE, etc.)',
        },
        parameters: {
          type: 'object',
          description: 'Key-value pairs of design parameters to customize the render',
          additionalProperties: {
            type: 'string'
          }
        }
      },
      required: ['designId'],
    },
  },
  
  handler: async (args: Record<string, unknown>) => {
    const { designId, variantId, colorPalette, parameters = {} } = args as any;
    
    try {
      const sdk = new PlainlySdk();
      
      // First get design details to validate parameters
      const designDetails = await sdk.getDesignDetails(designId);
      
      // Validate required parameters
      const requiredParams = designDetails.parameters.filter(p => !p.optional);
      const providedParams = Object.keys(parameters);
      const missingParams = requiredParams.filter(p => !providedParams.includes(p.key));
      
      if (missingParams.length > 0) {
        return {
          content: [
            {
              type: 'text',
              text: `Missing required parameters: ${missingParams.map(p => p.key).join(', ')}\n\nRequired parameters for ${designDetails.name}:\n${requiredParams.map(p => `• ${p.name} (${p.key}): ${p.description}`).join('\n')}`,
            },
          ],
        };
      }
      
      // Validate variant if provided
      if (variantId && !designDetails.variants.find(v => v.aspectRatio === variantId)) {
        const availableVariants = designDetails.variants.map(v => v.aspectRatio);
        return {
          content: [
            {
              type: 'text',
              text: `Invalid variant '${variantId}'. Available variants: ${availableVariants.join(', ')}`,
            },
          ],
        };
      }
      
      // Validate color palette if provided
      if (colorPalette && !designDetails.palettes.find(p => p.group === colorPalette)) {
        const availablePalettes = designDetails.palettes.map(p => p.group);
        return {
          content: [
            {
              type: 'text',
              text: `Invalid color palette '${colorPalette}'. Available palettes: ${availablePalettes.join(', ')}`,
            },
          ],
        };
      }
      
      // Prepare render data
      const renderData: DesignRenderDto = {
        designId,
        ...(variantId && { variantId }),
        ...(colorPalette && { colorPalette }),
        ...(Object.keys(parameters).length > 0 && { parameters })
      };
      
      // Submit render
      const render: DestructedRender = await sdk.renderDesign(renderData);
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ Render submitted successfully!

**Render ID:** ${render.id}
**Design:** ${designDetails.name} (${designId})
${variantId ? `**Variant:** ${variantId}\n` : ''}${colorPalette ? `**Color Palette:** ${colorPalette}\n` : ''}
**Parameters Used:**
${Object.entries(parameters).map(([key, value]) => {
  const param = designDetails.parameters.find(p => p.key === key);
  return `• ${param?.name || key}: ${value}`;
}).join('\n')}

The render is being processed. Use the render ID to check status and retrieve the final video when complete.`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error rendering design: ${error.message}`,
          },
        ],
      };
    }
  },
};