import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
let win
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
  win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 760,
    minHeight: 520,
    title: 'UGK Markdown',
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
  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'mkd'] }],
  })
  if (result.canceled || !result.filePaths[0]) return null
  return readMarkdown(result.filePaths[0])
})

ipcMain.handle('open-external', (_event, url) => {
  openExternalUrl(url)
})

ipcMain.handle('read-file', (_event, filePath) => {
  if (!isMarkdownFile(filePath)) throw new Error('Only Markdown files can be opened')
  return readMarkdown(filePath)
})

async function openMarkdown(filePath) {
  if (!win) return
  try {
    win.webContents.send('file-opened', await readMarkdown(filePath))
  } catch (error) {
    dialog.showErrorBox('Open Markdown failed', error.message)
  }
}

async function readMarkdown(filePath) {
  const value = await fs.readFile(filePath, 'utf8')
  return {
    value,
    path: filePath,
    name: path.basename(filePath),
    baseUrl: pathToFileURL(path.dirname(filePath) + path.sep).href,
  }
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
