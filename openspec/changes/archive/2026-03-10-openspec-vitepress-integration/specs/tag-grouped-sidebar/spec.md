## ADDED Requirements

### Requirement: Sidebar items are grouped by OpenAPI tag
`generateSidebarFromSpec()` SHALL return an array of VitePress sidebar group objects where each group corresponds to one OpenAPI tag, with the tag's operations as child items.

#### Scenario: Tagged endpoints grouped into sidebar groups
- **WHEN** a spec has endpoints tagged with `pets` and `store`
- **THEN** the sidebar contains two groups: `{ text: 'pets', collapsed: false, items: [...] }` and `{ text: 'store', collapsed: false, items: [...] }`

#### Scenario: Groups are sorted alphabetically by tag name
- **WHEN** a spec has tags `[zebra, alpha, mango]`
- **THEN** sidebar groups appear in order `alpha`, `mango`, `zebra`

### Requirement: Untagged endpoints are collected under a fallback group
Operations without any tag SHALL be placed under a group with the text `"Other"`.

#### Scenario: Untagged operation appears in Other group
- **WHEN** a spec has an operation with no `tags` field
- **THEN** the sidebar contains a group `{ text: 'Other', collapsed: false, items: [...] }` containing that operation's item

### Requirement: Each sidebar group is collapsed-false by default
Every tag group returned by `generateSidebarFromSpec()` SHALL have `collapsed: false` so sections render expanded by default in VitePress.

#### Scenario: Default collapsed state
- **WHEN** `generateSidebarFromSpec()` is called with any valid spec
- **THEN** every returned group object has `collapsed: false`

### Requirement: SidebarItem type includes collapsed field
The `SidebarItem` TypeScript interface SHALL include an optional `collapsed?: boolean` field to allow consumers to override the default expanded state.

#### Scenario: Type allows collapsed override
- **WHEN** a consumer sets `group.collapsed = true` on a returned sidebar group
- **THEN** TypeScript does not produce a type error
