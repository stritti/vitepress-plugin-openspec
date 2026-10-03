import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import type { CapabilitySpec, Change, ChangeArtifact, OpenSpecFolder } from '../types.js'

const ARTIFACT_NAMES: ChangeArtifact[] = ['proposal', 'design', 'tasks']

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

export function humanizeLabel(name: string): string {
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
  return ARTIFACT_NAMES.filter((name) => fs.existsSync(path.join(dir, `${name}.md`)))
}

function isDirectory(dir: string, name: string): boolean {
  return fs.existsSync(path.join(dir, name, '.openspec.yaml'))
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
      if (!isDirectory(changeDir, '.')) continue
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
      const meta = readOpenSpecYaml(changeDir)
      const match = entry.name.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/)
      archivedChanges.push({
        name: match?.[2] ?? entry.name,
        title: meta.title ? String(meta.title) : undefined,
        dir: changeDir,
        artifacts: readArtifacts(changeDir),
        createdDate: formatDate(meta.created),
        archivedDate: match?.[1],
        archiveFolderName: entry.name,
      })
    }
  }

  return { dir: resolved, specs, changes, archivedChanges }
}
