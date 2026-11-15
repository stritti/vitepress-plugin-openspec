import fs from 'node:fs'
import path from 'node:path'
import type { Change, NavItem, SidebarItem } from '../types.js'
import { logWarn } from './logger.js'
import { humanizeLabel, readOpenSpecFolder } from './reader.js'
import { specTitle } from './markdown.js'

function resolveExistingSpecDir(specDir: string, context: string): string | undefined {
  const resolved = path.resolve(specDir)
  if (!fs.existsSync(resolved)) {
    logWarn(
      `openspec directory not found: ${path.relative(process.cwd(), resolved)} — skipping ${context}`,
    )
    return undefined
  }
  return resolved
}

function changeItems(change: Change, outDir: string): SidebarItem[] {
  const prefix = change.archiveFolderName
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
  const resolved = resolveExistingSpecDir(specDir, 'sidebar generation')
  if (!resolved) return []
  const folder = readOpenSpecFolder(resolved)
  const groups: SidebarItem[] = []

  groups.push({
    text: 'Specifications',
    collapsed: false,
    items: [
      { text: 'Overview', link: `/${outDir}/specs/` },
      ...folder.specs.map((s) => ({ text: specTitle(s), link: `/${outDir}/specs/${s.name}/` })),
    ],
  })

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

  if (folder.archivedChanges.length > 0) {
    groups.push({
      text: 'Archive',
      collapsed: true,
      items: folder.archivedChanges.map((c) => ({
        text: c.title ?? humanizeLabel(c.name),
        collapsed: true,
        items: changeItems(c, outDir),
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
  if (!resolveExistingSpecDir(specDir, 'nav generation')) return null
  return {
    text: options.text ?? 'Docs',
    link: `/${outDir}/`,
  }
}
