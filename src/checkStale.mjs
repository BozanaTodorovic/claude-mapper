/**
 * Flags MAP.md files that are older than their repo's latest git commit —
 * i.e. the repo changed since the map was last regenerated. Read-only.
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

function latestCommitEpoch(repoPath) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%ct"], { cwd: repoPath, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
    return out ? parseInt(out, 10) : null;
  } catch {
    return null; // not a git repo, or no commits yet
  }
}

function checkOne(repoPath, repoLabel) {
  const mapPath = join(repoPath, "MAP.md");
  if (!existsSync(mapPath)) return null;
  if (!existsSync(join(repoPath, ".git"))) return null;

  const commitEpoch = latestCommitEpoch(repoPath);
  if (!commitEpoch) return null;

  const mapEpoch = Math.floor(statSync(mapPath).mtimeMs / 1000);
  if (mapEpoch >= commitEpoch) return null;

  return { repo: repoLabel, stale: true };
}

/**
 * @param {string} root workspace root (multi-repo) or a single repo root
 * @param {{ multiRepo?: boolean, match?: RegExp }} [opts]
 * @returns {{ staleCount: number, results: {repo: string, stale: boolean}[] }}
 */
export function checkStaleness(root, opts = {}) {
  const results = [];

  if (opts.multiRepo) {
    const entries = readdirSync(root)
      .filter((n) => !n.startsWith(".") && statSync(join(root, n)).isDirectory())
      .filter((n) => (opts.match ? opts.match.test(n) : true))
      .sort();

    for (const name of entries) {
      const result = checkOne(join(root, name), name);
      if (result) results.push(result);
    }
  } else {
    const result = checkOne(root, ".");
    if (result) results.push(result);
  }

  return { staleCount: results.length, results };
}
