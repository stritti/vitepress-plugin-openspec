import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import type {
  CapabilitySpec,
  Change,
  ChangeArtifact,
  NavItem,
  OpenSpecFolder,
  SidebarItem,
} from './types.js'

// ---------------------------------------------------------------------------
// Folder reader
// ---------------------------------------------------------------------------

function readOpenSpecYaml(dir: string): Record<string, unknown> {
  const yamlPath = path.join(dir, '.openspec.yaml')
  if (!fs.existsSync(yamlPath)) return {}
  try {
    return (yaml.load(fs.readFileSync(yamlPath, 'utf-8')) ?? {}) as Record<string, unknown>
  } catch {
    return {}
  }
}

const ACRONYM_DICT: Record<string, string> = {
  api: 'API',
  rest: 'REST',
  graphql: 'GraphQL',
  grpc: 'gRPC',
  openapi: 'OpenAPI',
  oauth: 'OAuth',
  oauth2: 'OAuth2',
  http: 'HTTP',
  https: 'HTTPS',
  url: 'URL',
  uri: 'URI',
  sdk: 'SDK',
  ui: 'UI',
  ux: 'UX',
  id: 'ID',
  db: 'DB',
  sql: 'SQL',
  css: 'CSS',
  html: 'HTML',
  json: 'JSON',
  yaml: 'YAML',
  xml: 'XML',
  jwt: 'JWT',
  ci: 'CI',
  cd: 'CD',
}

function humanizeLabel(name: string): string {
  if (!name) return ''
  return name
    .split('-')
    .map((word) => {
      if (/^v\d+$/.test(word)) return word
      return ACRONYM_DICT[word] ?? (word.charAt(0).toUpperCase() + word.slice(1))
    })
    .join(' ')
}

function parseFrontmatterTitle(content: string): string | undefined {
  const match = content.match(/^---\s*\n(?:.*\n)*?title:\s*['"]?([^\n'"]+)['"]?\s*\n/)
  return match?.[1]?.trim() || undefined
}

function formatDate(val: unknown): string | undefined {
  if (!val) return undefined
  if (val instanceof Date) return val.toISOString().slice(0, 10)
  return String(val)
}

function readArtifacts(dir: string): ChangeArtifact[] {
  const artifacts: ChangeArtifact[] = []
  for (const name of ['proposal', 'design', 'tasks'] as ChangeArtifact[]) {
    if (fs.existsSync(path.join(dir, `${name}.md`))) artifacts.push(name)
  }
  return artifacts
}

/**
 * Scans an openspec/ directory and returns a structured representation of all
 * canonical specs, active changes, and archived changes.
 *
 * Throws if the directory does not exist.
 */
export function readOpenSpecFolder(dir: string): OpenSpecFolder {
  const resolved = path.resolve(dir)
  if (!fs.existsSync(resolved)) {
    throw new Error(`[vitepress-plugin-openspec] openspec directory not found: ${resolved}`)
  }

  // --- Canonical specs ---
  const specs: CapabilitySpec[] = []
  const specsDir = path.join(resolved, 'specs')
  if (fs.existsSync(specsDir)) {
    for (const entry of fs.readdirSync(specsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const specPath = path.join(specsDir, entry.name, 'spec.md')
      if (!fs.existsSync(specPath)) continue
      const content = fs.readFileSync(specPath, 'utf-8')
      specs.push({
        name: entry.name,
        title: parseFrontmatterTitle(content),
        specPath,
        content,
      })
    }
  }

  // --- Active changes ---
  const changes: Change[] = []
  const changesDir = path.join(resolved, 'changes')
  if (fs.existsSync(changesDir)) {
    for (const entry of fs.readdirSync(changesDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === 'archive') continue
      const changeDir = path.join(changesDir, entry.name)
      if (!fs.existsSync(path.join(changeDir, '.openspec.yaml'))) continue
      const meta = readOpenSpecYaml(changeDir)
      changes.push({
        name: entry.name,
        title: meta.title ? String(meta.title) : undefined,
        dir: changeDir,
        artifacts: readArtifacts(changeDir),
        createdDate: formatDate(meta.created),
      })
    }
  }

  // --- Archived changes ---
  const archivedChanges: Change[] = []
  const archiveDir = path.join(changesDir, 'archive')
  if (fs.existsSync(archiveDir)) {
    for (const entry of fs.readdirSync(archiveDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const changeDir = path.join(archiveDir, entry.name)
      // Parse YYYY-MM-DD-<name> format
      const match = entry.name.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/)
      const archivedDate = match?.[1]
      const name = match?.[2] ?? entry.name
      const meta = readOpenSpecYaml(changeDir)
      archivedChanges.push({
        name,
        title: meta.title ? String(meta.title) : undefined,
        dir: changeDir,
        artifacts: readArtifacts(changeDir),
        createdDate: formatDate(meta.created),
        archivedDate,
        archiveFolderName: entry.name,
      })
    }
  }

  return { dir: resolved, specs, changes, archivedChanges }
}

// ---------------------------------------------------------------------------
// Spec content transformations
// ---------------------------------------------------------------------------

function extractSpecDescription(content: string): string | undefined {
  const reqMatch = content.match(/^### Requirement:[^\n]*\n+([\s\S]*?)(?=\n#{1,4} |\n*$)/m)
  if (!reqMatch) return undefined
  const para = reqMatch[1].trim()
  if (!para) return undefined
  const sentenceMatch = para.match(/^([^.?!]+[.?!])/)
  if (!sentenceMatch) return undefined
  let sentence = sentenceMatch[1].trim()
  if (sentence.length > 160) {
    const cut = sentence.lastIndexOf(' ', 160)
    sentence = (cut > 0 ? sentence.slice(0, cut) : sentence.slice(0, 160)) + '…'
  }
  return sentence.replace(/"/g, '\\"')
}

function stripDeltaMarkers(content: string): string {
  const stripped = content
    .split('\n')
    .filter((line) => !/^## (ADDED|MODIFIED|REMOVED) Requirements\s*$/.test(line))
    .join('\n')
  // Collapse consecutive blank lines to a single blank line
  return stripped.replace(/\n{3,}/g, '\n\n')
}

function transformScenarios(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []
  let inScenario = false

  for (const line of lines) {
    const scenarioMatch = line.match(/^#### Scenario: (.+)$/)
    const isHeading = /^#{1,6} /.test(line)

    if (scenarioMatch) {
      if (inScenario) result.push(':::')
      result.push(`:::details ${scenarioMatch[1]}`)
      inScenario = true
    } else if (isHeading && inScenario) {
      result.push(':::')
      result.push('')
      result.push(line)
      inScenario = false
    } else {
      result.push(line)
    }
  }

  if (inScenario) result.push(':::')
  return result.join('\n')
}

// ---------------------------------------------------------------------------
// Page generators
// ---------------------------------------------------------------------------

/**
 * Generates VitePress Markdown for a canonical capability spec page.
 */
export function generateSpecPage(spec: CapabilitySpec): string {
  const description = extractSpecDescription(spec.content)
  const transformed = transformScenarios(stripDeltaMarkers(spec.content))
  const lines: string[] = []
  if (description) {
    lines.push('---')
    lines.push(`description: "${description}"`)
    lines.push('---')
    lines.push('')
  }
  lines.push(`# ${spec.title ?? humanizeLabel(spec.name)}`)
  lines.push('')
  lines.push(transformed.trimEnd())
  lines.push('')
  return lines.join('\n')
}

/**
 * Generates the index page listing all canonical specs.
 */
export function generateSpecsIndexPage(specs: CapabilitySpec[], outDir: string): string {
  const lines: string[] = []
  lines.push('# Specifications')
  lines.push('')
  lines.push('Canonical capability specifications for this project.')
  lines.push('')
  if (specs.length === 0) {
    lines.push('*No specifications defined yet.*')
  } else {
    for (const spec of specs) {
      lines.push(`- [${spec.title ?? humanizeLabel(spec.name)}](/${outDir}/specs/${spec.name}/)`)
    }
  }
  lines.push('')
  return lines.join('\n')
}

/**
 * Generates the index page for a single change.
 */
export function generateChangeIndexPage(change: Change, outDir: string): string {
  const lines: string[] = []
  lines.push(`# ${change.title ?? humanizeLabel(change.name)}`)
  lines.push('')
  if (change.createdDate) {
    lines.push(`**Created:** ${change.createdDate}`)
    lines.push('')
  }
  if (change.archivedDate) {
    lines.push(`**Archived:** ${change.archivedDate}`)
    lines.push('')
  }
  lines.push('## Artifacts')
  lines.push('')
  const prefix = change.archiveFolderName
    ? `/${outDir}/changes/archive/${change.archiveFolderName}`
    : `/${outDir}/changes/${change.name}`
  for (const artifact of change.artifacts) {
    const label = artifact.charAt(0).toUpperCase() + artifact.slice(1)
    lines.push(`- [${label}](${prefix}/${artifact})`)
  }
  lines.push('')
  return lines.join('\n')
}

/**
 * Generates the changes overview page listing active and archived changes.
 */
export function generateChangesIndexPage(folder: OpenSpecFolder, outDir: string): string {
  const lines: string[] = []
  lines.push('# Changes')
  lines.push('')

  if (folder.changes.length === 0) {
    lines.push('*No active changes.*')
  } else {
    lines.push('## Active')
    lines.push('')
    for (const change of folder.changes) {
      const date = change.createdDate ? ` *(${change.createdDate})*` : ''
      lines.push(`- [${change.title ?? humanizeLabel(change.name)}](/${outDir}/changes/${change.name}/)${date}`)
    }
  }

  if (folder.archivedChanges.length > 0) {
    lines.push('')
    lines.push('## Archiv')
    lines.push('')
    for (const change of folder.archivedChanges) {
      const date = change.archivedDate ? ` *(archiviert: ${change.archivedDate})*` : ''
      lines.push(
        `- [${change.title ?? humanizeLabel(change.name)}](/${outDir}/changes/archive/${change.archiveFolderName}/)${date}`,
      )
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Artifact link rewriting
// ---------------------------------------------------------------------------

/**
 * Rewrites relative markdown links in an artifact file's content so that they
 * use absolute VitePress paths instead of paths relative to the original
 * openspec source directory.
 *
 * When artifact files (proposal.md, design.md, tasks.md) are copied from the
 * openspec source directory into the VitePress output directory, any relative
 * links they contain that reference other files within the openspec directory
 * must be rewritten to absolute VitePress paths — otherwise VitePress will
 * report them as dead links.
 *
 * Links that point outside the openspec root, absolute paths, HTTP URLs, and
 * anchor-only links are left unchanged.
 *
 * @param content - The markdown content of the artifact file.
 * @param srcFilePath - The absolute path of the source artifact file.
 * @param openspecRootDir - The absolute path of the openspec root directory.
 * @param outDir - The VitePress output directory name (e.g. `"openspec"`).
 * @returns The content with rewritten links.
 */
export function rewriteRelativeLinks(
  content: string,
  srcFilePath: string,
  openspecRootDir: string,
  outDir: string,
): string {
  const srcDir = path.dirname(srcFilePath)

  return content.replace(
    /(\[[^\]]*\])\(([^)]+)\)/g,
    (_match, linkText: string, urlPart: string) => {
      // Separate the URL from an optional quoted title: url "title" or url 'title'
      const titleMatch = urlPart.match(/^(.+?)(\s+["'][^"']*["'])?\s*$/)
      if (!titleMatch) return _match
      const rawUrl = titleMatch[1].trim()
      const title = titleMatch[2] ?? ''

      // Leave non-relative URLs unchanged
      if (
        !rawUrl ||
        rawUrl.startsWith('http://') ||
        rawUrl.startsWith('https://') ||
        rawUrl.startsWith('//') ||
        rawUrl.startsWith('/') ||
        rawUrl.startsWith('#') ||
        rawUrl.startsWith('mailto:') ||
        rawUrl.startsWith('tel:')
      ) {
        return _match
      }

      // Separate the path component from any trailing fragment (#anchor)
      const hashIdx = rawUrl.indexOf('#')
      const urlWithoutFragment = hashIdx >= 0 ? rawUrl.slice(0, hashIdx) : rawUrl
      const fragment = hashIdx >= 0 ? rawUrl.slice(hashIdx) : ''

      if (!urlWithoutFragment) {
        // Pure anchor link — leave as-is
        return _match
      }

      // Resolve the relative path against the source file's directory
      const resolvedPath = path.resolve(srcDir, urlWithoutFragment)

      // Only rewrite links that remain within the openspec root directory
      const relToOpenspec = path.relative(openspecRootDir, resolvedPath)
      if (relToOpenspec.startsWith('..') || path.isAbsolute(relToOpenspec)) {
        return _match
      }

      // Build the absolute VitePress path, stripping any .md extension
      const vitePath = relToOpenspec.replace(/\.md$/, '').replace(/\\/g, '/')
      const absoluteLink = `/${path.join(outDir, vitePath).replace(/\\/g, '/')}${fragment}`

      return `${linkText}(${absoluteLink}${title})`
    },
  )
}

// ---------------------------------------------------------------------------
// Navigation helpers
// ---------------------------------------------------------------------------

function changeItems(change: Change, outDir: string, isArchived = false): SidebarItem[] {
  const prefix = isArchived
    ? `/${outDir}/changes/archive/${change.archiveFolderName}`
    : `/${outDir}/changes/${change.name}`
  return change.artifacts.map((a) => ({
    text: a.charAt(0).toUpperCase() + a.slice(1),
    link: `${prefix}/${a}`,
  }))
}

/**
 * Returns a VitePress sidebar configuration for the OpenSpec documentation.
 * Includes groups for Specifications, active Changes, and archived Changes.
 */
export function generateOpenSpecSidebar(
  specDir: string,
  options: { outDir?: string } = {},
): SidebarItem[] {
  const outDir = options.outDir ?? 'openspec'
  if (!fs.existsSync(path.resolve(specDir))) {
    console.warn(`[vitepress-plugin-openspec] openspec directory not found: ${path.relative(process.cwd(), path.resolve(specDir))} — skipping sidebar generation`)
    return []
  }
  const folder = readOpenSpecFolder(specDir)
  const groups: SidebarItem[] = []

  // Specifications group
  groups.push({
    text: 'Specifications',
    collapsed: false,
    items: [
      { text: 'Overview', link: `/${outDir}/specs/` },
      ...folder.specs.map((s) => ({ text: s.title ?? humanizeLabel(s.name), link: `/${outDir}/specs/${s.name}/` })),
    ],
  })

  // Changes group
  groups.push({
    text: 'Changes',
    collapsed: false,
    items: [
      { text: 'Overview', link: `/${outDir}/changes/` },
      ...folder.changes.map((c) => ({
        text: c.title ?? humanizeLabel(c.name),
        collapsed: true,
        items: changeItems(c, outDir),
      })),
    ],
  })

  // Archive group (only if non-empty)
  if (folder.archivedChanges.length > 0) {
    groups.push({
      text: 'Archiv',
      collapsed: true,
      items: folder.archivedChanges.map((c) => ({
        text: c.title ?? humanizeLabel(c.name),
        collapsed: true,
        items: changeItems(c, outDir, true),
      })),
    })
  }

  return groups
}

/**
 * Returns a VitePress nav entry for the OpenSpec documentation section.
 */
export function openspecNav(
  specDir: string,
  options: { outDir?: string; text?: string } = {},
): NavItem | null {
  const outDir = options.outDir ?? 'openspec'
  if (!fs.existsSync(path.resolve(specDir))) {
    console.warn(`[vitepress-plugin-openspec] openspec directory not found: ${path.relative(process.cwd(), path.resolve(specDir))} — skipping nav generation`)
    return null
  }
  return {
    text: options.text ?? 'Docs',
    link: `/${outDir}/`,
  }
}
