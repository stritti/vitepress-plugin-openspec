## Why

The plugin is called `vitepress-plugin-openspec` because it is meant to integrate **OpenSpec project documentation** (openspec.dev) into VitePress — not OpenAPI or Swagger. The previous implementation was based on a misunderstanding. This change replaces it with the correct functionality: the artifacts from a project's `openspec/` folder are rendered as structured, navigable VitePress documentation pages.

## What Changes

- **BREAKING**: The existing OpenAPI/Swagger implementation (`loadSpecFile`, `extractEndpoints`, `parseSpec`, `generateEndpointMarkdown`, OpenAPI-specific types) is completely replaced
- The plugin reads the project's `openspec/` folder and generates VitePress pages from it
- Canonical specs (`openspec/specs/<capability>/spec.md`) → one page per capability
- Change artifacts (`openspec/changes/<name>/{proposal,design,tasks}.md`) → one page per artifact, grouped by change
- Archived changes (`openspec/changes/archive/`) are presented as a separate collapsed sidebar section
- `generateSidebarFromSpec()` → **BREAKING** replaced by `generateOpenSpecSidebar()`
- `openspecNav()` is retained as a concept but reads the `openspec/` folder instead of an OpenAPI file

## Capabilities

### New Capabilities

- `openspec-folder-reader`: Scans the `openspec/` folder and returns a structured representation of all specs, changes, and archived changes
- `spec-pages`: Generates VitePress pages for all canonical specs from `openspec/specs/` with an index page
- `change-pages`: Generates VitePress pages for all active and archived changes from `openspec/changes/` with an index page per change
- `openspec-navigation`: `generateOpenSpecSidebar()` and `openspecNav()` for the VitePress configuration

### Modified Capabilities

(none — complete rewrite)

## Impact

- `src/types.ts` — completely rewritten with OpenSpec-specific types; `NavItem` and `SidebarItem` are retained
- `src/utils.ts` — completely rewritten: OpenSpec folder reader and page generator instead of OpenAPI parser
- `src/plugin.ts` — completely rewritten: reads `openspec/` folder instead of OpenAPI YAML files
- `src/index.ts` — updated exports; `generateSidebarFromSpec` removed, `generateOpenSpecSidebar` added
- `src/__tests__/` — all existing tests replaced; `sample.yaml` removed
- `docs/.vitepress/config.ts` — must be updated to the new API
