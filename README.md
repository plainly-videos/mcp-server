# Plainly's Official MCP Server

Implementation of MCP server for [Plainly](https://www.plainlyvideos.com/) in NodeJS. Enables LLM clients to connect and interact with Plainly APIs.

## 🎥 Demo

<p align="center">
  <a href="https://storage.googleapis.com/plainly-static-data/plainly-mcp-server-demo.mp4">
    <img src="https://storage.googleapis.com/plainly-static-data/plainly-mcp-server-demo-thumbnail.png" alt="Demo Video" width="500">
  </a>
</p>

## 📋 Prerequisites

- [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) **≥ 18** (required)
- [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Plainly Account](https://app.plainlyvideos.com)

## ▶️ How to run (local installation)

1. **Get your Plainly API key**

- Go to [Settings page](https://app.plainlyvideos.com/dashboard/user/settings/general)
- Create a new API key
- Copy the new API key

2. **Add config to your editor**

```json
{
  "servers": {
    "plainly": {
      "command": "yarn",
      "args": ["dlx", "@plainly-videos/mcp-server@latest", "mcp-server"],
      "env": {
        "PLAINLY_API_KEY": "<PLAINLY_API_KEY>"
      }
    }
  }
}
```

## 🛠️ Available tools

- `list_renderable_items` - returns a list of all criteria matching designs and custom projects for authenticated user
- `get_renderable_items_details` - returns details of a single design or custom project, such as: required and optional parameters, preview links, aspect ratios, etc.
- `render_item` - submits a render with all needed parameters
- `check_render_status` - checks the render status and report error or preview links

## 🗣️ Prompts & Resources

This implementation **does not** include `prompts` or `resources` from the MCP specification. However, this may change in the future when there is broader support across popular MCP clients.

## 🚧 Development mode

If you want to run the server in development mode, you can install dependencies and run the server using the following command:

1. Clone, install, and build:

```shell
git clone git@github.com:plainly-videos/mcp-server.git
cd mcp-server

yarn install
yarn build
```

2. Add your API key in `.vscode/mcp.json`

```json
{
  "servers": {
    "plainly": {
      "command": "node",
      "args": ["<FULL PATH TO dist/index.js>"],
      "env": {
        "PLAINLY_API_KEY": "<PLAINLY_API_KEY>"
      }
    }
  }
}
```

3. Start MCP server from `.vscode/mcp.json`

## 📄 Plainly developer resources

- [Help center](https://help.plainlyvideos.com/)
- [API reference](https://app.plainlyvideos.com/api-reference.html)
