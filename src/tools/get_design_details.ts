import { ToolDefinition } from '../types.js';
import { PlainlySdk } from '../sdk.js';
import { DesignDetails } from '../types/design.js';


export const getDesignDetailsTool: ToolDefinition = {
  definition: {
    name: 'get_design_details',
    description: 'Get comprehensive details about a specific design including aspect ratios, color palettes, and parameters',
    inputSchema: {
      type: 'object',
      properties: {
        designId: {
          type: 'string',
          description: 'The ID of the design to get details for',
        },
      },
      required: ['designId'],
    },
  },
  
  handler: async (args: Record<string, unknown>) => {
    const { designId } = args as { designId: string };
    
    try {
      const sdk = new PlainlySdk();
      const design: DesignDetails = await sdk.getDesignDetails(designId);
      
      const aspectRatios = design.variants.map(v => `${v.aspectRatio} (${v.duration}s)`);
      const defaultVariant = design.variants.find(v => v.defaultVariant);
      
      const parameterDetails = design.parameters.map(param => 
        `• **${param.name}** (${param.key})${param.optional ? ' [Optional]' : ' [Required]'}\n  ${param.description}}`
      );
      
      const paletteDetails = design.palettes.map(palette => 
        `• **${palette.group}**${palette.defaultPalette ? ' (default)' : ''}\n  Primary: ${palette.primary}\n  Secondary: ${palette.secondary || 'N/A'}\n  Tertiary: ${palette.tertiary || 'N/A'}`
      );
      
      return {
        content: [
          {
            type: 'text',
            text: `# Design Details: ${design.name}

**ID:** ${design.id}
**Category:** ${design.category}
**Published:** ${design.publishedDate}
**Available for rendering:** ${!design.renderUiDisabled ? 'Yes' : 'No'}

**Description:**
${design.description}

## Available Aspect Ratios (${aspectRatios.length})
${aspectRatios.map(ratio => `• ${ratio}`).join('\n')}
${defaultVariant ? `\n*Default variant: ${defaultVariant.aspectRatio} (${defaultVariant.duration}s)*` : ''}

## Color Palettes (${design.palettes.length})
${paletteDetails.join('\n\n')}

## Design Parameters (${design.parameters.length})
${design.parameters.length > 0 ? parameterDetails.join('\n\n') : 'No configurable parameters'}

## Example Preview
**Thumbnail:** ${design.defaultExample.thumbnailUrl}
**Video:** ${design.defaultExample.videoUrl}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting design details: ${error.message}`,
          },
        ],
      };
    }
  },
};