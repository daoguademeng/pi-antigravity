import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

process.env.ANTIGRAVITY_NO_PREWARM = "1";

const registeredTools: string[] = [];
const registeredCommands: string[] = [];
let registeredProvider: { name: string; config: unknown } | undefined;

const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
assert.deepEqual(manifest.pi.extensions, ["./src/index.ts"], "Only the provider entry may be auto-loaded; feature tools must remain disabled");

const api = {
  registerProvider(name: string, config: unknown) {
    registeredProvider = { name, config };
  },
  registerCommand(name: string) {
    registeredCommands.push(name);
  },
  registerTool(tool: { name: string }) {
    registeredTools.push(tool.name);
  },
} as unknown as ExtensionAPI;

for (const entry of manifest.pi.extensions) {
  const { default: extension } = await import(new URL(`../${entry}`, import.meta.url).href);
  extension(api);
}

assert.equal(registeredProvider?.name, "antigravity", "Antigravity provider must remain registered");
const providerConfig = registeredProvider?.config;
assert.ok(typeof providerConfig === "object" && providerConfig !== null && "oauth" in providerConfig, "Antigravity OAuth configuration must remain registered");
assert.deepEqual(registeredTools, [], `This auth-only fork must not register model-callable tools; found: ${registeredTools.join(", ")}`);

for (const name of ["antigravity.image", "antigravity.search"]) {
  assert.ok(registeredCommands.includes(name), `Namespaced command ${name} must remain registered`);
}

console.log("fork invariants: Antigravity OAuth provider and image/search commands registered, no model-callable tools");
