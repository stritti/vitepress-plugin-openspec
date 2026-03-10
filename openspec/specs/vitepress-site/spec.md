## Requirements

### Requirement: docs directory contains a runnable VitePress site
A `docs/` directory SHALL exist at the repository root containing a complete VitePress site with its own `package.json`, `.vitepress/config.ts`, and at least one content page (`index.md`).

#### Scenario: Local dev server starts
- **WHEN** `npm run docs:dev` is run from the repository root
- **THEN** VitePress starts a local dev server without errors

#### Scenario: Production build succeeds
- **WHEN** `npm run docs:build` is run from the repository root (after `npm run build`)
- **THEN** VitePress produces a `docs/.vitepress/dist/` directory containing `index.html`

### Requirement: Site uses vitepress-plugin-openspec with the Petstore example spec
The VitePress config SHALL register `openspec()` as a Vite plugin, pointing at `docs/petstore.yaml` and writing generated pages to `docs/api/`.

#### Scenario: API pages are generated during build
- **WHEN** `npm run docs:build` completes
- **THEN** `docs/.vitepress/dist/api/` contains at least one HTML file per Petstore endpoint

#### Scenario: Plugin references the local build
- **WHEN** `docs/package.json` is inspected
- **THEN** the `vitepress-plugin-openspec` dependency references the local package via `file:../` or equivalent workspace notation

### Requirement: Site nav includes an API Reference entry
The VitePress `themeConfig.nav` SHALL contain an entry pointing to the generated API section (e.g. `/api/`).

#### Scenario: Nav entry is present
- **WHEN** the built site's `index.html` is inspected
- **THEN** the navigation bar contains a link labelled "API Reference" (or the spec's `info.title`) pointing to `/api/`

### Requirement: Root package.json exposes docs scripts
The root `package.json` SHALL contain `docs:dev` and `docs:build` scripts that delegate to the `docs/` sub-package.

#### Scenario: docs:build script exists
- **WHEN** `npm run` is executed at the repo root
- **THEN** both `docs:dev` and `docs:build` are listed as available scripts
