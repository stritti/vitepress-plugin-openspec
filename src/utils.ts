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
      specs.push({
        name: entry.name,
        specPath,
        content: fs.readFileSync(specPath, 'utf-8'),
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
        dir: changeDir,
        artifacts: readArtifacts(changeDir),
        createdDate: formatDate(meta.created),
        archivedDate,
      })
    }
  }

  return { dir: resolved, specs, changes, archivedChanges }
}

// ---------------------------------------------------------------------------
// Page generators
// ---------------------------------------------------------------------------

/**
 * Generates VitePress Markdown for a canonical capability spec page.
 */
export function generateSpecPage(spec: CapabilitySpec): string {
  const lines: string[] = []
  lines.push(`# ${spec.name}`)
  lines.push('')
  lines.push(spec.content.trimEnd())
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
      lines.push(`- [${spec.name}](/${outDir}/specs/${spec.name}/)`)
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
  lines.push(`# ${change.name}`)
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
  const prefix = change.archivedDate
    ? `/${outDir}/changes/archive/${change.archivedDate}-${change.name}`
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
      lines.push(`- [${change.name}](/${outDir}/changes/${change.name}/)${date}`)
    }
  }

  if (folder.archivedChanges.length > 0) {
    lines.push('')
    lines.push('## Archiv')
    lines.push('')
    for (const change of folder.archivedChanges) {
      const date = change.archivedDate ? ` *(archiviert: ${change.archivedDate})*` : ''
      lines.push(
        `- [${change.name}](/${outDir}/changes/archive/${change.archivedDate}-${change.name}/)${date}`,
      )
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Navigation helpers
// ---------------------------------------------------------------------------

function changeItems(change: Change, outDir: string, isArchived = false): SidebarItem[] {
  const prefix = isArchived
    ? `/${outDir}/changes/archive/${change.archivedDate}-${change.name}`
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
  const folder = readOpenSpecFolder(specDir)
  const groups: SidebarItem[] = []

  // Specifications group
  groups.push({
    text: 'Specifications',
    collapsed: false,
    items: [
      { text: 'Overview', link: `/${outDir}/specs/` },
      ...folder.specs.map((s) => ({ text: s.name, link: `/${outDir}/specs/${s.name}/` })),
    ],
  })

  // Changes group
  groups.push({
    text: 'Changes',
    collapsed: false,
    items: [
      { text: 'Overview', link: `/${outDir}/changes/` },
      ...folder.changes.map((c) => ({
        text: c.name,
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
        text: c.name,
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
): NavItem {
  const outDir = options.outDir ?? 'openspec'
  if (!fs.existsSync(path.resolve(specDir))) {
    throw new Error(
      `[vitepress-plugin-openspec] openspec directory not found: ${path.resolve(specDir)}`,
    )
  }
  return {
    text: options.text ?? 'Docs',
    link: `/${outDir}/`,
  }
}
