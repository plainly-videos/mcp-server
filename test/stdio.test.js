const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const path = require("node:path");

const SERVER = path.join(__dirname, "..", "dist", "stdio.js");

const EXPECTED_TOOLS = ["check_render_status", "get_renderable_items_details", "list_renderable_items", "render_item"];

/**
 * Drives the built stdio server with a list of JSON-RPC requests and returns
 * the parsed responses. Anything the server writes to stdout that is not a
 * JSON-RPC message is a protocol violation, so parsing is deliberately strict.
 */
function callServer(requests, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [SERVER], {
      env: { ...process.env, ...env },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.on("error", reject);
    child.on("close", () => {
      try {
        const messages = stdout
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line) => JSON.parse(line));
        resolve(messages);
      } catch (err) {
        reject(new Error(`Non-JSON-RPC output on stdout: ${err.message}\n${stdout}`));
      }
    });

    for (const request of requests) {
      child.stdin.write(`${JSON.stringify(request)}\n`);
    }
    child.stdin.end();
  });
}

const initialize = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "test", version: "1" },
  },
};

test("registers every tool under its published name", async () => {
  const messages = await callServer([initialize, { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }], {
    PLAINLY_API_KEY: "test-key",
  });

  const listed = messages.find((m) => m.id === 2);
  assert.ok(listed, "no response to tools/list");

  const names = listed.result.tools.map((t) => t.name).sort();
  assert.deepEqual(names, EXPECTED_TOOLS);
});

test("fails with a clear message when PLAINLY_API_KEY is unset", async () => {
  const requests = [
    initialize,
    { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "list_renderable_items", arguments: {} } },
  ];

  // node:test inherits the ambient environment, so the key is cleared explicitly.
  const messages = await callServer(requests, { PLAINLY_API_KEY: "" });

  const called = messages.find((m) => m.id === 2);
  assert.ok(called, "no response to tools/call");
  assert.equal(called.result.isError, true);
  assert.match(called.result.content[0].text, /PLAINLY_API_KEY/);
});
