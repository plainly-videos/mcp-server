export const helloWorldTool = {
  definition: {
    name: 'hello_world',
    description: 'A simple tool that returns a greeting message',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name to greet',
        },
      },
      required: [],
    },
  },
  
  handler: async (args) => {
    const name = args?.name || 'World';
    const message = `Hello, ${name}!`;
    
    return {
      content: [
        {
          type: 'text',
          text: message,
        },
      ],
    };
  },
};