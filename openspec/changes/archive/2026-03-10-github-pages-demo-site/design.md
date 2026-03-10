## Context

The repository currently has no documentation site or public demo. The plugin's value proposition is best demonstrated by a site that uses it to render its own example spec. VitePress is the natural choice since the plugin is built for it. GitHub Pages via GitHub Actions is the standard zero-cost hosting path for open-source npm packages.

The plugin is already built (ESM + CJS via `tsup`) using **Bun** as the runtime and package manager (see `.github/workflows/ci.yml`). The demo site will consume the locally built plugin rather than the published npm package so that the CI pipeline always reflects the current source.

## Goals / Non-Goals

**Goals:**
- A `docs/` VitePress site that runs locally with `bun run docs:dev` and builds with `bun run docs:build`
- The site uses `vitepress-plugin-openspec` (local build) to render the Petstore YAML fixture as its API reference section
- A GitHub Actions workflow deploys the built site to GitHub Pages on every push to `main`
- The site includes at least a landing page explaining what the plugin does and linking to the rendered API reference

**Non-Goals:**
- Full plugin documentation (prose guides, API reference for the plugin itself) — the site is a demo, not a docs portal; thorough docs can be added later
- Custom VitePress theme — use the default theme
- Multi-spec demo — one spec (Petstore) is sufficient to demonstrate the plugin
- Versioned docs or multi-branch deployments

## Decisions

**D1 — Use local plugin build, not published npm package**
The `docs/` site references `vitepress-plugin-openspec` via a relative `file:../` path in its own `package.json`. The CI workflow runs `bun run build` before `bun run docs:build`.
*Why*: Ensures the demo always reflects the current source. If the demo referenced the published package, CI would pass on broken unreleased code.
*Alternative*: `bun link` in CI — fragile and harder to reproduce locally.

**D2 — Petstore YAML as the example spec**
Reuse `src/__tests__/petstore.yaml` (symlinked or copied to `docs/`) rather than maintaining a separate spec file.
*Why*: Single source of truth; the fixture is already a well-formed OpenAPI 3.0 spec. A symlink keeps it DRY; a copy is simpler but risks drift.
*Decision*: Use a copy at `docs/petstore.yaml` to avoid symlink issues on Windows CI runners.

**D3 — GitHub Actions `actions/deploy-pages` for deployment**
Use the official `actions/configure-pages` + `actions/upload-pages-artifact` + `actions/deploy-pages` action chain.
*Why*: This is the current GitHub-recommended pattern for non-Jekyll sites. It avoids the older `peaceiris/actions-gh-pages` third-party action.

**D4 — Single `docs/` package, not a monorepo workspace**
`docs/` has its own `package.json` with `vitepress` as a dependency and the plugin referenced locally. The root `package.json` gains `docs:dev` and `docs:build` scripts that delegate to `bun --cwd docs run`.
*Why*: Keeps docs tooling isolated; VitePress as a root dev-dependency would bloat the plugin package's install footprint.

## Risks / Trade-offs

**[Local plugin reference requires build step before docs:build]** CI must run `bun run build` before `bun run docs:build`. → Enforce ordering in the workflow; document in README.

**[Petstore copy drifting from test fixture]** If `src/__tests__/petstore.yaml` is updated, `docs/petstore.yaml` may lag. → Add a note in CONTRIBUTING; a future lint step could assert they are identical.

**[GitHub Pages must be enabled on the repo]** The workflow will fail silently if Pages is not configured. → Document the one-time setup step in the README.

**[VitePress peer dependency version]** The docs site pins VitePress independently; if the plugin declares a peer dep range, they must be compatible. → Pin docs VitePress to the same range declared in the root `peerDependencies`.

## Migration Plan

1. Add `docs/` directory with VitePress config and content
2. Copy `src/__tests__/petstore.yaml` → `docs/petstore.yaml`
3. Add `.github/workflows/deploy-docs.yml`
4. Enable GitHub Pages on the repository (Settings → Pages → Source: GitHub Actions) — one-time manual step
5. Push to `main`; workflow runs and publishes the site
6. Rollback: disable GitHub Pages in Settings or delete the workflow file

## Open Questions

- Should the index page (`docs/index.md`) use VitePress's hero layout (`layout: home`) or a plain Markdown page? → Use hero layout for a polished first impression; can be changed trivially.
- Should `docs/petstore.yaml` be a symlink or a copy? → Copy (see D2), but revisit if drift becomes an issue.
