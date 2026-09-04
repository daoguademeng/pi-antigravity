import assert from "node:assert/strict";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

process.env.ANTIGRAVITY_NO_PREWARM = "1";

const registeredTools: string[] = [];
let registeredProvider: { name: string; config: unknown } | undefined;

const { default: extension } = await import("../src/index.js");

extension({
  registerProvider(name: string, config: unknown) {
    registeredProvider = { name, config };
  },
  registerCommand() {},
  registerTool(tool: { name: string }) {
    registeredTools.push(tool.name);
  },
} as unknown as ExtensionAPI);

assert.equal(registeredProvider?.name, "antigravity", "Antigravity provider must remain registered");
const providerConfig = registeredProvider?.config;
assert.ok(typeof providerConfig === "object" && providerConfig !== null && "oauth" in providerConfig, "Antigravity OAuth configuration must remain registered");
assert.deepEqual(registeredTools, [], `This auth-only fork must not register model-callable tools; found: ${registeredTools.join(", ")}`);

console.log("fork invariants: Antigravity OAuth provider registered, no model-callable tools");
