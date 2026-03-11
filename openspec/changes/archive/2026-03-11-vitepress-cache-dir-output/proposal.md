## Why

Currently `generateOpenSpecPages()` writes generated Markdown files into `srcDir/openspec/` (i.e. `docs/openspec/`), which forces every consumer to manually add `docs/openspec` to their `.gitignore`. These are build artefacts — they must never be committed — but nothing enforces this automatically.

## What Changes

- The plugin automatically writes a self-managed `.gitignore` into the output directory (`<outDir>/.gitignore`) that ignores all generated files within it.
- The `.gitignore` file itself is the only file left trackable, so consumers commit the guardrail but never the generated content.
- No change to where files are written (still `srcDir/<outDir>/`), no new dependencies, no VitePress config changes required.
- Users who currently have a manual `docs/openspec` gitignore entry may remove it.

## Capabilities

### New Capabilities

- `auto-gitignore-output`: The plugin manages a `.gitignore` inside the generated output directory to automatically exclude generated Markdown files from version control — without requiring any manual gitignore configuration from the consumer.

### Modified Capabilities

<!-- none -->

## Impact

- `src/plugin.ts` — `generateOpenSpecPages()` writes one additional `.gitignore` file after generating all pages.
- Consumers: the `docs/openspec` entry in their project-level `.gitignore` becomes optional (backwards-compatible).
- CI/CD: no impact — generated files are never tracked, and the plugin regenerates them on every build.
