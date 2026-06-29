# UGK MD阅读器

[English](#english) | [简体中文](#简体中文)

![Version](https://img.shields.io/badge/version-1.0.1-024ad8)
![License](https://img.shields.io/badge/license-MIT-black)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-024ad8)

本地 Markdown 阅读器，面向 macOS 和 Windows。双击打开 `.md` 文件，获得清爽排版、丰富 Markdown 渲染、源码对照和实时预览。

## 简体中文

### 下载

最新版： [UGK MD阅读器 1.0.1](https://github.com/mhgd3250905/ugk-md/releases/latest)

| 系统 | 安装包 |
| --- | --- |
| macOS Apple Silicon | [UGK-MD-Reader-1.0.1-mac-arm64.dmg](https://github.com/mhgd3250905/ugk-md/releases/latest/download/UGK-MD-Reader-1.0.1-mac-arm64.dmg) |
| macOS Intel | [UGK-MD-Reader-1.0.1-mac-x64.dmg](https://github.com/mhgd3250905/ugk-md/releases/latest/download/UGK-MD-Reader-1.0.1-mac-x64.dmg) |
| Windows x64 / arm64 | [UGK-MD-Reader-1.0.1-windows-x64-arm64.exe](https://github.com/mhgd3250905/ugk-md/releases/latest/download/UGK-MD-Reader-1.0.1-windows-x64-arm64.exe) |

> 当前安装包未进行 Apple Developer ID / Windows EV 代码签名，首次打开可能需要系统安全确认。

### 功能

- 本地打开 Markdown 文件，支持拖拽打开和文件关联。
- 支持 GFM 表格、任务列表、删除线、换行、Emoji、Frontmatter。
- 支持代码高亮、KaTeX 数学公式、Mermaid 图表、图片缩放。
- 提供阅读模式和源码 / 渲染对照模式。
- 对照模式下源码可编辑，右侧渲染实时更新。
- 支持浅色和深色主题，窗口背景随主题同步。
- 内置中文、英文、日文、韩文、西班牙文、法文、德文、葡萄牙文、俄文界面。
- 外部链接会用系统浏览器打开。

### 使用

1. 安装对应系统的安装包。
2. 打开 UGK MD阅读器。
3. 拖入 `.md` 文件，或把 `.md` 文件默认打开方式设为 UGK MD阅读器。
4. 需要检查原文时切换到对照模式。

### 本地开发

```bash
npm install
npm run app
```

### 构建

```bash
npm run build
npm run smoke
npm run dist:mac
npm run dist:win
```

`dist:mac` 生成 x64 和 arm64 DMG 安装包。`dist:win` 生成 x64 / arm64 NSIS `.exe` 安装包。构建产物输出到 `release/`，不提交到 git。

### 官网

官网静态文件在 `site/`，可直接部署到 Cloudflare Pages。

Cloudflare Pages 设置：

- Build command: 留空
- Build output directory: `site`

本地检查：

```bash
npm run site:smoke
```

## English

UGK MD Reader is a local Markdown reader for macOS and Windows. It opens local `.md` files and renders them with a clean reading layout, rich Markdown support, source comparison, and live preview.

### Download

Latest release: [UGK MD Reader 1.0.1](https://github.com/mhgd3250905/ugk-md/releases/latest)

| Platform | Installer |
| --- | --- |
| macOS Apple Silicon | [UGK-MD-Reader-1.0.1-mac-arm64.dmg](https://github.com/mhgd3250905/ugk-md/releases/latest/download/UGK-MD-Reader-1.0.1-mac-arm64.dmg) |
| macOS Intel | [UGK-MD-Reader-1.0.1-mac-x64.dmg](https://github.com/mhgd3250905/ugk-md/releases/latest/download/UGK-MD-Reader-1.0.1-mac-x64.dmg) |
| Windows x64 / arm64 | [UGK-MD-Reader-1.0.1-windows-x64-arm64.exe](https://github.com/mhgd3250905/ugk-md/releases/latest/download/UGK-MD-Reader-1.0.1-windows-x64-arm64.exe) |

> The current installers are not signed with Apple Developer ID or Windows EV certificates. The operating system may show a security prompt on first launch.

### Features

- Open local Markdown files with drag-and-drop and file association support.
- Render GFM tables, task lists, strikethrough, line breaks, emoji, and frontmatter.
- Render syntax highlighting, KaTeX math, Mermaid diagrams, and zoomable images.
- Switch between reader mode and side-by-side source / preview mode.
- Edit source Markdown in compare mode and update the rendered preview live.
- Use light and dark themes with native window background synchronization.
- Built-in UI languages: Chinese, English, Japanese, Korean, Spanish, French, German, Portuguese, and Russian.
- Open external links in the system browser.

### Usage

1. Download the installer for your platform.
2. Open UGK MD Reader.
3. Drag in a `.md` file, or set UGK MD Reader as the default app for Markdown files.
4. Switch to compare mode when you need to inspect or edit the source text.

### Development

```bash
npm install
npm run app
```

### Build

```bash
npm run build
npm run smoke
npm run dist:mac
npm run dist:win
```

`dist:mac` builds x64 and arm64 DMG installers. `dist:win` builds x64 / arm64 NSIS `.exe` installers. Build outputs are written to `release/` and are intentionally not committed.

### Website

The product website is a static Cloudflare Pages site in `site/`.

Cloudflare Pages settings:

- Build command: leave empty
- Build output directory: `site`

Check the website files locally:

```bash
npm run site:smoke
```

## License

[MIT](./LICENSE)
