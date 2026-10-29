## Purpose

Define the structure of the sidebar returned by `generateOpenSpecSidebar()` and the labels it uses.

## Requirements

### Requirement: Sidebar is grouped into specifications, changes, and archive

`generateOpenSpecSidebar()` SHALL return `SidebarItem[]` with a "Specifications" group, a "Changes" group, and an "Archive" group that is only present when archived changes exist.

#### Scenario: Specification group lists all specs
- **WHEN** `generateOpenSpecSidebar(specDir, { outDir: 'openspec' })` is called and a spec `nav-integration` exists
- **THEN** the "Specifications" group contains `{ text: 'Overview', link: '/openspec/specs/' }` followed by an item with `link: '/openspec/specs/nav-integration/'`

#### Scenario: Change items link to artifact pages
- **WHEN** an active change `my-feature` contains `proposal.md` and `tasks.md`
- **THEN** its group in "Changes" contains items linking to `/openspec/changes/my-feature/proposal` and `/openspec/changes/my-feature/tasks`

### Requirement: Sidebar text for spec and change items uses humanized labels

The `text` field of sidebar items for capability specs and changes MUST use the humanized label (Title Case) derived from the kebab-case name, not the raw kebab-case name.

#### Scenario: Spec sidebar item uses Title Case
- **WHEN** `generateOpenSpecSidebar()` is called and a spec named `nav-integration` exists
- **THEN** the sidebar item has `text: 'Nav Integration'`

#### Scenario: Change sidebar item uses Title Case
- **WHEN** `generateOpenSpecSidebar()` is called and a change named `readable-sidebar-labels` exists
- **THEN** the change group has `text: 'Readable Sidebar Labels'`
