## Purpose

Display human-readable labels instead of raw kebab-case names, while allowing an explicit title to override them.

## Requirements

### Requirement: Kebab-case names are humanized to Title Case

The system SHALL convert kebab-case names to Title Case labels and use the result wherever a kebab-case name would otherwise be shown.

#### Scenario: Multi-word name
- **WHEN** `humanizeLabel('readable-sidebar-labels')` is evaluated
- **THEN** the result is `'Readable Sidebar Labels'`

#### Scenario: Single-word name
- **WHEN** `humanizeLabel('docs')` is evaluated
- **THEN** the result is `'Docs'`

#### Scenario: Empty string
- **WHEN** `humanizeLabel('')` is evaluated
- **THEN** the result is an empty string

### Requirement: Title override takes precedence over humanization

When a `title` field is available on a `Change` or `CapabilitySpec`, it MUST be used verbatim as the display label in place of `humanizeLabel(name)`. The override is not further processed.

#### Scenario: Change title override used in sidebar
- **WHEN** a change has `title: "OpenAPI v3 Migration"` in `.openspec.yaml`
- **AND** `generateOpenSpecSidebar()` is called
- **THEN** the sidebar item text is `'OpenAPI v3 Migration'`

#### Scenario: Change title override used in page heading
- **WHEN** a change has `title: "OpenAPI v3 Migration"` in `.openspec.yaml`
- **AND** `generateChangeIndexPage()` is called
- **THEN** the page H1 heading is `# OpenAPI v3 Migration`

#### Scenario: Spec title override used in sidebar
- **WHEN** a spec's `spec.md` has frontmatter `title: "REST API Docs"`
- **AND** `generateOpenSpecSidebar()` is called
- **THEN** the sidebar item text is `'REST API Docs'`

#### Scenario: Spec title override used in page heading
- **WHEN** a spec's `spec.md` has frontmatter `title: "REST API Docs"`
- **AND** `generateSpecPage()` is called
- **THEN** the page H1 heading is `# REST API Docs`

#### Scenario: Falls back to humanizeLabel when no title provided
- **WHEN** no `title` is set in `.openspec.yaml` or spec frontmatter
- **THEN** `humanizeLabel(name)` is used as the display label
