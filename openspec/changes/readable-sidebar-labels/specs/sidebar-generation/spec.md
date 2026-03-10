## MODIFIED Requirements

### Requirement: Sidebar text for spec and change items uses humanized labels

The `text` field of sidebar items for capability specs and changes MUST use the humanized label (Title Case) derived from the kebab-case name, not the raw kebab-case name.

#### Scenario: Spec sidebar item uses Title Case
- **WHEN** `generateOpenSpecSidebar()` is called and a spec named `nav-integration` exists
- **THEN** the sidebar item has `text: 'Nav Integration'`

#### Scenario: Change sidebar item uses Title Case
- **WHEN** `generateOpenSpecSidebar()` is called and a change named `readable-sidebar-labels` exists
- **THEN** the change group has `text: 'Readable Sidebar Labels'`
