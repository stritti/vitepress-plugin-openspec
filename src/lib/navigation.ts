import fs from 'node:fs'
import path from 'node:path'
import type { NavItem, SidebarItem } from '../types.js'
import { logWarn } from './logger.js'
import { humanizeLabel, readOpenSpecFolder } from './reader.js'
import { specTitle } from './markdown.js'

function changeItems(change: { name: string; archiveFolderName?: string; artifacts: string[] }, outDir: string, isArchived = false): SidebarItem[] {
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
    logWarn(
      `openspec directory not found: ${path.relative(process.cwd(), path.resolve(specDir))} — skipping sidebar generation`,
    )
    return []
  }
  const folder = readOpenSpecFolder(specDir)
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
    logWarn(
      `openspec directory not found: ${path.relative(process.cwd(), path.resolve(specDir))} — skipping nav generation`,
    )
    return null
  }
  return {
    text: options.text ?? 'Docs',
    link: `/${outDir}/`,
  }
}
