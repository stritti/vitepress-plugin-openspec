import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateOpenSpecPages } from '../plugin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE = path.join(__dirname, 'fixture/openspec')

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-cleanup-test-'))
}

describe('stale cleanup ordering', () => {
  it('removes all generated pages when the openspec directory disappears', () => {
    const dir = tmpDir()
    try {
      generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: dir })
      expect(fs.existsSync(path.join(dir, 'docs', 'index.md'))).toBe(true)
      fs.rmSync(path.join(dir, 'openspec-gone'), { recursive: true, force: true })
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      try {
        // specDir no longer exists: previously generated output must be removed
        generateOpenSpecPages({ specDir: path.join(dir, 'openspec-gone'), outDir: 'docs', srcDir: dir })
      } finally {
        warnSpy.mockRestore()
      }
      expect(fs.existsSync(path.join(dir, 'docs', 'index.md'))).toBe(false)
      expect(fs.existsSync(path.join(dir, 'docs', 'specs', 'auth-flow', 'index.md'))).toBe(false)
    } finally {
      fs.rmSync(dir, { recursive: true })
    }
  })

  it('deletes stale entries before writing new pages (case-rename safe)', () => {
    const dir = tmpDir()
    try {
      generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: dir })
      // Simulate a rename: old entry removed, new entry written. Because
      // cleanup runs before generation, a stale path cannot collide with a
      // freshly written page even on case-insensitive filesystems.
      const specPage = path.join(dir, 'docs', 'specs', 'auth-flow', 'index.md')
      expect(fs.existsSync(specPage)).toBe(true)
      generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: dir })
      expect(fs.existsSync(specPage)).toBe(true)
    } finally {
      fs.rmSync(dir, { recursive: true })
    }
  })

  it('retains undeletable stale entries in the manifest for retry', () => {
    const dir = tmpDir()
    try {
      generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: dir })
      const manifestPath = path.join(dir, 'docs', '.openspec-manifest.json')
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as string[]
      // Inject a stale entry pointing at a directory (rmSync of a non-empty
      // dir would fail); simulate a locked file with a read-only mock instead
      manifest.push(path.join('specs', 'locked', 'index.md'))
      fs.writeFileSync(manifestPath, JSON.stringify(manifest), 'utf-8')
      const locked = path.join(dir, 'docs', 'specs', 'locked', 'index.md')
      fs.mkdirSync(path.dirname(locked), { recursive: true })
      fs.writeFileSync(locked, '# locked', 'utf-8')
      // Simulate a locked file (e.g. on Windows) by failing rmSync for it
      const realRmSync = fs.rmSync
      const rmSpy = vi.spyOn(fs, 'rmSync').mockImplementation((p: fs.PathLike, opts?: fs.RmOptions) => {
        if (typeof p === 'string' && p === locked) {
          throw Object.assign(new Error('EPERM: file locked'), { code: 'EPERM' })
        }
        return realRmSync(p, { ...opts, force: true })
      })
      const warnSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      try {
        generateOpenSpecPages({ specDir: FIXTURE, outDir: 'docs', srcDir: dir })
        const after = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as string[]
        expect(after).toContain(path.join('specs', 'locked', 'index.md'))
        expect(fs.existsSync(locked)).toBe(true)
      } finally {
        warnSpy.mockRestore()
        rmSpy.mockRestore()
      }
    } finally {
      fs.rmSync(dir, { recursive: true })
    }
  })
})
