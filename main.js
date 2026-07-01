import { app, BrowserWindow, clipboard, dialog, ipcMain, Menu, nativeTheme, shell } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { appName, defaultLanguage, languages, normalizeLanguage, t } from './src/i18n.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
let win
let currentLanguage = defaultLanguage
let pendingFile = firstMarkdownArg(process.argv)

if (process.env.UGK_MD_DEBUG_PORT) {
  app.commandLine.appendSwitch('remote-debugging-port', process.env.UGK_MD_DEBUG_PORT)
}

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) app.quit()

app.on('second-instance', (_event, argv) => {
  const filePath = firstMarkdownArg(argv)
  if (filePath) openMarkdown(filePath)
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('open-file', (event, filePath) => {
  event.preventDefault()
  if (win) openMarkdown(filePath)
  else pendingFile = filePath
})

app.whenReady().then(createWindow)

async function createWindow() {
  createMenu()

  win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 760,
    minHeight: 520,
    title: appName,
    backgroundColor: '#f7f7f7',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    await win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    await win.loadFile(path.join(__dirname, 'dist/index.html'))
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (openExternalUrl(url)) return { action: 'deny' }
    return { action: 'allow' }
  })

  win.webContents.on('will-navigate', (event, url) => {
    if (openExternalUrl(url)) event.preventDefault()
  })

  if (pendingFile) openMarkdown(pendingFile)
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.handle('open-dialog', async () => {
  return chooseMarkdown()
})

ipcMain.handle('open-external', (_event, url) => {
  openExternalUrl(url)
})

ipcMain.handle('read-file', (_event, filePath) => {
  if (!isMarkdownFile(filePath)) throw new Error('Only Markdown files can be opened')
  return readMarkdown(filePath)
})

ipcMain.handle('read-clipboard', () => clipboard.readText())

ipcMain.handle('save-file', (_event, filePath, value) => {
  if (!isMarkdownFile(filePath)) throw new Error('Only Markdown files can be saved')
  return writeMarkdown(filePath, value)
})

ipcMain.handle('save-file-as', async (_event, value, defaultName) => {
  const result = await dialog.showSaveDialog(win, {
    defaultPath: defaultName || 'Untitled Markdown.md',
    filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
  })
  if (result.canceled || !result.filePath) return null
  return writeMarkdown(ensureMarkdownExtension(result.filePath), value)
})

ipcMain.handle('set-language', (_event, language) => {
  currentLanguage = normalizeLanguage(language)
  createMenu()
  return currentLanguage
})

ipcMain.handle('set-theme', (_event, dark) => {
  nativeTheme.themeSource = dark ? 'dark' : 'light'
  win?.setBackgroundColor(dark ? '#0b0f16' : '#f7f7f7')
})

async function openMarkdown(filePath) {
  if (!win) return
  try {
    win.webContents.send('file-opened', await readMarkdown(filePath))
  } catch (error) {
    dialog.showErrorBox('Open Markdown failed', error.message)
  }
}

async function openMarkdownFromDialog() {
  const file = await chooseMarkdown()
  if (file) win?.webContents.send('file-opened', file)
}

async function chooseMarkdown() {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'mkd'] }],
  })
  if (result.canceled || !result.filePaths[0]) return null
  return readMarkdown(result.filePaths[0])
}

async function readMarkdown(filePath) {
  const value = await fs.readFile(filePath, 'utf8')
  return markdownFile(filePath, value)
}

async function writeMarkdown(filePath, value) {
  await fs.writeFile(filePath, String(value ?? ''), 'utf8')
  return markdownFile(filePath, String(value ?? ''))
}

function markdownFile(filePath, value) {
  return {
    value,
    path: filePath,
    name: path.basename(filePath),
    baseUrl: pathToFileURL(path.dirname(filePath) + path.sep).href,
    persisted: true,
  }
}

function createMenu() {
  const template = [
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
    {
      label: t(currentLanguage, 'menu.file'),
      submenu: [
        { label: t(currentLanguage, 'menu.new'), accelerator: 'CmdOrCtrl+N', click: () => win?.webContents.send('new-document') },
        { label: t(currentLanguage, 'menu.open'), accelerator: 'CmdOrCtrl+O', click: openMarkdownFromDialog },
        { label: t(currentLanguage, 'menu.paste'), click: () => win?.webContents.send('paste-document') },
        { label: t(currentLanguage, 'menu.save'), accelerator: 'CmdOrCtrl+S', click: () => win?.webContents.send('save-document') },
        { label: t(currentLanguage, 'menu.saveAs'), accelerator: 'CmdOrCtrl+Shift+S', click: () => win?.webContents.send('save-as-document') },
        { type: 'separator' },
        { label: t(currentLanguage, 'menu.close'), role: 'close' },
        { type: 'separator' },
        { label: t(currentLanguage, 'menu.quit'), role: 'quit' },
      ],
    },
    {
      label: t(currentLanguage, 'menu.language'),
      submenu: Object.entries(languages).map(([id, language]) => ({
        label: language.label,
        type: 'radio',
        checked: id === currentLanguage,
        click: () => selectLanguage(id),
      })),
    },
    {
      label: t(currentLanguage, 'menu.view'),
      submenu: [
        { label: t(currentLanguage, 'menu.reload'), role: 'reload' },
        { label: t(currentLanguage, 'menu.toggleDevTools'), role: 'toggleDevTools' },
        { type: 'separator' },
        { label: t(currentLanguage, 'menu.resetZoom'), role: 'resetZoom' },
        { label: t(currentLanguage, 'menu.zoomIn'), role: 'zoomIn' },
        { label: t(currentLanguage, 'menu.zoomOut'), role: 'zoomOut' },
      ],
    },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function selectLanguage(language) {
  currentLanguage = normalizeLanguage(language)
  createMenu()
  win?.webContents.send('language-selected', currentLanguage)
}

function firstMarkdownArg(argv) {
  return argv.find(isMarkdownFile)
}

function openExternalUrl(url) {
  if (!/^https?:\/\//i.test(url)) return false
  shell.openExternal(url)
  return true
}

function isMarkdownFile(filePath) {
  return /\.(md|markdown|mdown|mkd)$/i.test(filePath)
}

function ensureMarkdownExtension(filePath) {
  return isMarkdownFile(filePath) ? filePath : `${filePath}.md`
}
