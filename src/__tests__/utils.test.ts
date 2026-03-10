import { describe, it, expect } from 'vitest'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  readOpenSpecFolder,
  generateSpecPage,
  generateSpecsIndexPage,
  generateChangeIndexPage,
  generateChangesIndexPage,
  generateOpenSpecSidebar,
  openspecNav,
} from '../utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE = path.join(__dirname, 'fixture/openspec')

describe('readOpenSpecFolder', () => {
  it('reads specs from openspec/specs/', () => {
    const folder = readOpenSpecFolder(FIXTURE)
    expect(folder.specs).toHaveLength(2)
    const names = folder.specs.map((s) => s.name)
    expect(names).toContain('auth-flow')
    expect(names).toContain('data-export')
  })

  it('reads content of each spec', () => {
    const folder = readOpenSpecFolder(FIXTURE)
    const auth = folder.specs.find((s) => s.name === 'auth-flow')!
    expect(auth.content).toContain('User can log in')
  })

  it('reads active changes from openspec/changes/', () => {
    const folder = readOpenSpecFolder(FIXTURE)
    expect(folder.changes).toHaveLength(2)
    const names = folder.changes.map((c) => c.name)
    expect(names).toContain('add-login')
    expect(names).toContain('fix-bug')
  })

  it('reads change artifacts correctly', () => {
    const folder = readOpenSpecFolder(FIXTURE)
    const login = folder.changes.find((c) => c.name === 'add-login')!
    expect(login.artifacts).toContain('proposal')
    expect(login.artifacts).toContain('tasks')
    expect(login.artifacts).not.toContain('design')
  })

  it('reads created date from .openspec.yaml', () => {
    const folder = readOpenSpecFolder(FIXTURE)
    const login = folder.changes.find((c) => c.name === 'add-login')!
    expect(login.createdDate).toBe('2026-02-01')
  })

  it('reads archived changes from openspec/changes/archive/', () => {
    const folder = readOpenSpecFolder(FIXTURE)
    expect(folder.archivedChanges).toHaveLength(2)
    const standard = folder.archivedChanges.find((c) => c.name === 'old-feature')!
    expect(standard.archivedDate).toBe('2026-01-15')
    expect(standard.archiveFolderName).toBe('2026-01-15-old-feature')
  })

  it('reads non-standard archive folder names without date prefix', () => {
    const folder = readOpenSpecFolder(FIXTURE)
    const legacy = folder.archivedChanges.find((c) => c.name === 'legacy-feature')!
    expect(legacy).toBeDefined()
    expect(legacy.archivedDate).toBeUndefined()
    expect(legacy.archiveFolderName).toBe('legacy-feature')
  })

  it('throws for non-existent directory', () => {
    expect(() => readOpenSpecFolder('/non/existent')).toThrow('vitepress-plugin-openspec')
  })
})

describe('generateSpecPage', () => {
  it('starts with the humanized capability name as H1', () => {
    const folder = readOpenSpecFolder(FIXTURE)
    const spec = folder.specs.find((s) => s.name === 'auth-flow')!
    const page = generateSpecPage(spec)
    expect(page).toMatch(/^# Auth Flow/)
  })

  it('includes the spec content', () => {
    const folder = readOpenSpecFolder(FIXTURE)
    const spec = folder.specs.find((s) => s.name === 'auth-flow')!
    const page = generateSpecPage(spec)
    expect(page).toContain('User can log in')
  })
})

describe('generateSpecsIndexPage', () => {
  it('contains links to all specs', () => {
    const folder = readOpenSpecFolder(FIXTURE)
    const page = generateSpecsIndexPage(folder.specs, 'openspec')
    expect(page).toContain('/openspec/specs/auth-flow/')
    expect(page).toContain('/openspec/specs/data-export/')
  })

  it('shows placeholder for empty specs', () => {
    const page = generateSpecsIndexPage([], 'openspec')
    expect(page).toContain('No specifications defined yet')
  })
})

describe('generateChangeIndexPage', () => {
  it('contains the humanized change name as H1', () => {
    const folder = readOpenSpecFolder(FIXTURE)
    const change = folder.changes.find((c) => c.name === 'add-login')!
    const page = generateChangeIndexPage(change, 'openspec')
    expect(page).toMatch(/^# Add Login/)
  })

  it('includes links to present artifacts', () => {
    const folder = readOpenSpecFolder(FIXTURE)
    const change = folder.changes.find((c) => c.name === 'add-login')!
    const page = generateChangeIndexPage(change, 'openspec')
    expect(page).toContain('/openspec/changes/add-login/proposal')
    expect(page).toContain('/openspec/changes/add-login/tasks')
    expect(page).not.toContain('design')
  })

  it('includes archived path for archived changes', () => {
    const folder = readOpenSpecFolder(FIXTURE)
    const change = folder.archivedChanges.find((c) => c.name === 'old-feature')!
    const page = generateChangeIndexPage(change, 'openspec')
    expect(page).toContain('/openspec/changes/archive/2026-01-15-old-feature/proposal')
  })

  it('includes correct archive path for non-standard (undated) archive folder names', () => {
    const folder = readOpenSpecFolder(FIXTURE)
    const change = folder.archivedChanges.find((c) => c.name === 'legacy-feature')!
    const page = generateChangeIndexPage(change, 'openspec')
    expect(page).toContain('/openspec/changes/archive/legacy-feature/proposal')
    expect(page).not.toContain('undefined')
  })
})

describe('generateChangesIndexPage', () => {
  it('lists active changes', () => {
    const folder = readOpenSpecFolder(FIXTURE)
    const page = generateChangesIndexPage(folder, 'openspec')
    expect(page).toContain('/openspec/changes/add-login/')
    expect(page).toContain('/openspec/changes/fix-bug/')
  })

  it('includes Archiv section with archived changes using humanized labels', () => {
    const folder = readOpenSpecFolder(FIXTURE)
    const page = generateChangesIndexPage(folder, 'openspec')
    expect(page).toContain('## Archiv')
    expect(page).toContain('Old Feature')
  })
})

describe('generateOpenSpecSidebar', () => {
  it('returns Specifications and Changes groups', () => {
    const sidebar = generateOpenSpecSidebar(FIXTURE, { outDir: 'openspec' })
    const texts = sidebar.map((g) => g.text)
    expect(texts).toContain('Specifications')
    expect(texts).toContain('Changes')
  })

  it('includes Archiv group when archived changes exist', () => {
    const sidebar = generateOpenSpecSidebar(FIXTURE, { outDir: 'openspec' })
    const texts = sidebar.map((g) => g.text)
    expect(texts).toContain('Archiv')
  })

  it('Archiv group is collapsed by default', () => {
    const sidebar = generateOpenSpecSidebar(FIXTURE, { outDir: 'openspec' })
    const archiv = sidebar.find((g) => g.text === 'Archiv')!
    expect(archiv.collapsed).toBe(true)
  })

  it('Specifications group contains spec items', () => {
    const sidebar = generateOpenSpecSidebar(FIXTURE, { outDir: 'openspec' })
    const specs = sidebar.find((g) => g.text === 'Specifications')!
    const links = specs.items!.map((i) => i.link)
    expect(links).toContain('/openspec/specs/auth-flow/')
  })
})

describe('humanizeLabel (via page generators)', () => {
  it('converts multi-word kebab-case to Title Case', () => {
    const folder = readOpenSpecFolder(FIXTURE)
    const spec = folder.specs.find((s) => s.name === 'data-export')!
    expect(generateSpecPage(spec)).toMatch(/^# Data Export/)
  })

  it('capitalizes single-word names', () => {
    const folder = readOpenSpecFolder(FIXTURE)
    const change = folder.changes.find((c) => c.name === 'fix-bug')!
    expect(generateChangeIndexPage(change, 'openspec')).toMatch(/^# Fix Bug/)
  })

  it('uses humanized labels as sidebar text for specs', () => {
    const sidebar = generateOpenSpecSidebar(FIXTURE, { outDir: 'openspec' })
    const specsGroup = sidebar.find((g) => g.text === 'Specifications')!
    const labels = specsGroup.items!.map((i) => i.text)
    expect(labels).toContain('Auth Flow')
    expect(labels).toContain('Data Export')
  })

  it('uses humanized labels as sidebar text for changes', () => {
    const sidebar = generateOpenSpecSidebar(FIXTURE, { outDir: 'openspec' })
    const changesGroup = sidebar.find((g) => g.text === 'Changes')!
    const labels = changesGroup.items!.map((i) => i.text)
    expect(labels).toContain('Add Login')
    expect(labels).toContain('Fix Bug')
  })
})

describe('openspecNav', () => {
  it('returns nav entry with default text "Docs"', () => {
    const nav = openspecNav(FIXTURE)
    expect(nav.text).toBe('Docs')
    expect(nav.link).toBe('/openspec/')
  })

  it('uses custom text and outDir', () => {
    const nav = openspecNav(FIXTURE, { outDir: 'project-docs', text: 'Projektdoku' })
    expect(nav.text).toBe('Projektdoku')
    expect(nav.link).toBe('/project-docs/')
  })

  it('throws for non-existent directory', () => {
    expect(() => openspecNav('/non/existent')).toThrow('vitepress-plugin-openspec')
  })
})
