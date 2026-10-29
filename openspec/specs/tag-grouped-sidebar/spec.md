## Purpose

Define the default collapsed state of the groups in the generated sidebar and the `SidebarItem` type that carries it.

## Requirements

### Requirement: Sidebar groups declare their collapsed state

Top-level groups returned by `generateOpenSpecSidebar()` SHALL set `collapsed` explicitly: "Specifications" and "Changes" are expanded, "Archive" and each individual change group are collapsed.

#### Scenario: Default collapsed state
- **WHEN** `generateOpenSpecSidebar()` is called on a folder with specs, active changes, and archived changes
- **THEN** "Specifications" and "Changes" have `collapsed: false`, "Archive" has `collapsed: true`, and every change group inside has `collapsed: true`

### Requirement: SidebarItem type includes collapsed field

The `SidebarItem` TypeScript interface SHALL include an optional `collapsed?: boolean` field to allow consumers to override the default state.

#### Scenario: Type allows collapsed override
- **WHEN** a consumer sets `group.collapsed = true` on a returned sidebar group
- **THEN** TypeScript does not produce a type error
