#!/usr/bin/env node
import { generateMap } from "../src/generateMap.mjs";
import { generateIndex } from "../src/generateIndex.mjs";
import { checkStaleness } from "../src/checkStale.mjs";

const HELP = `claude-mapper — generate navigable MAP.md files for AI coding agents

Usage:
  claude-mapper generate            Generate/update MAP.md for the current repo
  claude-mapper generate --all      Generate MAP.md for every sub-repo in this
                                     workspace + a root ARCHITECTURE.md index
  claude-mapper check                Check current repo's MAP.md for staleness
  claude-mapper check --all          Check every sub-repo's MAP.md for staleness

Options:
  --all              Treat cwd as a multi-repo workspace root, not a single repo
  --match <regex>    Only include child dirs matching this regex (with --all)
  -h, --help         Show this help
`;

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--all") args.all = true;
    else if (a === "--match") args.match = argv[++i];
    else if (a === "-h" || a === "--help") args.help = true;
    else args._.push(a);
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];

  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }

  if (!command) {
    console.log(HELP);
    process.exit(1);
  }

  const cwd = process.cwd();
  const match = args.match ? new RegExp(args.match) : undefined;

  if (command === "generate") {
    if (args.all) {
      const { repoCount } = generateIndex(cwd, { match });
      console.log(`[claude-mapper] processed ${repoCount} repo(s); ARCHITECTURE.md updated.`);
    } else {
      const { repo, action } = generateMap(cwd);
      console.log(`[claude-mapper] ${repo}: MAP.md ${action}.`);
    }
    return;
  }

  if (command === "check") {
    const { staleCount, results } = checkStaleness(cwd, { multiRepo: !!args.all, match });
    for (const r of results) {
      console.log(`[stale] ${r.repo}: MAP.md older than latest commit — run \`claude-mapper generate\`.`);
    }
    if (staleCount === 0) {
      console.log("[claude-mapper] all maps up to date.");
    } else {
      console.log(`\n[claude-mapper] ${staleCount} map(s) stale.`);
      process.exitCode = 1;
    }
    return;
  }

  console.error(`Unknown command: ${command}\n`);
  console.log(HELP);
  process.exitCode = 1;
}

main();
