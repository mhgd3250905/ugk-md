# UGK Markdown

UGK Markdown is a local Markdown reader for macOS and Windows. It opens local `.md` files, renders rich Markdown with ByteMD plugins, and supports a side-by-side source editor with live preview.

## Features

- Local Markdown file opening, drag-and-drop empty state, and file association support
- GFM tables, task lists, strikethrough, line breaks, emoji, frontmatter
- Syntax highlighting, KaTeX math, Mermaid diagrams, image zoom
- Reader mode and source/preview compare mode
- Editable source pane with live rendered preview
- Light and dark themes
- Native Language menu with English, Chinese, Japanese, Korean, Spanish, French, German, Portuguese, and Russian UI strings
- External links open in the system browser

## Development

```bash
npm install
npm run app
```

## Build

```bash
npm run build
npm run smoke
npm run dist:mac
npm run dist:win
```

Build outputs are written to `release/` and are intentionally not committed. Publish installers through GitHub Releases instead.

## License

MIT
