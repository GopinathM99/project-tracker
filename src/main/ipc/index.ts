import { ipcMain, dialog, Notification, app, BrowserWindow, shell } from 'electron'
import { IPC_CHANNELS } from '@shared/types/ipc'
import { createWindow } from '../windows'
import * as fs from 'node:fs'
import * as path from 'node:path'

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.WINDOW_OPEN, (_event, route: string) => {
    const id = `window-${Date.now()}`
    createWindow(id, route)
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  ipcMain.handle(IPC_CHANNELS.APP_VERSION, () => {
    return app.getVersion()
  })

  ipcMain.handle(
    IPC_CHANNELS.NOTIFICATION_SHOW,
    (_event, title: string, body: string) => {
      new Notification({ title, body }).show()
    },
  )

  ipcMain.handle(IPC_CHANNELS.DIALOG_OPEN_FILE, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
    })
    return result.canceled ? null : result.filePaths
  })

  ipcMain.handle(IPC_CHANNELS.DIALOG_SAVE_FILE, async (_event, defaultPath: string) => {
    const result = await dialog.showSaveDialog({ defaultPath })
    return result.canceled ? null : result.filePath
  })

  ipcMain.handle(
    IPC_CHANNELS.FS_COPY_FILE,
    async (_event, sourcePath: string, destDir: string, fileName: string) => {
      const attachmentsDir = path.join(app.getPath('userData'), 'attachments', destDir)
      if (!fs.existsSync(attachmentsDir)) {
        fs.mkdirSync(attachmentsDir, { recursive: true })
      }
      const destPath = path.join(attachmentsDir, fileName)
      fs.copyFileSync(sourcePath, destPath)
      return destPath
    },
  )

  ipcMain.handle(IPC_CHANNELS.FS_READ_FILE, async (_event, filePath: string) => {
    return fs.readFileSync(filePath, 'utf-8')
  })

  ipcMain.handle(
    IPC_CHANNELS.FS_WRITE_FILE,
    async (_event, filePath: string, data: string) => {
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(filePath, data, 'utf-8')
    },
  )

  ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_PATH, async (_event, filePath: string) => {
    return shell.openPath(filePath)
  })

  ipcMain.handle(IPC_CHANNELS.BADGE_SET, (_event, count: number) => {
    app.setBadgeCount(count)
  })
}
