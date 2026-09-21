import type { XmcpConfig } from "xmcp";

const config: XmcpConfig = {
  stdio: {
    // Redirect console output to stderr so it cannot corrupt the JSON-RPC
    // stream on stdout.
    silent: true,
  },
  paths: {
    tools: "./src/tools",
    prompts: false,
    resources: false,
  },
  template: {
    name: "Plainly Videos",
    description: "Browse Plainly Videos projects and designs, and render videos from their templates and variants.",
  },
};

export default config;
