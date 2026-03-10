## MODIFIED Requirements

### Requirement: title field from .openspec.yaml is read for changes

`readOpenSpecFolder()` MUST read an optional `title` field from `.openspec.yaml` and store it on the `Change` object as `title?: string`.

#### Scenario: Change with title in .openspec.yaml
- **WHEN** `.openspec.yaml` contains `title: "OpenAPI v3 Migration"`
- **THEN** the `Change` object has `title: 'OpenAPI v3 Migration'`

#### Scenario: Change without title field
- **WHEN** `.openspec.yaml` does not contain a `title` field
- **THEN** the `Change` object has `title: undefined`

### Requirement: title frontmatter from spec.md is read for specs

`readOpenSpecFolder()` MUST parse the YAML frontmatter block of `spec.md` and extract an optional `title` field, storing it on the `CapabilitySpec` object as `title?: string`.

#### Scenario: spec.md with frontmatter title
- **WHEN** `spec.md` begins with `---\ntitle: "REST API Docs"\n---`
- **THEN** the `CapabilitySpec` object has `title: 'REST API Docs'`

#### Scenario: spec.md without frontmatter
- **WHEN** `spec.md` has no frontmatter block
- **THEN** the `CapabilitySpec` object has `title: undefined`
