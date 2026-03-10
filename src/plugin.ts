import fs from 'node:fs'
import path from 'node:path'
import pc from 'picocolors'
import type { Plugin } from 'vite'
import type { Change, OpenSpecPluginOptions } from './types.js'
import {
  generateChangeIndexPage,
  generateChangesIndexPage,
  generateSpecPage,
  generateSpecsIndexPage,
  readOpenSpecFolder,
} from './utils.js'

const PLUGIN_NAME = 'vitepress-plugin-openspec'

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, 'utf-8')
}

function copyFile(src: string, dest: string): void {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

/**
 * VitePress plugin that reads an openspec/ directory and generates structured
 * Markdown documentation pages inside the VitePress source directory.
 *
 * @example
 * ```typescript
 * // .vitepress/config.ts
 * import { defineConfig } from 'vitepress'
 * import openspec from 'vitepress-plugin-openspec'
 *
 * export default defineConfig({
 *   vite: {
 *     plugins: [
 *       openspec({ specDir: './openspec', outDir: 'project-docs' }),
 *     ],
 *   },
 * })
 * ```
 */
export function openspec(userOptions: OpenSpecPluginOptions = {}): Plugin {
  const specDir = userOptions.specDir ?? './openspec'
  const outDir = userOptions.outDir ?? 'openspec'

  return {
    name: PLUGIN_NAME,
    enforce: 'pre',

    configResolved(resolvedConfig) {
      const vpConfig = (resolvedConfig as unknown as { vitepress?: { srcDir?: string } }).vitepress
      const srcDir = vpConfig?.srcDir ?? resolvedConfig.root ?? process.cwd()
      const absoluteOutDir = path.resolve(srcDir, outDir)

      try {
        const folder = readOpenSpecFolder(specDir)

        // --- Spec pages ---
        for (const spec of folder.specs) {
          const dest = path.join(absoluteOutDir, 'specs', spec.name, 'index.md')
          writeFile(dest, generateSpecPage(spec))
        }
        writeFile(
          path.join(absoluteOutDir, 'specs', 'index.md'),
          generateSpecsIndexPage(folder.specs, outDir),
        )

        // --- Active change pages ---
        for (const change of folder.changes) {
          writeChangePage(change, absoluteOutDir, outDir, false)
        }

        // --- Archived change pages ---
        for (const change of folder.archivedChanges) {
          writeChangePage(change, absoluteOutDir, outDir, true)
        }

        // --- Changes index ---
        writeFile(
          path.join(absoluteOutDir, 'changes', 'index.md'),
          generateChangesIndexPage(folder, outDir),
        )

        // --- Root index ---
        const rootIndex = [
          '# Project Documentation',
          '',
          'This section is generated from the project\'s [OpenSpec](https://openspec.dev/) folder.',
          'OpenSpec is a lightweight, file-based workflow for spec-driven development —',
          'it structures your project\'s capability specifications and change proposals as plain Markdown files.',
          '',
          `- [Specifications](/${outDir}/specs/) — canonical capability specs`,
          `- [Changes](/${outDir}/changes/) — active and archived change proposals`,
          '',
        ].join('\n')
        writeFile(path.join(absoluteOutDir, 'index.md'), rootIndex)

        console.log(
          `${pc.bold(pc.cyan(`[${PLUGIN_NAME}]`))} Generated docs from ${pc.cyan(specDir)}: ` +
            `${pc.green(String(folder.specs.length))} spec(s), ` +
            `${pc.green(String(folder.changes.length))} change(s), ` +
            `${pc.green(String(folder.archivedChanges.length))} archived`,
        )
      } catch (err) {
        console.error(
          `${pc.bold(pc.red(`[${PLUGIN_NAME}]`))} Failed to process openspec directory "${specDir}": ${String(err)}`,
        )
      }
    },
  }
}

function writeChangePage(
  change: Change,
  absoluteOutDir: string,
  outDir: string,
  isArchived: boolean,
): void {
  const subPath = isArchived
    ? path.join('changes', 'archive', `${change.archivedDate}-${change.name}`)
    : path.join('changes', change.name)
  const changeOutDir = path.join(absoluteOutDir, subPath)

  // Write index page
  writeFile(path.join(changeOutDir, 'index.md'), generateChangeIndexPage(change, outDir))

  // Copy artifact files
  for (const artifact of change.artifacts) {
    const srcFile = path.join(change.dir, `${artifact}.md`)
    const destFile = path.join(changeOutDir, `${artifact}.md`)
    copyFile(srcFile, destFile)
  }
}

export default openspec
