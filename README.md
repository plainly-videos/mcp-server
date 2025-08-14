# Plainly MCP server

## Local configuration

To configure MCP locally, add `.vscode/mcp.json` like following:

```json
{
  "servers": {
    "Plainly": {
      "command": "node",
      "args": ["<FULL PATH TO dist/index.js>"],
      "env": {
        "PLAINLY_API_URL": "https://api.test.plainlyvideos.com",
        "PLAINLY_API_KEY": "<TEST API KEY>"
      }
    }
  }
}
```
