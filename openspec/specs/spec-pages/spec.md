## Requirements

### Requirement: A VitePress page is generated for each canonical spec

The plugin SHALL write a page to `<outDir>/specs/<capability>/index.md` in the VitePress `srcDir` for each canonical spec from `openspec/specs/<capability>/spec.md`, with an H1 heading (humanized capability name) and the original spec content below it.

#### Scenario: Spec page is generated
- **WHEN** the plugin runs for a canonical spec with `name: 'nav-integration'`
- **THEN** `<srcDir>/<outDir>/specs/nav-integration/index.md` exists with `# Nav Integration` as the first heading

#### Scenario: Spec content is fully included
- **WHEN** the original `spec.md` contains requirements and scenarios
- **THEN** the generated page contains the same content in full

### Requirement: Generated spec page H1 heading uses humanized label

The `# Heading` on a generated spec page MUST use the humanized (Title Case) form of the capability name.

#### Scenario: Spec page heading uses Title Case
- **WHEN** the plugin generates a page for spec `nav-integration`
- **THEN** the first line of the generated page is `# Nav Integration`

### Requirement: An index page for the specs section is generated

The plugin SHALL generate an overview page `<outDir>/specs/index.md` that lists all capabilities with humanized names and links.

#### Scenario: Specs index contains all capabilities
- **WHEN** three canonical specs exist
- **THEN** `specs/index.md` contains links to all three capability pages with humanized labels

### Requirement: Generated spec page structure includes optional frontmatter

`generateSpecPage()` SHALL produce a page with the following structure when a description can be extracted:

```
---
description: "<extracted description>"
---

# <humanized title>

<transformed spec content>
```

When no description can be extracted, the frontmatter block is omitted and the page begins directly with the `# <title>` heading.

#### Scenario: Spec page with extractable description
- **WHEN** the plugin generates a page for spec `nav-integration` whose spec.md contains a `### Requirement:` heading
- **THEN** the generated page begins with a `---` frontmatter block containing `description:`

#### Scenario: Spec page without extractable description
- **WHEN** the plugin generates a page for a spec whose spec.md contains no `### Requirement:` heading
- **THEN** the generated page begins directly with `# Nav Integration` (no frontmatter)

### Requirement: Existing generated pages are overwritten

The plugin SHALL overwrite existing files in the `<outDir>/specs/` folder without error.

#### Scenario: Repeated build
- **WHEN** the plugin runs twice in a row
- **THEN** the files are overwritten on the second run without errors
