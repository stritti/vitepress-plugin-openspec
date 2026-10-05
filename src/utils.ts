/**
 * Compatibility re-exports. The implementation lives in `./lib/` modules;
 * these named exports are kept stable for existing consumers.
 */
export { readOpenSpecFolder } from './lib/reader.js'
export { rewriteRelativeLinks } from './lib/links.js'
export {
  generateSpecPage,
  generateSpecsIndexPage,
  generateChangeIndexPage,
  generateChangesIndexPage,
} from './lib/pages.js'
export { generateOpenSpecSidebar, openspecNav } from './lib/navigation.js'
