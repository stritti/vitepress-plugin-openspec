## Context

`generateSpecPage(spec: CapabilitySpec): string` in `src/utils.ts` currently produces:

```
# <title>

<raw spec.md content>
```

All three enhancements are pure string transformations applied to `spec.content` before rendering. No new dependencies are needed.

## Goals / Non-Goals

**Goals:**
- Strip delta section marker lines only (not their content)
- Transform `#### Scenario:` blocks into `:::details` containers
- Extract a `description` string and emit it as YAML frontmatter
- Keep all changes inside `generateSpecPage()` — no other function touched

**Non-Goals:**
- Transforming change index pages or the changes overview
- Parsing full YAML frontmatter from spec content (only writing it)
- Reordering or restructuring requirement content
- Handling nested scenarios or unusual heading levels

## Decisions

### Order of transformations

Apply in this sequence:
1. Extract description (from raw content, before any stripping)
2. Strip delta section markers
3. Transform scenario blocks

Extracting description first ensures we read the original content; the description extractor doesn't need to deal with VitePress containers.

### Delta marker stripping

Remove lines that are exactly one of:
```
## ADDED Requirements
## MODIFIED Requirements
## REMOVED Requirements
```

Implementation: filter out lines matching `/^## (ADDED|MODIFIED|REMOVED) Requirements\s*$/`. Blank lines adjacent to the removed heading may create double blank lines — collapse consecutive blank lines to a single blank line after stripping.

### Scenario block transformation

A scenario block starts at `#### Scenario: <title>` and ends just before the next heading of any level (`#`, `##`, `###`, `####`) or end of content.

Algorithm:
- Process content line by line
- When a line matches `/^#### Scenario: (.+)$/`, begin a `:::details <title>` block
- When the open block encounters another heading line (or EOF), close with `:::`
- The `#### Scenario:` line itself is replaced by the opening `:::details` marker

Edge case: back-to-back scenarios — close one block before opening the next.

### Description extraction

Scan the (original, pre-stripped) content for the first `### Requirement:` heading. Take the text of the paragraph immediately following it. Extract the first sentence (up to the first `.`, `?`, or `!` followed by whitespace or end of string). Trim. Cap at 160 characters at word boundary, appending `…` if truncated.

If no `### Requirement:` is found, omit the frontmatter block entirely.

### Output structure

```
---
description: "<extracted sentence>"
---

# <title>

<transformed content>
```

The `description` value is wrapped in double quotes. If the sentence contains double quotes, escape them as `\"`.

## Risks / Trade-offs

- Scenario detection relies on `#### ` being used exclusively for scenarios — if a spec uses `####` for other purposes the transformation will misfire. Acceptable given OpenSpec convention.
- Description extraction reads only the first requirement; specs with unusual structure (no `### Requirement:`) get no frontmatter. Acceptable fallback.
- `:::details` containers require the VitePress default theme — they are standard Markdown extensions in VitePress and not a concern for this plugin's target audience.
