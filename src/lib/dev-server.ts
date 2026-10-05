import path from 'node:path'
import type { ViteDevServer } from 'vite'
import type { ResolvedOptions } from './options.js'
import { generatePages } from './generator.js'
import { readOpenSpecFolder } from './reader.js'
import { generateOpenSpecSidebar } from './navigation.js'
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

/**
 * Updates the sidebar and nav entries inside the in-memory VitePress
 * theme config that `withOpenSpec()` created. `server.restart(true)` only
 * re-creates Vite from the already-resolved inline configuration, so it
 * never re-runs `withOpenSpec()`; mutating the live themeConfig object
 * before the restart is what actually refreshes the navigation.
 *
 * The live theme config lives on the VitePress `SiteConfig` object exposed
 * as `server.config.vitepress.site.themeConfig` (VitePress resolves its
 * site config before creating Vite). The flat `server.config.vitepress`
 * object only exists in unit tests that build a Vite config manually, so
 * both locations are supported.
 */
export function updateNavigationInMemory(
  options: ResolvedOptions,
  server: ViteDevServer,
  ownsSidebarEntry: boolean,
): void {
  if (!ownsSidebarEntry) return
  const vp = (server.config as unknown as {
    vitepress?: {
      site?: { themeConfig?: Record<string, unknown> }
      themeConfig?: Record<string, unknown>
    }
  }).vitepress
  const themeConfig = vp?.site?.themeConfig ?? vp?.themeConfig
  if (!themeConfig) return
  const sidebarKey = `/${options.outDir}/`
  const items = generateOpenSpecSidebar(options.specDir, { outDir: options.outDir })
  const sidebar = (themeConfig.sidebar ?? {}) as Record<string, unknown>
  if (items.length > 0) {
    sidebar[sidebarKey] = items
    themeConfig.sidebar = sidebar
  } else {
    delete sidebar[sidebarKey]
    themeConfig.sidebar = sidebar
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
