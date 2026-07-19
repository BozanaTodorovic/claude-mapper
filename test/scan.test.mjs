import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { scanRepo } from "../src/scan.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(__dirname, "fixtures", "sample-repo");

test("scanRepo detects features and routes in a sample repo", () => {
  const lines = scanRepo(FIXTURE);
  const joined = lines.join("\n");

  assert.match(joined, /\*\*Features\*\* \(2\)/);
  assert.match(joined, /`auth`/);
  assert.match(joined, /`billing`/);
  assert.match(joined, /\*\*Routes\*\* \(2\)/);
  assert.match(joined, /`usersRoute`/);
  assert.match(joined, /`postsRoute`/);
});

test("scanRepo reports no-layout message for an empty dir", () => {
  const lines = scanRepo(join(__dirname, "fixtures", "empty-repo"));
  assert.equal(lines.length, 1);
  assert.match(lines[0], /No recognized source layout/);
});

test("scanRepo falls back to sibling-package scan (services monorepo)", () => {
  const lines = scanRepo(join(__dirname, "fixtures"));
  const joined = lines.join("\n");
  assert.match(joined, /\*\*sample-repo\/ routes\*\*/);
  assert.match(joined, /`usersRoute`/);
});

test("scanRepo falls back to config-only scan (scripts/+config/, no src/)", () => {
  const lines = scanRepo(join(__dirname, "fixtures", "config-only"));
  const joined = lines.join("\n");
  assert.match(joined, /\*\*Scripts\*\*/);
  assert.match(joined, /`build`/);
  assert.match(joined, /\*\*Configs\*\*/);
  assert.match(joined, /`settings\.json`/);
});

test("scanRepo detects Go standard project layout (cmd/internal/pkg)", () => {
  const lines = scanRepo(join(__dirname, "fixtures", "go-repo"));
  const joined = lines.join("\n");
  assert.match(joined, /\*\*Commands\*\* \(1\)/);
  assert.match(joined, /`server`/);
  assert.match(joined, /\*\*Internal packages\*\* \(1\)/);
  assert.match(joined, /`auth`/);
  assert.match(joined, /\*\*Public packages\*\* \(1\)/);
  assert.match(joined, /`utils`/);
});

test("scanRepo detects Python app/routers + app/models", () => {
  const lines = scanRepo(join(__dirname, "fixtures", "py-repo"));
  const joined = lines.join("\n");
  assert.match(joined, /\*\*Routers\*\* \(2\)/);
  assert.match(joined, /`users`/);
  assert.match(joined, /`posts`/);
  assert.match(joined, /\*\*Models\*\* \(1\)/);
  assert.match(joined, /`user`/);
});

test("scanRepo honors .claude-mapper.json overrides", () => {
  const overrides = {
    paths: [{ path: "src/routes", label: "Custom Routes", kind: "files" }],
    replaceConventions: true,
  };
  const lines = scanRepo(FIXTURE, overrides);
  assert.equal(lines.length, 1);
  assert.match(lines[0], /\*\*Custom Routes\*\*/);
});
