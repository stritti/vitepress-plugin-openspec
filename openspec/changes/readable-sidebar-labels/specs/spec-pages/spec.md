## MODIFIED Requirements

### Requirement: Generated spec page H1 heading uses humanized label

The `# Heading` on a generated spec page MUST use the humanized (Title Case) form of the capability name.

#### Scenario: Spec page heading uses Title Case
- **WHEN** the plugin generates a page for spec `nav-integration`
- **THEN** the first line of the generated page is `# Nav Integration`
