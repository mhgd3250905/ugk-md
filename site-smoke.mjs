import fs from 'node:fs'

const files = [
  'site/index.html',
  'site/styles.css',
  'site/_headers',
  'site/assets/logo-light.svg',
  'site/assets/logo-dark.svg',
  'site/assets/mark.svg',
]

for (const file of files) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`)
}

const html = fs.readFileSync('site/index.html', 'utf8')
const css = fs.readFileSync('site/styles.css', 'utf8')

for (const text of ['UGK MD阅读器', '下载最新版', '源码对照和实时预览', '本地优先']) {
  if (!html.includes(text)) throw new Error(`Missing website copy: ${text}`)
}

for (const asset of ['logo-light.svg', 'logo-dark.svg', 'mark.svg']) {
  if (!html.includes(asset) && asset !== 'mark.svg') throw new Error(`Missing logo usage: ${asset}`)
}

for (const token of ['--primary: #024ad8', '.hero', '.feature-grid', '.dark-band', '@media']) {
  if (!css.includes(token)) throw new Error(`Missing website style token: ${token}`)
}

if (!html.includes('https://github.com/mhgd3250905/ugk-md/releases/latest')) {
  throw new Error('Download CTA must point at GitHub Releases')
}

console.log('site smoke ok')
