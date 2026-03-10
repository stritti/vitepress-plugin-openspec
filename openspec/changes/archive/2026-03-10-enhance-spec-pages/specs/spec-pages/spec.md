## MODIFIED Requirements

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
