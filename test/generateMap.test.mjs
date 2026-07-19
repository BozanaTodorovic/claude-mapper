import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdtempSync, rmSync, cpSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { generateMap } from "../src/generateMap.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(__dirname, "fixtures", "sample-repo");

function withTempCopy(fn) {
  const tmp = mkdtempSync(join(tmpdir(), "claude-mapper-test-"));
  cpSync(FIXTURE, tmp, { recursive: true });
  try {
    fn(tmp);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

test("generateMap creates MAP.md when none exists", () => {
  withTempCopy((tmp) => {
    const { action } = generateMap(tmp);
    assert.equal(action, "created");

    const content = readFileSync(join(tmp, "MAP.md"), "utf8");
    assert.match(content, /<!-- AUTO:START -->/);
    assert.match(content, /Where to look/);
  });
});

test("generateMap preserves hand-written content outside AUTO markers", () => {
  withTempCopy((tmp) => {
    generateMap(tmp); // first pass creates the file

    const mapPath = join(tmp, "MAP.md");
    const withNote = readFileSync(mapPath, "utf8").replace(
      "| _add task_ | _path_ |",
      "| Fix auth bug | `src/features/auth` |",
    );
    writeFileSync(mapPath, withNote);

    const { action } = generateMap(tmp);
    assert.equal(action, "updated");

    const finalContent = readFileSync(mapPath, "utf8");
    assert.match(finalContent, /Fix auth bug/);
  });
});
