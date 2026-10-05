/**
 * Options for the `withOpenSpec()` config helper.
 * Extends `OpenSpecPluginOptions` with optional nav/sidebar merge controls.
 */
export interface WithOpenSpecOptions extends OpenSpecPluginOptions {
  /**
   * Whether to prepend an openspec nav entry to `themeConfig.nav`.
   * @default true
   */
  nav?: boolean

  /**
   * Whether to inject the openspec sidebar section into `themeConfig.sidebar`.
   * @default true
   */
  sidebar?: boolean
  /**
   * Label for the nav entry injected into `themeConfig.nav`.
   * @default 'Docs'
   */
  navText?: string
}

/**
 * Configuration options for the vitepress-plugin-openspec plugin.
 */
export interface OpenSpecPluginOptions {
  /**
   * Path to the openspec/ directory of the project.
   *
   * By default the plugin walks up from the current working directory looking
   * for an `openspec/` folder (skipping generated output recognized by its
   * marker), so no configuration is needed when it lives at the project root.
   * Set an explicit path only for custom locations.
   *
   * If the directory does not exist a warning is printed and the build continues
   * without generating any pages or nav/sidebar entries — no error is thrown.
   * An invalid `outDir` (absolute, empty, or escaping `srcDir`) throws instead.
   *
   * @default auto-detected (`<nearest ancestor>/openspec`, falling back to `'./openspec'`)
   * @example
   * // Resolving from docs/.vitepress/config.ts
   * import path from 'node:path'
   * import { fileURLToPath } from 'node:url'
   * const __dirname = path.dirname(fileURLToPath(import.meta.url))
   * const specDir = path.resolve(__dirname, '../../openspec')
   */
  specDir?: string

  /**
   * Output directory (relative to VitePress `srcDir`) where the generated
   * Markdown pages will be written.
   * @default 'openspec'
   */
  outDir?: string

  /**
   * VitePress source directory — the directory containing your `.md` files
   * (i.e. the `docs/` folder). By default the plugin detects the directory that
   * contains `.vitepress` (the working directory, a first-level subdirectory
   * such as `docs/`, or the parent when the config is evaluated from inside
   * `docs/.vitepress/`), so no configuration is needed for standard layouts.
   *
   * @default auto-detected (directory containing `.vitepress`, falling back to the working directory)
   * @example path.resolve(__dirname, '..')  // from docs/.vitepress/config.ts
   */
  srcDir?: string
}

/**
 * A canonical capability specification from openspec/specs/<name>/spec.md
 */
export interface CapabilitySpec {
  /** Folder name (kebab-case capability identifier) */
  name: string
  /** Optional display title from spec.md frontmatter. Overrides humanized name. */
  title?: string
  /** Absolute path to the spec.md file */
  specPath: string
  /** Raw Markdown content of the spec */
  content: string
}

/**
 * A single artifact (file) belonging to a Change.
 */
export type ChangeArtifact = 'proposal' | 'design' | 'tasks'

/**
 * An OpenSpec change (active or archived).
 */
export interface Change {
  /** Change directory name (e.g. "my-feature" or for archived: "my-feature" extracted from "2026-03-10-my-feature") */
  name: string
  /** Optional display title from .openspec.yaml. Overrides humanized name. */
  title?: string
  /** Absolute path to the change directory */
  dir: string
  /** Which artifact files are present */
  artifacts: ChangeArtifact[]
  /** Creation date from .openspec.yaml, if available */
  createdDate?: string
  /** For archived changes: the archive date (YYYY-MM-DD) parsed from directory name */
  archivedDate?: string
  /**
   * For archived changes: the original archive folder name (e.g. "2026-01-15-my-feature" or
   * "legacy-feature" for non-standard names). Used to build correct archive URLs.
   */
  archiveFolderName?: string
}

/**
 * The full parsed structure of an openspec/ directory.
 */
export interface OpenSpecFolder {
  /** Absolute path to the openspec/ root */
  dir: string
  /** Canonical capability specs from openspec/specs/ */
  specs: CapabilitySpec[]
  /** Active changes from openspec/changes/ (excluding archive/) */
  changes: Change[]
  /** Archived changes from openspec/changes/archive/ */
  archivedChanges: Change[]
}

/**
 * A nav item compatible with VitePress `DefaultTheme.NavItem`.
 */
export interface NavItem {
  text: string
  link: string
}

/**
 * A sidebar item compatible with VitePress `DefaultTheme.SidebarItem`.
 */
export interface SidebarItem {
  text: string
  link?: string
  collapsed?: boolean
  items?: SidebarItem[]
}
