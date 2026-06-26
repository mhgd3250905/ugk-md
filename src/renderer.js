import { Viewer } from 'bytemd'
import breaks from '@bytemd/plugin-breaks'
import frontmatter from '@bytemd/plugin-frontmatter'
import gemoji from '@bytemd/plugin-gemoji'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import math from '@bytemd/plugin-math'
import mediumZoom from '@bytemd/plugin-medium-zoom'
import mermaid from '@bytemd/plugin-mermaid'
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
const viewerTarget = document.querySelector('#viewer')
const empty = document.querySelector('#empty')
const fileLabel = document.querySelector('#file')
const base = document.querySelector('#markdown-base')
const source = document.querySelector('#source')
const openButton = document.querySelector('#open')
const compareButton = document.querySelector('#compare')
const themeButton = document.querySelector('#theme')
const viewer = new Viewer({
  target: viewerTarget,
  props: { value: '', plugins },
})

openButton.addEventListener('click', async () => {
  const file = await window.ugkMarkdown.openDialog()
  if (file) show(file)
})

themeButton.addEventListener('click', toggleTheme)

compareButton.addEventListener('click', toggleCompare)

source.addEventListener('input', () => {
  viewer.$set({ value: source.value })
})

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

window.ugkMarkdown.onFileOpened(show)

function show(file) {
  base.href = file.baseUrl
  fileLabel.textContent = file.path
  source.value = file.value
  document.title = `${file.name} - UGK Markdown`
  empty.hidden = true
  viewer.$set({ value: file.value })
}

function toggleTheme() {
  const dark = document.body.classList.toggle('dark')
  themeButton.textContent = dark ? 'Light' : 'Dark'
  themeButton.setAttribute('aria-pressed', String(dark))
}

function toggleCompare() {
  const compare = document.body.classList.toggle('compare')
  compareButton.textContent = compare ? 'Reader' : 'Compare'
  compareButton.setAttribute('aria-pressed', String(compare))
}

function scrollToHash(hash) {
  const id = decodeURIComponent(hash.slice(1))
  const target = document.getElementById(id) || document.querySelector(`[name="${CSS.escape(id)}"]`)
  target?.scrollIntoView({ block: 'center' })
}
