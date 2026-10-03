import type { CapabilitySpec, Change, OpenSpecFolder } from '../types.js'
import { humanizeLabel } from './reader.js'
import { extractSpecDescription, specTitle, stripDeltaMarkers, transformScenarios } from './markdown.js'

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
  lines.push(`# ${specTitle(spec)}`)
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
      lines.push(`- [${specTitle(spec)}](/${outDir}/specs/${spec.name}/)`)
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

/**
 * Generates the root index page of the openspec documentation section.
 */
export function generateRootIndexPage(outDir: string): string {
  return [
    '# Project Documentation',
    '',
    "This section is generated from the project's [OpenSpec](https://openspec.dev/) folder.",
    'OpenSpec is a lightweight, file-based workflow for spec-driven development —',
    'it structures your project\'s capability specifications and change proposals as plain Markdown files.',
    '',
    `- [Specifications](/${outDir}/specs/) — canonical capability specs`,
    `- [Changes](/${outDir}/changes/) — active and archived change proposals`,
    '',
  ].join('\n')
}
