import type { ViteDevServer } from 'vite'
import type { ResolvedOptions } from './options.js'
import { generatePages } from './generator.js'
import { readOpenSpecFolder } from './reader.js'
import { invalidateGeneratedDestinations } from './watch.js'

/**
 * Compact fingerprint of everything that feeds the sidebar and nav:
 * spec and change names, titles, dates, and artifact lists. Comparing
 * signatures before and after an edit tells us whether the navigation
 * config changed and the dev server needs a full restart.
 */
export function readNavigationSignature(options: ResolvedOptions): string {
  try {
    const folder = readOpenSpecFolder(options.specDir)
    return JSON.stringify({
      specs: folder.specs.map((s) => [s.name, s.title ?? null]),
      changes: folder.changes.map((c) => [c.name, c.title ?? null, c.createdDate ?? null, c.artifacts]),
      archived: folder.archivedChanges.map((c) => [c.name, c.title ?? null, c.archivedDate ?? null, c.artifacts]),
    })
  } catch {
    return 'unreadable'
  }
}

export function createScheduler() {
  let timer: ReturnType<typeof setTimeout> | undefined
  return {
    schedule(options: ResolvedOptions, server: ViteDevServer): void {
      // Debounce: editors and archive operations often emit event bursts
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = undefined
        generatePages(options)
        invalidateGeneratedDestinations(options.absoluteOutDir)
        server.ws.send({ type: 'full-reload' })
      }, 100)
    },
    cancel(): void {
      if (timer) {
        clearTimeout(timer)
        timer = undefined
      }
    },
  }
}
