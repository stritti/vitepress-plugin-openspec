## MODIFIED Requirements

### Requirement: Generated change index page H1 heading uses humanized label

The `# Heading` on a generated change index page MUST use the humanized (Title Case) form of the change name.

#### Scenario: Change index page heading uses Title Case
- **WHEN** the plugin generates an index page for change `readable-sidebar-labels`
- **THEN** the first line of the generated page is `# Readable Sidebar Labels`

### Requirement: Link text in index pages uses humanized labels

The link text used in `specs/index.md` and `changes/index.md` for individual items MUST use humanized labels.

#### Scenario: Specs index link text uses Title Case
- **WHEN** `generateSpecsIndexPage()` generates the specs index
- **THEN** each spec link reads `[Nav Integration](/openspec/specs/nav-integration/)` instead of `[nav-integration](…)`

#### Scenario: Changes index link text uses Title Case
- **WHEN** `generateChangesIndexPage()` generates the changes index
- **THEN** each change link reads `[Readable Sidebar Labels](/openspec/changes/readable-sidebar-labels/)` instead of the raw kebab-case name
