import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import type { ResolvedOptions } from './lib/options.js'
import type { OpenSpecPluginOptions, WithOpenSpecOptions } from './types.js'
import { PLUGIN_NAME, logWarn } from './lib/logger.js'
import { resolveOptions } from './lib/options.js'
import { generatePages } from './lib/generator.js'
import { openspecNav, generateOpenSpecSidebar } from './lib/navigation.js'
import { isSourceArtifactEvent } from './lib/watch.js'
import { createScheduler, readNavigationSignature, updateNavigationInMemory } from './lib/dev-server.js'
import { detectSrcDir, detectVitePressRoot } from './lib/detect.js'

/**
 * Synchronously generates all VitePress Markdown pages from the openspec/
 * directory and writes them to disk.
 *
 * Call this at the top of your `docs/.vitepress/config.ts` **before**
 * `defineConfig()` so the files exist when VitePress scans the source
 * directory for routes. In most cases `withOpenSpec()` (which calls this
 * internally) is the simpler integration point.
 *
 * @returns true when pages were written; false when generation was skipped
 *   (missing or unreadable source, ambiguous source-directory detection) or
 *   failed.
 * @throws if `outDir` is not a relative path inside `srcDir` (absolute,
 *   traversal, or empty).
 */
export function generateOpenSpecPages(userOptions: OpenSpecPluginOptions = {}): boolean {
  // When source-directory detection is ambiguous (multiple .vitepress
  // folders at the same level), detectSrcDir has already warned; skip
  // generation instead of writing into the common parent.
  const detectedSrcDir = userOptions.srcDir ?? detectSrcDir(process.cwd())
  if (!detectedSrcDir) return false
  const options = resolveOptions(userOptions, detectedSrcDir)
  return generatePages(options)
}

/**
 * Vite plugin that regenerates the openspec documentation pages whenever a
 * file inside the openspec/ directory changes. This makes `vitepress dev`
 * pick up spec edits without a manual restart.
 *
 * For the pages to be available on the first build (including CI), the pages
 * are generated once in `configResolved`. When using `withOpenSpec()` this
 * plugin is wired up automatically.
 */
export function openspec(userOptions: OpenSpecPluginOptions = {}): Plugin {
  let resolvedOptions: ResolvedOptions | undefined
  let ownsSidebarEntry = false
  let detachListeners: (() => void) | undefined

  return {
    name: PLUGIN_NAME,
    enforce: 'pre',

    configResolved(resolvedConfig) {
      detachListeners?.()
      const vpConfig = (resolvedConfig as unknown as { vitepress?: { srcDir?: string } }).vitepress
      const srcDir =
        userOptions.srcDir ?? vpConfig?.srcDir ?? resolvedConfig.root ?? process.cwd()
      try {
        resolvedOptions = resolveOptions(userOptions, srcDir)
      } catch (err) {
        logWarn(String(err))
        return
      }
      if (!fs.existsSync(resolvedOptions.specDir)) {
        logWarn(
          `openspec directory not found: ${resolvedOptions.specDir} — skipping page generation`,
        )
        // Still run generatePages so previously generated pages recorded in
        // the manifest are cleaned up when the source directory disappears.
        generatePages(resolvedOptions)
        resolvedOptions = undefined
        return
      }
      generatePages(resolvedOptions)
    },

    configureServer(server) {
      if (!resolvedOptions || !fs.existsSync(resolvedOptions.specDir)) return
      const options = resolvedOptions
      // Use Vite's own watcher: it is supported on all Node versions and
      // platforms declared by this package (unlike recursive fs.watch).
      // Ensure the openspec directory is watched even when it lives outside
      // the Vite root (the documented docs/ + openspec/ layout).
      server.watcher.add(options.specDir)
      const scheduler = createScheduler()
      let navigationSignature = readNavigationSignature(options)
      const onWatchEvent = (event: 'change' | 'add' | 'unlink', file: string) => {
        const absFile = path.resolve(file)
        if (!isSourceArtifactEvent(options, absFile)) return
        // Structural changes (files added or removed) and metadata edits
        // (.openspec.yaml, spec/change titles) also alter the sidebar and
        // nav, which are derived from the config; a full server restart
        // regenerates both pages and navigation. Plain content edits take
        // the fast regenerate+reload path unless a title changed.
        const signature = readNavigationSignature(options)
        const affectsNavigation = event !== 'change' || signature !== navigationSignature
        if (affectsNavigation) {
          scheduler.cancel()
          updateNavigationInMemory(options, server, ownsSidebarEntry)
          navigationSignature = signature
          server.restart(true)
        } else {
          scheduler.schedule(options, server)
        }
      }
      const onChange = (f: string) => onWatchEvent('change', f)
      const onAdd = (f: string) => onWatchEvent('add', f)
      const onUnlink = (f: string) => onWatchEvent('unlink', f)
      server.watcher.on('change', onChange)
      server.watcher.on('add', onAdd)
      server.watcher.on('unlink', onUnlink)
      // Unregister listeners when the dev server shuts down. Closing the
      // shared chokidar instance would break Vite itself, so we only detach.
      // The same detach runs from closeBundle so consecutive builds
      // (e.g. `vitepress build --watch` or quick relaunches) cannot
      // accumulate duplicate listeners.
      detachListeners = () => {
        scheduler.cancel()
        server.watcher.off('change', onChange)
        server.watcher.off('add', onAdd)
        server.watcher.off('unlink', onUnlink)
        server.httpServer?.removeListener('close', detachListeners!)
        detachListeners = undefined
      }
      server.httpServer?.once('close', detachListeners)
    },

    closeBundle() {
      detachListeners?.()
      detachListeners = undefined
    },
  }
}

/**
 * One-call VitePress config helper that wires up the full openspec integration.
 *
 * Calls `generateOpenSpecPages()` synchronously (required before VitePress scans
 * for routes), then merges the openspec Vite plugin, nav entry, and sidebar section
 * into the provided config object.
 *
 * Other Vite plugins go into `vite.plugins` as usual — `withOpenSpec` appends to
 * the array without replacing it.
 *
 * When the VitePress source directory cannot be detected unambiguously
 * (multiple `.vitepress` folders at the same level), a warning is emitted and
 * the config is returned with only the sidebar shape normalized — nothing is
 * generated or injected.
 *
 * @param config - Your VitePress `UserConfig` object (same as what `defineConfig` accepts).
 * @param options - OpenSpec options. All fields are optional; defaults match `generateOpenSpecPages`.
 * @throws if `outDir` is not a relative path inside `srcDir` (absolute, traversal, or empty).
 */
export function withOpenSpec<T extends Record<string, unknown>>(
  config: T,
  options: WithOpenSpecOptions = {},
): T {
  const cwd = process.cwd()
  // Resolve a relative srcDir from the wrapped config the same way
  // VitePress resolves it: against the detected project root.
  const configSrcDir =
    typeof config.srcDir === 'string' && config.srcDir
      ? path.resolve(detectVitePressRoot(cwd), config.srcDir)
      : undefined
  const detectedSrcDir = options.srcDir ?? configSrcDir ?? detectSrcDir(cwd)
  const result = { ...config } as Record<string, unknown>
  const themeConfig = (result.themeConfig ?? {}) as Record<string, unknown>
  // Normalize an array-based (single-sidebar) config to the object form so
  // the injected section always lands under its route key — also when
  // generation is skipped below.
  if (Array.isArray(themeConfig.sidebar)) {
    themeConfig.sidebar = { '/': themeConfig.sidebar }
  }
  result.themeConfig = themeConfig
  // When source-directory detection is ambiguous, detectSrcDir has already
  // warned; skip generation and integration instead of writing into the
  // common parent of multiple VitePress sites.
  if (detectedSrcDir === undefined) return result as T

  let resolved: ResolvedOptions
  try {
    resolved = resolveOptions(options, detectedSrcDir)
  } catch (err) {
    logWarn(String(err))
    return result as T
  }

  const generated = generatePages(resolved)

  // --- Vite plugin ---
  const vite = (result.vite ?? {}) as Record<string, unknown>
  const existingPlugins = (vite.plugins as unknown[]) ?? []
  result.vite = { ...vite, plugins: [...existingPlugins, openspec({ ...options })] }

  // --- Nav ---
  if (generated && options.nav !== false) {
    const navEntry = openspecNav(resolved.specDir, {
      outDir: resolved.outDir,
      text: options.navText,
    })
    const existingNav = (themeConfig.nav as unknown[]) ?? []
    themeConfig.nav = navEntry ? [navEntry, ...existingNav] : existingNav
  }

  // --- Sidebar ---
  const sidebarKey = `/${resolved.outDir}/`
  const existingSidebar = (themeConfig.sidebar ?? {}) as Record<string, unknown>
  // The plugin only owns (and the watcher only updates) an entry it created
  // itself; a pre-existing custom entry for this route is preserved as-is.
  const pluginOwnsSidebarEntry = generated && options.sidebar !== false && !existingSidebar[sidebarKey]
  if (pluginOwnsSidebarEntry) {
    const items = generateOpenSpecSidebar(resolved.specDir, { outDir: resolved.outDir })
    if (items.length > 0) {
      themeConfig.sidebar = { ...existingSidebar, [sidebarKey]: items }
    }
  }

  result.themeConfig = themeConfig
  return result as T
}

export default openspec
