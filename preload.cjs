const { contextBridge, ipcRenderer, webUtils } = require('electron')

contextBridge.exposeInMainWorld('ugkMarkdown', {
  openDialog: () => ipcRenderer.invoke('open-dialog'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  pathForFile: (file) => webUtils.getPathForFile(file),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  readClipboard: () => ipcRenderer.invoke('read-clipboard'),
  saveFile: (filePath, value) => ipcRenderer.invoke('save-file', filePath, value),
  saveFileAs: (value, defaultName) => ipcRenderer.invoke('save-file-as', value, defaultName),
  setLanguage: (language) => ipcRenderer.invoke('set-language', language),
  setTheme: (dark) => ipcRenderer.invoke('set-theme', dark),
  onFileOpened: (callback) => {
    ipcRenderer.on('file-opened', (_event, payload) => callback(payload))
  },
  onNewDocument: (callback) => {
    ipcRenderer.on('new-document', callback)
  },
  onPasteDocument: (callback) => {
    ipcRenderer.on('paste-document', callback)
  },
  onSaveDocument: (callback) => {
    ipcRenderer.on('save-document', callback)
  },
  onSaveAsDocument: (callback) => {
    ipcRenderer.on('save-as-document', callback)
  },
  onLanguageSelected: (callback) => {
    ipcRenderer.on('language-selected', (_event, language) => callback(language))
  },
})
