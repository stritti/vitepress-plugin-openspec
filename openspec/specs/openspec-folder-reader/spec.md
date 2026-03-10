## ADDED Requirements

### Requirement: Plugin reads the openspec folder and returns a structured representation

The function `readOpenSpecFolder(dir: string): OpenSpecFolder` SHALL scan the given directory and return a structured representation of all canonical specs, active changes, and archived changes.

#### Scenario: Complete openspec folder
- **WHEN** `readOpenSpecFolder('./openspec')` is called on a folder containing `specs/` and `changes/`
- **THEN** it returns an object with `specs: CapabilitySpec[]`, `changes: Change[]`, and `archivedChanges: Change[]`

#### Scenario: Empty or missing folder
- **WHEN** `readOpenSpecFolder('./openspec')` is called on a non-existent folder
- **THEN** an error is thrown containing the folder path

### Requirement: Canonical specs are read from openspec/specs/

For each subdirectory in `openspec/specs/` that contains a `spec.md`, a `CapabilitySpec` object SHALL be created with `name` (directory name) and `specPath` (absolute path to spec.md).

#### Scenario: Multiple capabilities
- **WHEN** `openspec/specs/` contains directories `nav-integration/` and `sidebar-generation/`, each with `spec.md`
- **THEN** the result contains two `CapabilitySpec` entries with the correct names

#### Scenario: Subdirectory without spec.md is ignored
- **WHEN** a subdirectory in `openspec/specs/` contains no `spec.md`
- **THEN** it is not included in the result

### Requirement: Changes are read with their artifacts

For each subdirectory in `openspec/changes/` (except `archive/`) that contains a `.openspec.yaml`, a `Change` object SHALL be created with `name`, `artifacts` (which of proposal/design/tasks are present), and metadata from `.openspec.yaml`.

#### Scenario: Change with all artifacts
- **WHEN** `openspec/changes/my-feature/` contains `.openspec.yaml`, `proposal.md`, `design.md`, `tasks.md`
- **THEN** the Change object contains all three artifacts in `artifacts`

#### Scenario: Change with missing design
- **WHEN** `openspec/changes/my-feature/` contains only `.openspec.yaml` and `proposal.md`
- **THEN** `artifacts` contains only `proposal`

### Requirement: Archived changes are read from changes/archive/

Subdirectories in `openspec/changes/archive/` SHALL be read as archived changes with the same fields as active changes, plus the date parsed from the directory name (`YYYY-MM-DD-<name>`).

#### Scenario: Archived change
- **WHEN** `openspec/changes/archive/2026-03-10-my-feature/` exists with `.openspec.yaml`
- **THEN** an archived Change object is created with `archivedDate: '2026-03-10'` and `name: 'my-feature'`

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
