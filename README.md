# Plainly's Official MCP Server

[![smithery badge](https://smithery.ai/badge/@plainly-videos/mcp-server)](https://smithery.ai/server/@plainly-videos/mcp-server)

The official MCP server for [Plainly Videos](https://plainlyvideos.com), a cloud-based video automation platform that renders Adobe After Effects templates natively in the cloud.

It lets AI agents and MCP clients (Claude, Cursor, VS Code, or any MCP-compatible client) browse your video templates, fill in their parameters, submit renders, and check the render status of each one.

### What you can do with it

Ask your AI assistant directly:

* *"List my Plainly templates and show me what parameters the YouTube intro needs"*
* *"Render the Promo Template 16:9 with the headline 'Summer sale', this logo, and with colour #87CEEB"*
* *"Create me a unique video for all 100 rows of data from this CSV file"*
* *"Check if my renders are done and give me the preview links"*
* *"Render a test video with placeholder values so I can verify the template works"*

Combine it with other MCP servers to build agents that generate videos from live data:

* **Weather-triggered ads** - weather MCP server checks the forecast, agent renders localized ad variants ("Rainy week in Berlin - 20% off umbrellas")
* **Product feed to video** - connect a Shopify or product catalog MCP server and render a promo video for every product, with the name, price, image, and discount pulled straight from the feed
* **Sports recaps** - connect a sports data MCP server and turn last night's scores into a highlight video for each game
* And more

## 🎥 Demo

<p align="center">
  <a href="https://plainlyvideos.wistia.com/medias/j099l7maqm" title="Watch demo video" target="_blank" rel="noopener noreferrer">
    <img src="https://embed-ssl.wistia.com/deliveries/fc2521adb70dc7d665cac3976386aebee68f21ba.jpg?image_crop_resized=1000x698&image_play_button_rounded=true&image_play_button_size=2x&image_play_button_color=174bd2e0" alt="Plainly Videos - MCP showcase single product" width="500" height="349">
  </a>
</p>

## 📋 Prerequisites

- [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) **≥ 18** (required)
- [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Plainly Account](https://app.plainlyvideos.com)

## ▶️ How to Run

### Install via npm

1. **Get your Plainly API key**

- Go to [Settings page](https://app.plainlyvideos.com/dashboard/user/settings/general)
- Create a new API key
- Copy the new API key

2. **Add config to your editor**

   ```json
   {
     "servers": {
       "plainly": {
         "command": "npx",
         "args": ["-y", "@plainly-videos/mcp-server@latest"],
         "env": {
           "PLAINLY_API_KEY": "<PLAINLY_API_KEY>"
         }
       }
     }
   }
   ```

   > 🔑 Replace <PLAINLY_API_KEY> with your actual API key.

### Install via Smithery

Go to [Smithery Plainly MCP page](https://smithery.ai/server/@plainly-videos/mcp-server), select your LLM client, and copy the generated command.

For example, with Claude as the client:

```bash
npx -y @smithery/cli@latest install @plainly-videos/mcp-server --client claude --key <YOUR_SMITHERY_KEY>
```

> 🔑 Replace <YOUR_SMITHERY_KEY> with your Smithery API key.

## 🛠️ Available Tools

- `list_renderable_items` - returns a list of all criteria matching designs and custom projects for authenticated user
- `get_renderable_items_details` - returns details of a single design or custom project, such as: required and optional parameters, preview links, aspect ratios, etc.
- `render_item` - submits a render with all needed parameters
- `check_render_status` - checks the render status and report error or preview links

## 🗣️ Prompts & Resources

This implementation **does not** include `prompts` or `resources` from the MCP specification. However, this may change in the future when there is broader support across popular MCP clients.

## 🚧 Development Mode

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
      "args": ["<FULL PATH TO dist/cli.js>"],
      "env": {
        "PLAINLY_API_KEY": "<PLAINLY_API_KEY>"
      }
    }
  }
}
```

3. Start MCP server from `.vscode/mcp.json`

## 📄 Plainly Developer Resources

- [Help center](https://help.plainlyvideos.com/)
- [API reference](https://app.plainlyvideos.com/api-reference.html)

---

<div align="center">

**If you find this project helpful, please consider giving it a ⭐!**

[![Star on GitHub](https://img.shields.io/github/stars/plainly-videos/mcp-server?style=for-the-badge&logo=github&label=Star%20this%20repo&color=FFD700)](https://github.com/plainly-videos/mcp-server/stargazers)

</div>
