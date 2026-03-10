## Why

The VitePress documentation (`docs/`) still describes the plugin as an OpenAPI/Swagger tool, with outdated taglines, feature descriptions, and an API Reference link pointing to a removed endpoint list. Since v0.2.0, the plugin renders **OpenSpec** project documentation — not OpenAPI specs. Visitors to the site will be confused about what the plugin actually does.

## What Changes

- Rewrite `docs/index.md` hero section: update tagline, text, and feature cards to describe OpenSpec rendering
- Replace the "API Reference" action link with a link to the generated OpenSpec docs section
- Update feature descriptions: folder reader, change pages, specs index, sidebar/nav helpers — all OpenSpec concepts

## Capabilities

### New Capabilities

*(none — this change is purely documentation content, no new code capabilities)*

### Modified Capabilities

*(none — no spec-level behavior changes)*

## Impact

- `docs/index.md` — rewritten
- No code changes; no API changes; no dependencies affected
