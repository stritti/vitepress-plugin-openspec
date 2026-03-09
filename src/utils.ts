import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import type { ParsedEndpoint, ParsedSpec } from './types.js'

/**
 * Reads and parses an OpenAPI spec file (JSON or YAML).
 * Throws if the file cannot be read or parsed.
 */
export function loadSpecFile(filePath: string): Record<string, unknown> {
  const resolved = path.resolve(filePath)
  if (!fs.existsSync(resolved)) {
    throw new Error(`[vitepress-plugin-openspec] Spec file not found: ${resolved}`)
  }

  const content = fs.readFileSync(resolved, 'utf-8')
  const ext = path.extname(resolved).toLowerCase()

  if (ext === '.json') {
    return JSON.parse(content) as Record<string, unknown>
  }

  if (ext === '.yaml' || ext === '.yml') {
    return yaml.load(content) as Record<string, unknown>
  }

  throw new Error(
    `[vitepress-plugin-openspec] Unsupported file extension "${ext}". Use .json, .yaml, or .yml.`,
  )
}

/**
 * Converts a method + path string into a URL-safe slug.
 *
 * @example slugify('GET', '/users/{id}') => 'get-users-id'
 */
export function slugify(method: string, endpointPath: string, operationId?: string): string {
  if (operationId) {
    return operationId
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
  }

  const pathSlug = endpointPath
    .replace(/\{([^}]+)\}/g, '$1')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

  return `${method.toLowerCase()}-${pathSlug}`
}

/**
 * Extracts all endpoints from a raw OpenAPI spec object.
 * Supports both OpenAPI 3.x and Swagger 2.x.
 */
export function extractEndpoints(spec: Record<string, unknown>): ParsedEndpoint[] {
  const endpoints: ParsedEndpoint[] = []
  const paths = spec.paths as Record<string, Record<string, unknown>> | undefined

  if (!paths) return endpoints

  const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']

  for (const [endpointPath, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue

    for (const method of httpMethods) {
      const operation = pathItem[method] as Record<string, unknown> | undefined
      if (!operation) continue

      const tags = Array.isArray(operation.tags)
        ? (operation.tags as string[])
        : []

      endpoints.push({
        method: method.toUpperCase(),
        path: endpointPath,
        summary: operation.summary as string | undefined,
        description: operation.description as string | undefined,
        tags,
        operationId: operation.operationId as string | undefined,
        slug: slugify(method, endpointPath, operation.operationId as string | undefined),
      })
    }
  }

  return endpoints
}

/**
 * Parses a raw OpenAPI spec object into a structured {@link ParsedSpec}.
 */
export function parseSpec(spec: Record<string, unknown>): ParsedSpec {
  const info = (spec.info ?? {}) as Record<string, unknown>
  const title = (info.title as string | undefined) ?? 'API'
  const version = (info.version as string | undefined) ?? '1.0.0'
  const description = info.description as string | undefined

  const endpoints = extractEndpoints(spec)
  const tags = [...new Set(endpoints.flatMap((e) => e.tags))]

  return { title, version, description, endpoints, tags }
}

/**
 * Generates the Markdown content for an individual endpoint page.
 */
export function generateEndpointMarkdown(
  endpoint: ParsedEndpoint,
  includeSchemas: boolean,
): string {
  const lines: string[] = []

  lines.push(`# ${endpoint.method} ${endpoint.path}`)
  lines.push('')

  if (endpoint.summary) {
    lines.push(`> ${endpoint.summary}`)
    lines.push('')
  }

  if (endpoint.description) {
    lines.push(endpoint.description)
    lines.push('')
  }

  lines.push('## Details')
  lines.push('')
  lines.push(`| Field | Value |`)
  lines.push(`| --- | --- |`)
  lines.push(`| **Method** | \`${endpoint.method}\` |`)
  lines.push(`| **Path** | \`${endpoint.path}\` |`)

  if (endpoint.operationId) {
    lines.push(`| **Operation ID** | \`${endpoint.operationId}\` |`)
  }

  if (endpoint.tags.length > 0) {
    lines.push(`| **Tags** | ${endpoint.tags.join(', ')} |`)
  }

  lines.push('')

  if (includeSchemas) {
    lines.push('<!-- Schema details can be rendered here via a Vue component -->')
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Generates the Markdown content for the API overview/index page.
 */
export function generateIndexMarkdown(parsed: ParsedSpec, outDir: string): string {
  const lines: string[] = []

  lines.push(`# ${parsed.title}`)
  lines.push('')

  if (parsed.description) {
    lines.push(parsed.description)
    lines.push('')
  }

  lines.push(`**Version:** ${parsed.version}`)
  lines.push('')
  lines.push(`**Endpoints:** ${parsed.endpoints.length}`)
  lines.push('')

  if (parsed.tags.length > 0) {
    lines.push('## Tags')
    lines.push('')
    for (const tag of parsed.tags) {
      lines.push(`- ${tag}`)
    }
    lines.push('')
  }

  lines.push('## Endpoints')
  lines.push('')
  lines.push('| Method | Path | Summary |')
  lines.push('| --- | --- | --- |')

  for (const endpoint of parsed.endpoints) {
    const link = `[${endpoint.path}](${outDir}/${endpoint.slug})`
    const summary = endpoint.summary ?? ''
    lines.push(`| \`${endpoint.method}\` | ${link} | ${summary} |`)
  }

  lines.push('')

  return lines.join('\n')
}
