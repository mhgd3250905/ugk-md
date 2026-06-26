import fs from 'node:fs'

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const files = ['main.js', 'preload.cjs', 'index.html', 'src/renderer.js', 'src/styles.css']

for (const file of files) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`)
}

const exts = pkg.build.fileAssociations[0].ext
for (const ext of ['md', 'markdown']) {
  if (!exts.includes(ext)) throw new Error(`Missing file association for .${ext}`)
}

const preload = fs.readFileSync('preload.cjs', 'utf8')
if (preload.includes('import ')) throw new Error('preload must stay CommonJS for Electron sandbox')
if (!preload.includes('openExternal')) throw new Error('Missing external link bridge')
if (!preload.includes('pathForFile')) throw new Error('Missing drag/drop file path bridge')

const main = fs.readFileSync('main.js', 'utf8')
if (!main.includes('will-navigate')) throw new Error('Missing navigation guard')
if (!main.includes('Only Markdown files can be opened')) throw new Error('Missing drag/drop read guard')

const renderer = fs.readFileSync('src/renderer.js', 'utf8')
const html = fs.readFileSync('index.html', 'utf8')
if (html.includes('id="source" spellcheck="false" readonly')) {
  throw new Error('Source editor must stay editable')
}
if (!renderer.includes('openExternal')) throw new Error('Missing external link click handler')
if (!renderer.includes('scrollToHash')) throw new Error('Missing internal hash link handler')
if (!renderer.includes("classList.toggle('compare')")) throw new Error('Missing compare view toggle')
if (!renderer.includes('pathForFile')) throw new Error('Missing drag/drop file load handler')
if (!renderer.includes("source.addEventListener('input'")) throw new Error('Missing live source edit preview')
if (!renderer.includes("event.key.toLowerCase() === 'o'")) throw new Error('Missing keyboard open shortcut')
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

console.log('smoke ok')
