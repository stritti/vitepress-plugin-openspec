## Requirements

### Requirement: Delta section markers are stripped from canonical spec pages

`generateSpecPage()` SHALL remove `## ADDED Requirements`, `## MODIFIED Requirements`, and `## REMOVED Requirements` headings from the generated page content. Requirements under these sections SHALL be preserved — only the section heading line itself is removed. Consecutive blank lines left by the removal SHALL be collapsed to a single blank line.

#### Scenario: ADDED section marker is stripped
- **WHEN** a spec contains `## ADDED Requirements\n\n### Requirement: Foo`
- **THEN** the generated page contains `### Requirement: Foo` but not `## ADDED Requirements`

#### Scenario: Content under section marker is preserved
- **WHEN** a spec contains requirements under a `## MODIFIED Requirements` heading
- **THEN** all `### Requirement:` entries and their scenarios appear in the generated page

#### Scenario: Plain specs without delta markers are unaffected
- **WHEN** a spec contains no `## ADDED/MODIFIED/REMOVED` headings
- **THEN** the generated page content is identical to the source spec content

### Requirement: Scenarios are rendered as VitePress detail containers

`generateSpecPage()` SHALL transform each `#### Scenario: <title>` block into a VitePress `:::details <title>` container, so that scenarios are collapsible and visually distinct from requirement text. The `#### Scenario:` line is replaced by the opening `:::details` marker; a closing `:::` is inserted before the next heading of any level, or at end of content.

#### Scenario: Scenario heading becomes a details container
- **WHEN** a spec contains `#### Scenario: Successful login\n- **WHEN** ...\n- **THEN** ...`
- **THEN** the generated page contains `:::details Successful login\n- **WHEN** ...\n- **THEN** ...\n:::`

#### Scenario: Scenario block ends at the next heading
- **WHEN** a scenario block is followed by another `###` or `####` heading
- **THEN** the `:::` closing marker is inserted before that heading

#### Scenario: Back-to-back scenarios close and reopen correctly
- **WHEN** two `#### Scenario:` blocks follow each other without intervening heading
- **THEN** the first block is closed with `:::` before the second `:::details` opens

#### Scenario: Non-scenario content is not affected
- **WHEN** a spec contains requirement text without `#### Scenario:` headings
- **THEN** that text appears in the generated page unmodified
