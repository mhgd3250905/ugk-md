import { Viewer } from 'bytemd'
import breaks from '@bytemd/plugin-breaks'
import frontmatter from '@bytemd/plugin-frontmatter'
import gemoji from '@bytemd/plugin-gemoji'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import math from '@bytemd/plugin-math'
import mediumZoom from '@bytemd/plugin-medium-zoom'
import mermaid from '@bytemd/plugin-mermaid'
import { appName, languages, normalizeLanguage, t } from './i18n.js'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/github.css'
import 'katex/dist/katex.css'
import './styles.css'

const plugins = [
  breaks(),
  frontmatter(),
  gfm(),
  highlight(),
  math(),
  mermaid(),
  mediumZoom(),
  gemoji(),
]
const app = document.querySelector('#app')
const main = document.querySelector('main')
const readerTemplate = document.querySelector('#reader-template')
const empty = document.querySelector('#empty')
const fileLabel = document.querySelector('#file')
const base = document.querySelector('#markdown-base')
const openButton = document.querySelector('#open')
const compareButton = document.querySelector('#compare')
const themeButton = document.querySelector('#theme')
let currentFile = null
let language = normalizeLanguage(localStorage.getItem('ugkMarkdownLanguage') || navigator.language)
let reader
let source
let viewer

setLanguage(language)
window.ugkMarkdown.setLanguage(language)
window.ugkMarkdown.setTheme(document.body.classList.contains('dark'))

openButton.addEventListener('click', async () => {
  const file = await window.ugkMarkdown.openDialog()
  if (file) show(file)
})

themeButton.addEventListener('click', toggleTheme)

compareButton.addEventListener('click', toggleCompare)

document.addEventListener('keydown', async (event) => {
  const command = event.metaKey || event.ctrlKey
  if (!command) return

  if (event.key.toLowerCase() === 'o') {
    event.preventDefault()
    const file = await window.ugkMarkdown.openDialog()
    if (file) show(file)
  }

  if (event.key.toLowerCase() === 'b') {
    event.preventDefault()
    toggleCompare()
  }

  if (event.key.toLowerCase() === 'd') {
    event.preventDefault()
    toggleTheme()
  }
})

document.addEventListener('dragover', (event) => {
  event.preventDefault()
  document.body.classList.add('dragging')
})

document.addEventListener('dragleave', (event) => {
  if (event.relatedTarget) return
  document.body.classList.remove('dragging')
})

document.addEventListener('drop', async (event) => {
  event.preventDefault()
  document.body.classList.remove('dragging')
  const file = event.dataTransfer?.files?.[0]
  const filePath = file ? window.ugkMarkdown.pathForFile(file) : ''
  if (!filePath || !/\.(md|markdown|mdown|mkd)$/i.test(filePath)) return
  show(await window.ugkMarkdown.readFile(filePath))
})

window.ugkMarkdown.onFileOpened(show)
window.ugkMarkdown.onLanguageSelected(setLanguage)

function show(file) {
  ensureReader()
  currentFile = file
  base.href = file.baseUrl
  fileLabel.textContent = file.path
  source.value = file.value
  document.title = `${file.name} - ${appName}`
  empty.hidden = true
  compareButton.disabled = false
  viewer.$set({ value: file.value })
}

function ensureReader() {
  if (reader) return

  reader = document.createElement('div')
  reader.id = 'reader'
  reader.append(readerTemplate.content.cloneNode(true))
  main.append(reader)

  source = reader.querySelector('#source')
  const viewerTarget = reader.querySelector('#viewer')
  viewer = new Viewer({
    target: viewerTarget,
    props: { value: '', plugins },
  })

  source.addEventListener('input', () => {
    viewer.$set({ value: source.value })
  })

  viewerTarget.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return
    const link = event.target.closest('a')
    if (!link) return

    const href = link.getAttribute('href') || ''
    if (href.startsWith('#')) {
      event.preventDefault()
      scrollToHash(href)
      return
    }

    if (!/^https?:\/\//i.test(link.href)) return
    event.preventDefault()
    window.ugkMarkdown.openExternal(link.href)
  })

  setLanguage(language)
}

function setLanguage(next) {
  language = normalizeLanguage(next)
  localStorage.setItem('ugkMarkdownLanguage', language)
  document.documentElement.lang = languages[language].locale

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    if (element === fileLabel && currentFile) return
    element.textContent = t(language, element.dataset.i18n)
  })

  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    element.setAttribute('aria-label', t(language, element.dataset.i18nAriaLabel))
  })

  app.dataset.dropLabel = t(language, 'drop.label')
  refreshModeLabels()
}

function toggleTheme() {
  const dark = document.body.classList.toggle('dark')
  window.ugkMarkdown.setTheme(dark)
  themeButton.setAttribute('aria-pressed', String(dark))
  refreshModeLabels()
}

function toggleCompare() {
  if (!currentFile) return
  document.body.classList.toggle('compare')
  compareButton.setAttribute('aria-pressed', String(document.body.classList.contains('compare')))
  refreshModeLabels()
}

function refreshModeLabels() {
  themeButton.textContent = t(language, document.body.classList.contains('dark') ? 'theme.light' : 'theme.dark')
  compareButton.textContent = t(language, document.body.classList.contains('compare') ? 'compare.reader' : 'compare.compare')
}

function scrollToHash(hash) {
  const id = decodeURIComponent(hash.slice(1))
  const target = document.getElementById(id) || document.querySelector(`[name="${CSS.escape(id)}"]`)
  target?.scrollIntoView({ block: 'center' })
}