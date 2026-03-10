## Requirements

### Requirement: Generated spec pages include a VitePress description

`generateSpecPage()` SHALL prepend a YAML frontmatter block to the generated Markdown containing a `description` field derived from the spec content, so that VitePress can use it for search results and social sharing cards.

#### Scenario: Description extracted from first requirement
- **WHEN** a spec contains at least one `### Requirement:` heading followed by a sentence
- **THEN** the generated page begins with frontmatter `description: "<first sentence of first requirement>"`

#### Scenario: Description omitted when no requirement found
- **WHEN** a spec contains no `### Requirement:` heading
- **THEN** the generated page is produced without a frontmatter block (no empty `description:` key)

#### Scenario: Description is capped at a reasonable length
- **WHEN** the first sentence of the first requirement is longer than 160 characters
- **THEN** the description is truncated at a word boundary and ends with `…`

#### Scenario: Description does not bleed into page body
- **WHEN** the generated page includes frontmatter
- **THEN** the frontmatter block is closed with `---` before the `# Heading` line, and the spec content follows unmodified

### Requirement: Generated change index pages do not include auto-description

`generateChangeIndexPage()` SHALL NOT generate a `description` field automatically, as change index pages describe workflow state rather than stable capability behavior.
