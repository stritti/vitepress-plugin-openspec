## Purpose

Provide a runnable VitePress demo site in `docs/` that renders this project's own OpenSpec folder.

## Requirements

### Requirement: docs directory contains a runnable VitePress site

A `docs/` directory SHALL exist at the repository root containing a complete VitePress site with its own `package.json`, `.vitepress/config.ts`, and at least one content page (`index.md`).

#### Scenario: Local dev server starts
- **WHEN** `npm run docs:dev` is run from the repository root
- **THEN** VitePress starts a local dev server without errors

#### Scenario: Production build succeeds
- **WHEN** `npm run docs:build` is run from the repository root (after `npm run build`)
- **THEN** VitePress produces a `docs/.vitepress/dist/` directory containing `index.html`

### Requirement: Site renders the project's own openspec folder

The VitePress config SHALL generate pages from the repository's `openspec/` directory into `docs/openspec/` using the plugin.

#### Scenario: Spec and change pages are generated during build
- **WHEN** `npm run docs:build` completes
- **THEN** `docs/.vitepress/dist/openspec/` contains HTML pages for the specs index, each spec, and the changes index

#### Scenario: Plugin references the local build
- **WHEN** `docs/package.json` is inspected
- **THEN** the plugin dependency references the local package via `file:../` or equivalent workspace notation

### Requirement: Site nav includes an OpenSpec entry

The VitePress `themeConfig.nav` SHALL contain an entry created with `openspecNav()` pointing to `/openspec/`.

#### Scenario: Nav entry is present
- **WHEN** the built site's `index.html` is inspected
- **THEN** the navigation bar contains a link labelled "OpenSpec" pointing to the openspec section

### Requirement: Root package.json exposes docs scripts

The root `package.json` SHALL contain `docs:dev` and `docs:build` scripts that delegate to the `docs/` sub-package.

#### Scenario: docs:build script exists
- **WHEN** `npm run` is executed at the repo root
- **THEN** both `docs:dev` and `docs:build` are listed as available scripts
