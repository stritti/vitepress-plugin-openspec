## Why

The plugin has no live demo or documentation site, making it hard for potential users to evaluate it. A GitHub Pages site built with VitePress — and powered by the plugin itself using the repository's own OpenAPI spec as the example — serves as both public documentation and a living proof-of-concept that the plugin works end-to-end.

## What Changes

- A `docs/` directory is added containing a minimal VitePress site configuration
- The repository's own OpenAPI spec (e.g. `openspec/petstore.yaml` or a dedicated `docs/api/openspec.yaml`) is wired into the VitePress site via the plugin
- A GitHub Actions workflow (`.github/workflows/deploy-docs.yml`) builds and deploys the site to GitHub Pages on every push to `main`
- `package.json` gains `docs:dev` and `docs:build` scripts for local development of the demo site

## Capabilities

### New Capabilities

- `vitepress-site`: A `docs/` VitePress site configuration that uses `vitepress-plugin-openspec` to render the bundled example spec, with a sidebar and nav entry for the API reference section
- `github-actions-deploy`: A GitHub Actions workflow that installs dependencies, builds the VitePress site, and deploys the output to GitHub Pages using the official `actions/deploy-pages` action

### Modified Capabilities

(none)

## Impact

- New directory: `docs/` (VitePress source)
- New file: `.github/workflows/deploy-docs.yml`
- `package.json` — two new scripts (`docs:dev`, `docs:build`)
- No changes to plugin source code (`src/`)
- Requires GitHub Pages enabled on the repository (Settings → Pages → Source: GitHub Actions)
