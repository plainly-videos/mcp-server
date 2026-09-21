const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const path = require("node:path");

const SERVER = path.join(__dirname, "..", "dist", "stdio.js");

const EXPECTED_TOOLS = ["check_render_status", "get_renderable_items_details", "list_renderable_items", "render_item"];

const TIMEOUT_MS = 30_000;

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

    // Decode as text rather than concatenating Buffers: a multi-byte character
    // split across two chunks would otherwise corrupt into replacement
    // characters and fail JSON.parse.
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    // `stdio.silent` routes all console output here. The pipe must be drained
    // or the server blocks forever once the buffer fills.
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`Server did not exit within ${TIMEOUT_MS}ms.\n${stderr}`));
    }, TIMEOUT_MS);

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on("close", (code) => {
      clearTimeout(timer);

      if (code !== 0) {
        reject(new Error(`Server exited with code ${code}.\n${stderr}`));
        return;
      }

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

// Required by the spec between initialize and any other request.
const initialized = { jsonrpc: "2.0", method: "notifications/initialized" };

test("registers every tool under its published name", async () => {
  const messages = await callServer(
    [initialize, initialized, { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }],
    { PLAINLY_API_KEY: "test-key" },
  );

  const listed = messages.find((m) => m.id === 2);
  assert.ok(listed, "no response to tools/list");

  const names = listed.result.tools.map((t) => t.name).sort();
  assert.deepEqual(names, EXPECTED_TOOLS);
});

test("fails with a clear message when PLAINLY_API_KEY is unset", async () => {
  const requests = [
    initialize,
    initialized,
    { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "list_renderable_items", arguments: {} } },
  ];

  // node:test inherits the ambient environment, so the key is cleared explicitly.
  const messages = await callServer(requests, { PLAINLY_API_KEY: "" });

  const called = messages.find((m) => m.id === 2);
  assert.ok(called, "no response to tools/call");
  assert.equal(called.result.isError, true);
  assert.match(called.result.content[0].text, /PLAINLY_API_KEY/);
});

test("reports a missing API key through the structured error path", async () => {
  const requests = [
    initialize,
    initialized,
    {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "render_item",
        arguments: { isDesign: false, projectDesignId: "p", templateVariantId: "t", parameters: {} },
      },
    },
  ];

  const messages = await callServer(requests, { PLAINLY_API_KEY: "" });

  const called = messages.find((m) => m.id === 2);
  assert.ok(called, "no response to tools/call");
  assert.equal(called.result.isError, true);
  assert.match(called.result.structuredContent.message, /PLAINLY_API_KEY/);
});

test("keeps stack traces out of tool error output", async () => {
  const requests = [
    initialize,
    initialized,
    {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "check_render_status", arguments: { renderId: "r" } },
    },
  ];

  const messages = await callServer(requests, { PLAINLY_API_KEY: "" });

  const called = messages.find((m) => m.id === 2);
  assert.ok(called, "no response to tools/call");
  assert.doesNotMatch(called.result.content[0].text, /\bat \S+ \(/, "stack trace leaked into tool output");
  assert.ok(called.result.structuredContent.renderDetailsPageUrl, "error path dropped the render details link");
});
