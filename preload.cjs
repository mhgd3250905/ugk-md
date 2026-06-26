const { contextBridge, ipcRenderer, webUtils } = require('electron')

contextBridge.exposeInMainWorld('ugkMarkdown', {
  openDialog: () => ipcRenderer.invoke('open-dialog'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  pathForFile: (file) => webUtils.getPathForFile(file),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  onFileOpened: (callback) => {
    ipcRenderer.on('file-opened', (_event, payload) => callback(payload))
  },
})
