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
  const lines = scanRepo(join(__dirname, "fixtures"));
  assert.equal(lines.length, 1);
  assert.match(lines[0], /No recognized source layout/);
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
