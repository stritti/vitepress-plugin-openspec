## Requirements

### Requirement: A VitePress page is generated for each change artifact

The plugin SHALL write a page to `<outDir>/changes/<name>/<artifact>.md` in the VitePress `srcDir` for each available artifact (proposal.md, design.md, tasks.md) of a change.

#### Scenario: Change with all three artifacts
- **WHEN** a change `my-feature` contains the files `proposal.md`, `design.md`, and `tasks.md`
- **THEN** three pages are generated: `changes/my-feature/proposal.md`, `changes/my-feature/design.md`, `changes/my-feature/tasks.md`

#### Scenario: Change with only proposal.md
- **WHEN** a change contains only `proposal.md`
- **THEN** only `changes/my-feature/proposal.md` is generated

### Requirement: An index page is generated for each change

The plugin SHALL generate a `<outDir>/changes/<name>/index.md` for each change, containing the humanized change name, the creation date, and links to the available artifacts.

#### Scenario: Change index with all artifacts
- **WHEN** a change has all three artifacts
- **THEN** `changes/<name>/index.md` contains links to proposal, design, and tasks

### Requirement: Generated change index page H1 heading uses humanized label

The `# Heading` on a generated change index page MUST use the humanized (Title Case) form of the change name.

#### Scenario: Change index page heading uses Title Case
- **WHEN** the plugin generates an index page for change `readable-sidebar-labels`
- **THEN** the first line of the generated page is `# Readable Sidebar Labels`

### Requirement: Link text in index pages uses humanized labels

The link text used in `specs/index.md` and `changes/index.md` for individual items MUST use humanized labels.

#### Scenario: Changes overview
- **WHEN** two active changes exist
- **THEN** `changes/index.md` contains links to both changes with humanized labels

### Requirement: Archived changes are listed in a separate section on the overview page

Archived changes from `openspec/changes/archive/` SHALL be listed in a separate `## Archive` section on `changes/index.md` with their archive date.

#### Scenario: Archive section
- **WHEN** an archived change exists
- **THEN** `changes/index.md` contains an `## Archive` section with the archived change with a humanized label
