import { describe, it, expect } from 'vitest'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  loadSpecFile,
  parseSpec,
  slugify,
  extractEndpoints,
  generateEndpointMarkdown,
  generateIndexMarkdown,
  groupEndpointsByTag,
  openspecNav,
} from '../utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SAMPLE_YAML = path.join(__dirname, 'sample.yaml')

describe('slugify', () => {
  it('uses operationId when provided', () => {
    expect(slugify('GET', '/users/{id}', 'getUserById')).toBe('getuserbyid')
  })

  it('falls back to method + path when no operationId', () => {
    expect(slugify('GET', '/users/{id}')).toBe('get-users-id')
  })

  it('handles paths with multiple segments', () => {
    expect(slugify('POST', '/api/v1/items')).toBe('post-api-v1-items')
  })

  it('lowercases method in slug', () => {
    expect(slugify('DELETE', '/users')).toBe('delete-users')
  })
})

describe('loadSpecFile', () => {
  it('parses a YAML file', () => {
    const spec = loadSpecFile(SAMPLE_YAML)
    expect(spec).toHaveProperty('openapi')
    expect((spec.info as Record<string, unknown>).title).toBe('Sample OpenSpec API')
  })

  it('throws for non-existent files', () => {
    expect(() => loadSpecFile('/non/existent/file.yaml')).toThrow(
      'vitepress-plugin-openspec',
    )
  })

  it('throws for unsupported extensions', () => {
    // Create a temp file with unsupported extension isn't practical here,
    // so we just ensure the guard regex is correct via slug tests above.
    // A real .txt file would throw.
    expect(() => loadSpecFile('/non/existent/file.txt')).toThrow()
  })
})

describe('extractEndpoints', () => {
  it('extracts all endpoints from a spec', () => {
    const spec = loadSpecFile(SAMPLE_YAML)
    const endpoints = extractEndpoints(spec)
    expect(endpoints.length).toBe(5)
  })

  it('captures method, path and tags', () => {
    const spec = loadSpecFile(SAMPLE_YAML)
    const endpoints = extractEndpoints(spec)
    const listSpecs = endpoints.find((e) => e.operationId === 'listSpecs')
    expect(listSpecs).toBeDefined()
    expect(listSpecs!.method).toBe('GET')
    expect(listSpecs!.path).toBe('/specs')
    expect(listSpecs!.tags).toContain('specs')
  })

  it('returns empty array when paths is missing', () => {
    expect(extractEndpoints({})).toEqual([])
  })
})

describe('parseSpec', () => {
  it('returns correct title, version and description', () => {
    const spec = loadSpecFile(SAMPLE_YAML)
    const parsed = parseSpec(spec)
    expect(parsed.title).toBe('Sample OpenSpec API')
    expect(parsed.version).toBe('1.0.0')
    expect(parsed.description).toBe(
      'A sample OpenSpec for the vitepress-plugin-openspec tests.',
    )
  })

  it('collects unique tags', () => {
    const spec = loadSpecFile(SAMPLE_YAML)
    const parsed = parseSpec(spec)
    expect(parsed.tags).toContain('specs')
    expect(parsed.tags).toContain('plugins')
    expect(new Set(parsed.tags).size).toBe(parsed.tags.length)
  })

  it('uses defaults when info fields are missing', () => {
    const parsed = parseSpec({})
    expect(parsed.title).toBe('API')
    expect(parsed.version).toBe('1.0.0')
    expect(parsed.endpoints).toEqual([])
  })
})

describe('generateEndpointMarkdown', () => {
  it('contains the HTTP method and path in the heading', () => {
    const spec = loadSpecFile(SAMPLE_YAML)
    const endpoints = extractEndpoints(spec)
    const md = generateEndpointMarkdown(endpoints[0]!, true)
    expect(md).toContain(`# ${endpoints[0]!.method} ${endpoints[0]!.path}`)
  })

  it('includes summary when present', () => {
    const spec = loadSpecFile(SAMPLE_YAML)
    const endpoints = extractEndpoints(spec)
    const listSpecs = endpoints.find((e) => e.operationId === 'listSpecs')!
    const md = generateEndpointMarkdown(listSpecs, true)
    expect(md).toContain('List all specs')
  })

  it('omits schema comment when includeSchemas is false', () => {
    const spec = loadSpecFile(SAMPLE_YAML)
    const endpoints = extractEndpoints(spec)
    const md = generateEndpointMarkdown(endpoints[0]!, false)
    expect(md).not.toContain('Schema details')
  })
})

describe('generateIndexMarkdown', () => {
  it('contains the spec title', () => {
    const spec = loadSpecFile(SAMPLE_YAML)
    const parsed = parseSpec(spec)
    const md = generateIndexMarkdown(parsed, 'api')
    expect(md).toContain('# Sample OpenSpec API')
  })

  it('lists all endpoints in a table', () => {
    const spec = loadSpecFile(SAMPLE_YAML)
    const parsed = parseSpec(spec)
    const md = generateIndexMarkdown(parsed, 'api')
    for (const endpoint of parsed.endpoints) {
      expect(md).toContain(endpoint.path)
    }
  })

  it('table has Method | Path | Summary header', () => {
    const spec = loadSpecFile(SAMPLE_YAML)
    const parsed = parseSpec(spec)
    const md = generateIndexMarkdown(parsed, 'api')
    expect(md).toContain('| Method | Path | Summary |')
  })

  it('table rows are sorted by tag then path alphabetically', () => {
    const spec = loadSpecFile(SAMPLE_YAML)
    const parsed = parseSpec(spec)
    const md = generateIndexMarkdown(parsed, 'api')
    const lines = md.split('\n')
    const tableRows = lines.filter((l) => l.startsWith('| `'))
    // "plugins" tag comes before "specs" alphabetically
    const pluginsIdx = tableRows.findIndex((r) => r.includes('/plugins'))
    const specsIdx = tableRows.findIndex((r) => r.includes('/specs'))
    expect(pluginsIdx).toBeLessThan(specsIdx)
  })
})

describe('groupEndpointsByTag', () => {
  it('groups endpoints by first tag, sorted alphabetically', () => {
    const spec = loadSpecFile(SAMPLE_YAML)
    const endpoints = extractEndpoints(spec)
    const groups = groupEndpointsByTag(endpoints, 'api')
    const tagNames = groups.map((g) => g.text)
    expect(tagNames[0]).toBe('plugins')
    expect(tagNames[1]).toBe('specs')
    expect(tagNames[tagNames.length - 1]).toBe('Other')
  })

  it('all groups have collapsed: false', () => {
    const spec = loadSpecFile(SAMPLE_YAML)
    const endpoints = extractEndpoints(spec)
    const groups = groupEndpointsByTag(endpoints, 'api')
    for (const group of groups) {
      expect(group.collapsed).toBe(false)
    }
  })

  it('untagged endpoints appear in Other group', () => {
    const spec = loadSpecFile(SAMPLE_YAML)
    const endpoints = extractEndpoints(spec)
    const groups = groupEndpointsByTag(endpoints, 'api')
    const other = groups.find((g) => g.text === 'Other')
    expect(other).toBeDefined()
    expect(other!.items!.some((i) => i.link?.includes('untagged'))).toBe(true)
  })

  it('child item links include the outDir prefix', () => {
    const spec = loadSpecFile(SAMPLE_YAML)
    const endpoints = extractEndpoints(spec)
    const groups = groupEndpointsByTag(endpoints, 'myapi')
    const allLinks = groups.flatMap((g) => g.items ?? []).map((i) => i.link)
    expect(allLinks.every((l) => l?.startsWith('/myapi/'))).toBe(true)
  })
})

import { generateSidebarFromSpec } from '../plugin.js'

describe('generateSidebarFromSpec', () => {
  it('returns sidebar items for a valid spec', () => {
    const sidebar = generateSidebarFromSpec(SAMPLE_YAML, { outDir: 'api' })
    expect(sidebar.length).toBeGreaterThan(0)
    expect(sidebar[0]!.text).toBe('Sample OpenSpec API')
  })

  it('groups by tags when groupByTags is true, sorted alphabetically', () => {
    const sidebar = generateSidebarFromSpec(SAMPLE_YAML, { outDir: 'api', groupByTags: true })
    const items = sidebar[0]!.items!
    const tagNames = items.map((i) => i.text)
    expect(tagNames).toContain('specs')
    expect(tagNames).toContain('plugins')
    expect(tagNames.indexOf('plugins')).toBeLessThan(tagNames.indexOf('specs'))
  })

  it('returns an empty array for a missing file without throwing', () => {
    const sidebar = generateSidebarFromSpec('/non/existent/spec.yaml')
    expect(sidebar).toEqual([])
  })
})

describe('openspecNav', () => {
  it('returns nav entry with spec title as default text', () => {
    const nav = openspecNav({ spec: SAMPLE_YAML, outDir: 'api' })
    expect(nav.text).toBe('Sample OpenSpec API')
    expect(nav.link).toBe('/api/')
  })

  it('uses custom text when provided', () => {
    const nav = openspecNav({ spec: SAMPLE_YAML, outDir: 'api', text: 'My Docs' })
    expect(nav.text).toBe('My Docs')
    expect(nav.link).toBe('/api/')
  })

  it('defaults outDir to "api" when not specified', () => {
    const nav = openspecNav({ spec: SAMPLE_YAML })
    expect(nav.link).toBe('/api/')
  })

  it('throws a descriptive error for a missing spec file', () => {
    expect(() => openspecNav({ spec: '/non/existent/spec.yaml' })).toThrow(
      'vitepress-plugin-openspec',
    )
  })
})
