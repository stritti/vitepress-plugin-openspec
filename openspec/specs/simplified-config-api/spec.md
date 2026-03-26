### Requirement: withOpenSpec wraps a VitePress config
The system SHALL provide a `withOpenSpec(config, options?)` function that accepts a VitePress `UserConfig` object, calls `generateOpenSpecPages()` synchronously, and returns the config with the openspec Vite plugin, nav entry, and sidebar section merged in.

#### Scenario: Zero-argument usage uses defaults
- **WHEN** `withOpenSpec({})` is called with no options
- **THEN** it resolves `specDir` to `'./openspec'` and `srcDir` to `process.cwd()`, runs page generation, and returns the config augmented with the Vite plugin

#### Scenario: Nav entry is prepended by default
- **WHEN** `withOpenSpec({ themeConfig: { nav: [] } })` is called
- **THEN** the returned config's `themeConfig.nav` array contains the openspec nav item as its first element

#### Scenario: Sidebar section is injected by default
- **WHEN** `withOpenSpec({ themeConfig: { sidebar: {} } })` is called
- **THEN** the returned config's `themeConfig.sidebar` contains a key `'/openspec/'` with the generated sidebar items

#### Scenario: Nav injection can be disabled
- **WHEN** `withOpenSpec(config, { nav: false })` is called
- **THEN** the returned config's `themeConfig.nav` is not modified by the plugin

#### Scenario: Sidebar injection can be disabled
- **WHEN** `withOpenSpec(config, { sidebar: false })` is called
- **THEN** the returned config's `themeConfig.sidebar` is not modified by the plugin

#### Scenario: Vite plugin is always merged
- **WHEN** `withOpenSpec` is called with any options
- **THEN** the returned config's `vite.plugins` array contains the openspec Vite plugin

#### Scenario: Existing Vite plugins are preserved
- **WHEN** `withOpenSpec({ vite: { plugins: [myPlugin] } })` is called
- **THEN** the returned config's `vite.plugins` array contains both `myPlugin` and the openspec plugin

#### Scenario: outDir option controls sidebar key and nav link
- **WHEN** `withOpenSpec(config, { outDir: 'project-docs' })` is called
- **THEN** the sidebar key is `'/project-docs/'` and the nav link points to `/project-docs/`

### Requirement: withOpenSpec is exported from the package root
The system SHALL export `withOpenSpec` from `vitepress-plugin-openspec` so it can be imported alongside existing exports.

#### Scenario: Named import works
- **WHEN** a user writes `import { withOpenSpec } from 'vitepress-plugin-openspec'`
- **THEN** the import resolves to the `withOpenSpec` function without errors
