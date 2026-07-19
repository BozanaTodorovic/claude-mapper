/**
 * Loads optional .claude-mapper.json from a repo root.
 *
 * Shape:
 * {
 *   "paths": [
 *     { "path": "src/my-weird-layer", "label": "My weird layer", "kind": "dirs" }
 *   ],
 *   "replaceConventions": false  // true = use ONLY the paths above, skip built-in heuristics
 * }
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const CONFIG_FILE = ".claude-mapper.json";

export function loadConfig(root) {
  const configPath = join(root, CONFIG_FILE);
  if (!existsSync(configPath)) return null;

  try {
    const raw = readFileSync(configPath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      paths: Array.isArray(parsed.paths) ? parsed.paths : [],
      replaceConventions: parsed.replaceConventions === true,
    };
  } catch (err) {
    console.warn(`[claude-mapper] warning: could not parse ${CONFIG_FILE}: ${err.message}`);
    return null;
  }
}
