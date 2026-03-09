# vitepress-plugin-openspec

A [VitePress](https://vitepress.dev/) plugin that reads OpenAPI / OpenSpec definition files (JSON or YAML) and automatically generates Markdown documentation pages that are integrated into your VitePress site.

---

## 📦 Installation

```bash
npm install vitepress-plugin-openspec --save-dev
```

---

## 🛠️ Usage

Add the plugin to your VitePress configuration (`.vitepress/config.ts`):

```typescript
import { defineConfig } from 'vitepress'
import openspec, { generateSidebarFromSpec } from 'vitepress-plugin-openspec'

export default defineConfig({
  vite: {
    plugins: [
      openspec({
        spec: './openapi.yaml',   // path to your OpenAPI spec (JSON or YAML)
        outDir: 'api',            // output directory inside VitePress srcDir
      }),
    ],
  },
  themeConfig: {
    sidebar: {
      '/api/': generateSidebarFromSpec('./openapi.yaml', { outDir: 'api' }),
    },
  },
})
```

The plugin generates one Markdown page per API endpoint plus an overview `index.md` inside `<srcDir>/<outDir>/`.

`generateSidebarFromSpec` parses the spec synchronously at config-evaluation time and returns sidebar items ready to be used in `themeConfig.sidebar`.

---

## ⚙️ Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `spec` | `string \| string[]` | **required** | Path(s) to OpenAPI spec file(s) |
| `outDir` | `string` | `'api'` | Output directory relative to VitePress `srcDir` |
| `title` | `string` | spec `info.title` | Override the page title |
| `groupByTags` | `boolean` | `true` | Group sidebar entries by tag |
| `includeSchemas` | `boolean` | `true` | Include schema section placeholder on endpoint pages |
| `generateSidebar` | `boolean` | `true` | Generate sidebar configuration |

---

## 📂 Output Structure

After running `vitepress build` (or `vitepress dev`), the plugin creates:

```
docs/
└── api/
    ├── index.md          # Overview page with endpoint table
    ├── list-pets.md      # One page per endpoint
    ├── create-pet.md
    └── show-pet-by-id.md
```

---

## 📖 Supported Formats

- OpenAPI 3.x (`.yaml`, `.yml`, `.json`)
- Swagger 2.x (`.yaml`, `.yml`, `.json`)

---

## 🔧 Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Watch mode
npm run dev

# Run tests
npm test

# Type check
npm run lint
```

---

## License

MIT
