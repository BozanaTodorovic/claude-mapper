import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { mkdtempSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { initConfig } from "../src/init.mjs";

function withTempDir(fn) {
  const tmp = mkdtempSync(join(tmpdir(), "claude-mapper-init-test-"));
  try {
    fn(tmp);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

test("initConfig creates .claude-mapper.json when none exists", () => {
  withTempDir((tmp) => {
    const { created, path } = initConfig(tmp);
    assert.equal(created, true);
    assert.ok(existsSync(path));
  });
});

test("initConfig does not overwrite an existing config", () => {
  withTempDir((tmp) => {
    const configPath = join(tmp, ".claude-mapper.json");
    writeFileSync(configPath, '{"paths":[],"replaceConventions":true}');

    const { created } = initConfig(tmp);
    assert.equal(created, false);
  });
});
