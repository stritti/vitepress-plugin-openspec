## Why

Generated spec pages currently pass the raw spec.md content through with only a `# Heading` prepended. This produces two readability problems: delta workflow markers (`## ADDED Requirements`, `## MODIFIED Requirements`) leak into the canonical view, making pages look like diffs rather than documentation; and `#### Scenario:` blocks render as flat bullet lists with no visual distinction from requirement prose. Both issues make the generated pages harder to read for anyone not familiar with the OpenSpec change workflow.

## What Changes

- Strip delta section markers (`## ADDED Requirements`, `## MODIFIED Requirements`, `## REMOVED Requirements`) from generated spec pages — content under these headings is preserved, only the heading line is removed
- Transform `#### Scenario: <title>` blocks into VitePress `:::details <title>` collapsible containers so scenarios are visually distinct and collapsed by default
- Add a `description:` frontmatter field to generated spec pages, derived automatically from the first sentence of the first requirement, for use by VitePress search and social sharing cards

## Capabilities

### New Capabilities

- `spec-page-description`: Auto-generated VitePress `description` frontmatter on spec pages, extracted from the first requirement sentence.
- `spec-page-scenarios`: Transformation of delta section markers and `#### Scenario:` blocks into clean, collapsible VitePress content.

### Modified Capabilities

- `spec-pages`: `generateSpecPage()` now produces frontmatter + cleaned content instead of a bare heading + raw content.

## Impact

- `src/utils.ts` — extend `generateSpecPage()` with three content transformations
- No changes to file paths, URLs, sidebar, or public API
- Purely cosmetic: all existing spec content is preserved, only presentation changes
- Tests need updating to reflect the new page structure (frontmatter, :::details containers, no delta markers)
