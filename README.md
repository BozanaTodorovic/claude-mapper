# claude-mapper

Generates a navigable `MAP.md` for every repo in your codebase, plus a small
`ARCHITECTURE.md` index for multi-repo workspaces — so an AI coding agent
(Claude Code or similar) can read a short, structured map instead of blind
scanning your folders on every task.

Zero dependencies. Works standalone; nothing to configure for common JS/TS
layouts.

## The problem

Large or multi-repo codebases cost an AI agent real tokens (and time) just to
figure out *where things are* before it can start working. Two failure modes
in particular:

1. **Blind scanning.** Without a map, the agent globs/greps its way around
   the tree on every session, re-discovering structure it already saw last
   time.
2. **Stale docs.** A hand-written architecture doc drifts out of sync with
   the actual folders within a few commits, and nothing tells you it's wrong
   — the agent just trusts it and gets misled.

`claude-mapper` addresses both: the structural parts of `MAP.md` are
**generated from the actual folder tree** (so they can't drift), and
`claude-mapper check` tells you exactly when a map is older than the repo's
latest commit.

## What it generates

**Per repo**, a `MAP.md` with an auto-generated `<!-- AUTO:START -->` /
`<!-- AUTO:END --> ` block listing recognized structure (features, routes,
components, services, ...), plus a hand-editable "Where to look" section
that survives regeneration untouched.

**For a multi-repo workspace**, a root `ARCHITECTURE.md` that indexes every
sub-repo's `MAP.md` — so an agent starting cold reads one small file, then
opens exactly the per-repo map it needs.

## Install

```bash
npx claude-mapper generate     # no install needed
# or
npm install -g claude-mapper
```

## Usage

```bash
# Inside a single repo
claude-mapper generate         # create/update this repo's MAP.md
claude-mapper check            # exit 1 if MAP.md is older than the latest commit

# At a multi-repo workspace root (folders containing package.json or .git)
claude-mapper generate --all   # regenerate every sub-repo's MAP.md + ARCHITECTURE.md
claude-mapper check --all      # flag every sub-repo whose MAP.md is stale

# Only include matching sub-repo folder names
claude-mapper generate --all --match "^my-org-"
```

Wire `claude-mapper check --all` into CI (non-zero exit on staleness) or a
pre-commit hook to keep maps honest without remembering to run it by hand.

## How structure detection works

No project-specific config is required — `claude-mapper` recognizes common
JS/TS conventions out of the box:

- Feature-folder apps: `src/features/*`
- Next.js: `src/app/*` or `app/*` (App Router), `src/pages/*` or `pages/*`
- Backend route/controller layers: `src/routes`, `src/controllers`
- Clean-Architecture-ish layers: `src/domain`, `src/application`,
  `src/services`, `src/repositories`, `src/models`, `src/schema`
- `src/components`, `src/lib`, `src/utils`, `src/shared`
- Monorepo layout: `packages/*`, `apps/*`

Each recognized folder becomes one labeled bullet line in the generated
section, e.g.:

```
- **Features** (10): `auth`, `board`, `dashboard`, `grade`, `landing`, ...
- **App routes** (4): `(app)`, `(auth)`, `(public)`, `api`
```

### Custom layout: `.claude-mapper.json`

If your repo doesn't match the built-in conventions (or you want extra
entries), drop a `.claude-mapper.json` in the repo root:

```json
{
  "paths": [
    { "path": "src/my-weird-layer", "label": "My weird layer", "kind": "dirs" }
  ],
  "replaceConventions": false
}
```

- `kind: "dirs"` lists subdirectory names; `kind: "files"` lists source
  filenames (extension stripped).
- `replaceConventions: true` uses *only* your `paths`, skipping the built-in
  heuristics entirely — useful for unusual repo layouts where the defaults
  produce noise.

## What it deliberately doesn't do

- **No AI/LLM analysis of your code.** This is a mechanical folder-structure
  scanner, not a codebase-understanding tool — it won't infer your
  architecture's *intent*, detect anti-patterns, or write prose about your
  domain model. If you want that, pair this with a tool that does deep
  content analysis; `claude-mapper` stays fast, deterministic, and free to
  run on every commit.
- **No CLAUDE.md generation.** This tool only maintains `MAP.md`/
  `ARCHITECTURE.md` navigation files. Your `CLAUDE.md` (rules, conventions,
  gotchas) stays entirely hand-written — link to the generated maps from it.

## License

MIT
