## Context

The plugin writes all generated Markdown pages to `<srcDir>/<outDir>/` in `configResolved`. With the default configuration (`outDir: 'openspec'`) these land in `docs/openspec/`. This folder is currently not listed in `.gitignore` and is therefore tracked by Git.

This causes two problems:
1. **Commit noise**: Every change to `openspec/` produces changes in `docs/openspec/`
2. **CLI confusion**: The OpenSpec CLI finds `docs/openspec/` and incorrectly uses it as the source directory

## Goals / Non-Goals

**Goals:**
- Remove `docs/<outDir>/` from Git tracking
- Phrase the entry generically so that any `outDir` value is covered

**Non-Goals:**
- Changes to the plugin code
- Changes to the build order or timing behaviour

## Decisions

**`.gitignore` at docs level, not root level**
The generated folder lives under `docs/`. An entry `docs/openspec/` in the root `.gitignore` is precise. A `docs/.gitignore` would also work, but a root file is cleaner.

**Generic entry instead of hardcoded `docs/openspec/`**
Since `outDir` is configurable, the entry is explained in a comment — but the concrete path `docs/openspec/` is sufficient for this project as `outDir` is fixed to `'openspec'` in `docs/.vitepress/config.ts`.

**`git rm --cached` instead of deleting files**
The files should continue to exist locally after the build (VitePress needs them to render). Only the Git tracking is removed.

## Risks / Trade-offs

- **First checkout without a build**: After a fresh `git clone`, `docs/openspec/` does not exist. The build must run once before VitePress knows about the pages (a known timing issue, independent of this change).
- **CI**: The GitHub Actions workflow builds the plugin and then the docs — the generated folder is created at build time. No issue.
