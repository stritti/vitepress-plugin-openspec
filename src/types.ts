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
}

/**
 * Configuration options for the vitepress-plugin-openspec plugin.
 */
export interface OpenSpecPluginOptions {
  /**
   * Path to the openspec/ directory of the project.
   *
   * Use an explicit path when your `openspec/` folder is not at the project root
   * (e.g. when `config.ts` lives inside `docs/.vitepress/`).
   *
   * If the directory does not exist a warning is printed and the build continues
   * without generating any pages or nav/sidebar entries — no error is thrown.
   *
   * @default './openspec'
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
   * (i.e. the `docs/` folder). Required when calling `generateOpenSpecPages()`
   * at config evaluation time so it knows where to write the generated files.
   *
   * @default process.cwd()
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
