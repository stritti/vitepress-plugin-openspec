/**
 * Configuration options for the vitepress-plugin-openspec plugin.
 */
export interface OpenSpecPluginOptions {
  /**
   * Path(s) to OpenAPI specification file(s).
   * Supports JSON and YAML formats (OpenAPI 3.x and Swagger 2.x).
   *
   * @example
   * ```typescript
   * openspec({ spec: './openapi.yaml' })
   * openspec({ spec: ['./api-v1.yaml', './api-v2.json'] })
   * ```
   */
  spec: string | string[]

  /**
   * Output directory (relative to VitePress `srcDir`) where the generated
   * Markdown pages will be written.
   *
   * @default 'api'
   */
  outDir?: string

  /**
   * Title prefix shown in the generated page headers.
   * When not set, the `info.title` from the spec is used.
   */
  title?: string

  /**
   * Whether to group endpoints by their first tag in the sidebar.
   *
   * @default true
   */
  groupByTags?: boolean

  /**
   * Whether to include request/response schema details in the generated pages.
   *
   * @default true
   */
  includeSchemas?: boolean

  /**
   * Whether to generate a sidebar configuration automatically.
   * The generated sidebar can be merged into your VitePress config.
   *
   * @default true
   */
  generateSidebar?: boolean
}

/**
 * Represents a single parsed API endpoint extracted from an OpenAPI spec.
 */
export interface ParsedEndpoint {
  /** HTTP method in uppercase (e.g. "GET", "POST") */
  method: string
  /** Path of the endpoint (e.g. "/users/{id}") */
  path: string
  /** Summary of the endpoint from the spec */
  summary?: string
  /** Detailed description of the endpoint */
  description?: string
  /** Tags associated with the endpoint */
  tags: string[]
  /** Operation ID from the spec */
  operationId?: string
  /** URL-safe slug derived from the operation ID or method+path */
  slug: string
}

/**
 * The result of parsing a single OpenAPI spec file.
 */
export interface ParsedSpec {
  /** Title from `info.title` */
  title: string
  /** Version from `info.version` */
  version: string
  /** Description from `info.description` */
  description?: string
  /** All endpoints found in the spec */
  endpoints: ParsedEndpoint[]
  /** All unique tags found in the spec */
  tags: string[]
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
