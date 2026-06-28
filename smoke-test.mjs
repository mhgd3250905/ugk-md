import fs from 'node:fs'
import { appName, t } from './src/i18n.js'

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const files = ['main.js', 'preload.cjs', 'index.html', 'src/renderer.js', 'src/styles.css', 'src/i18n.js']

for (const file of files) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`)
}

if (!appName.startsWith('UGK MD')) throw new Error('Unexpected app name')
if (pkg.build.productName !== appName) throw new Error('Product name must match app name')

const exts = pkg.build.fileAssociations[0].ext
for (const ext of ['md', 'markdown']) {
  if (!exts.includes(ext)) throw new Error(`Missing file association for .${ext}`)
}
if (!pkg.build.files.includes('src/i18n.js')) throw new Error('Packaged app must include shared i18n module')

const preload = fs.readFileSync('preload.cjs', 'utf8')
if (preload.includes('import ')) throw new Error('preload must stay CommonJS for Electron sandbox')
if (!preload.includes('openExternal')) throw new Error('Missing external link bridge')
if (!preload.includes('pathForFile')) throw new Error('Missing drag/drop file path bridge')
if (!preload.includes('setLanguage')) throw new Error('Missing language menu bridge')
if (!preload.includes('onLanguageSelected')) throw new Error('Missing language menu listener')
if (!preload.includes('setTheme')) throw new Error('Missing native theme bridge')

const main = fs.readFileSync('main.js', 'utf8')
if (!main.includes('will-navigate')) throw new Error('Missing navigation guard')
if (!main.includes('Only Markdown files can be opened')) throw new Error('Missing drag/drop read guard')
if (!main.includes('Menu.buildFromTemplate')) throw new Error('Missing native app menu')
if (!main.includes("t(currentLanguage, 'menu.file')")) throw new Error('File menu must be localized')
if (!main.includes("t(currentLanguage, 'menu.language')")) throw new Error('Language menu must be localized')
if (!main.includes("t(currentLanguage, 'menu.view')")) throw new Error('View menu must be localized')
if (!main.includes("t(currentLanguage, 'menu.close')")) throw new Error('Close submenu must be localized')
if (!main.includes("t(currentLanguage, 'menu.quit')")) throw new Error('Quit submenu must be localized')
if (!main.includes("t(currentLanguage, 'menu.reload')")) throw new Error('Reload submenu must be localized')
if (!main.includes('language-selected')) throw new Error('Missing menu language event')
if (!main.includes('title: appName')) throw new Error('Window title must use app name')
if (!main.includes('nativeTheme.themeSource')) throw new Error('Native theme must follow dark mode')
if (!main.includes('setBackgroundColor')) throw new Error('Window background must follow dark mode')

const renderer = fs.readFileSync('src/renderer.js', 'utf8')
const html = fs.readFileSync('index.html', 'utf8')
const i18n = fs.readFileSync('src/i18n.js', 'utf8')
if (html.includes('id="source" spellcheck="false" readonly')) {
  throw new Error('Source editor must stay editable')
}
if (!html.includes('<title>UGK MD')) throw new Error('HTML title must use app name')
if (html.includes('id="language"')) throw new Error('Language switch belongs in the native menu, not the page toolbar')
if (html.includes('id="reader"')) throw new Error('Reader must not exist in the unloaded DOM')
if (!html.includes('id="reader-template"')) throw new Error('Missing lazy reader template')
if (!html.includes('id="compare" data-i18n="compare.compare" disabled')) throw new Error('Compare must start disabled before a file is loaded')
if (!html.includes('Drag a Markdown file here')) throw new Error('Missing watermark-style empty state copy')
if (!renderer.includes('openExternal')) throw new Error('Missing external link click handler')
if (!renderer.includes('scrollToHash')) throw new Error('Missing internal hash link handler')
if (!renderer.includes("classList.toggle('compare')")) throw new Error('Missing compare view toggle')
if (!renderer.includes('if (!currentFile) return')) throw new Error('Compare must not toggle before a file is loaded')
if (!renderer.includes('function ensureReader()')) throw new Error('Missing lazy reader creation')
if (!renderer.includes("reader.id = 'reader'")) throw new Error('Reader must be created only after loading a file')
if (!renderer.includes('compareButton.disabled = false')) throw new Error('Compare must be enabled after loading a file')
if (!renderer.includes('pathForFile')) throw new Error('Missing drag/drop file load handler')
if (!renderer.includes("source.addEventListener('input'")) throw new Error('Missing live source edit preview')
if (!renderer.includes("event.key.toLowerCase() === 'o'")) throw new Error('Missing keyboard open shortcut')
if (!renderer.includes('setLanguage')) throw new Error('Missing language switch handler')
if (!renderer.includes('localStorage')) throw new Error('Missing persisted language preference')
if (!renderer.includes('onLanguageSelected')) throw new Error('Missing native language menu listener')
if (!renderer.includes('setTheme')) throw new Error('Missing native theme sync call')
if (!renderer.includes('appName')) throw new Error('Document title must use app name')
if (!html.includes('data-i18n=')) throw new Error('Missing translatable UI markers')
if (!i18n.includes('export const languages')) throw new Error('Missing i18n language registry')
for (const locale of ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'es-ES', 'fr-FR', 'de-DE', 'pt-BR', 'ru-RU']) {
  if (!i18n.includes(locale)) throw new Error(`Missing ${locale} locale`)
}
if (t('zh-CN', 'menu.file') === t('en', 'menu.file')) throw new Error('Localized File menu string missing')
if (t('zh-CN', 'menu.language') === t('en', 'menu.language')) throw new Error('Localized Language menu string missing')
if (t('zh-CN', 'menu.view') === t('en', 'menu.view')) throw new Error('Localized View menu string missing')
if (t('zh-CN', 'open.button') === t('en', 'open.button')) throw new Error('Chinese strings must differ from English strings')
if (t('zh-CN', 'empty.message') === t('en', 'empty.message')) throw new Error('Chinese empty state must differ from English empty state')
for (const plugin of [
  'plugin-breaks',
  'plugin-frontmatter',
  'plugin-gemoji',
  'plugin-gfm',
  'plugin-highlight',
  'plugin-math',
  'plugin-medium-zoom',
  'plugin-mermaid',
]) {
  if (!renderer.includes(plugin)) throw new Error(`Missing ${plugin}`)
}

const styles = fs.readFileSync('src/styles.css', 'utf8')
if (!styles.includes('.markdown-body table')) throw new Error('Missing table styles')
if (!styles.includes('--primary: #024ad8')) throw new Error('Missing HP Electric Blue')
if (!styles.includes('--cloud: #f7f7f7')) throw new Error('Missing HP cloud surface')
if (!styles.includes('Forma DJR Micro')) throw new Error('Missing HP-style type stack')
if (!styles.includes('border-radius: 16px')) throw new Error('Missing HP card radius')
if (!styles.includes('#topbar')) throw new Error('Missing desktop top toolbar styles')
if (/\.markdown-body\s*\{[^}]*border:/s.test(styles)) throw new Error('Rendered page must not have an outer border')
if (/\.markdown-body\s*\{[^}]*box-shadow:/s.test(styles)) throw new Error('Rendered page must not have a card shadow')
if (/\.markdown-body\s*\{[^}]*border-radius:/s.test(styles)) throw new Error('Rendered page must not have a card radius')
if (!/\.markdown-body\s*\{[^}]*padding: 0;/s.test(styles)) throw new Error('Rendered page must not have thick container padding')
if (!/\.markdown-body blockquote\s*\{[^}]*border-radius: 0;/s.test(styles)) throw new Error('Blockquote marker must be a straight vertical bar')
if (/\.markdown-body \.mermaid,\s*\.markdown-body \.katex-display,\s*\.markdown-body \.bytemd-frontmatter\s*\{[^}]*border:/s.test(styles)) {
  throw new Error('Special rendered blocks must not have an inner border')
}
if (!styles.includes('.compare #reader')) throw new Error('Missing compare view styles')
if (styles.includes('grid-template-columns: 0 minmax(0, 1fr)')) {
  throw new Error('Reader mode must not use a zero-width render column')
}
if (!styles.includes('.dragging #app::after')) throw new Error('Missing drag/drop overlay styles')
if (!styles.includes('content: attr(data-drop-label)')) throw new Error('Missing localized drag/drop overlay label')
if (/^#empty\s*\{[^}]*box-shadow:/m.test(styles)) throw new Error('Empty state must not be a card')
if (/^#empty\s*\{[^}]*border:/m.test(styles)) throw new Error('Empty state must not have a card border')
if (!/^#empty\s*\{[^}]*min-height: calc\(100vh - 136px\);/ms.test(styles)) throw new Error('Empty state must be centered like a watermark')
if (!styles.includes('#empty[hidden]')) throw new Error('Hidden empty state must override #empty display styles')
if (!/\.compare #compare,\s*\.dark #theme\s*\{[^}]*color: var\(--cloud\);/s.test(styles)) throw new Error('Active button text must invert with the theme')
if (!styles.includes('button:disabled')) throw new Error('Missing disabled button styles')

console.log('smoke ok')
