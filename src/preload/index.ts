import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '@shared/types/ipc'

const electronAPI = {
  platform: process.platform,

  openNewWindow: (route: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_OPEN, route),

  minimizeWindow: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),

  closeWindow: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),

  getAppVersion: (): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.APP_VERSION),

  showNotification: (title: string, body: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_SHOW, title, body),

  openFileDialog: (): Promise<string[] | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_FILE),

  saveFileDialog: (defaultPath: string): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SAVE_FILE, defaultPath),

  copyFile: (sourcePath: string, destDir: string, fileName: string): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_COPY_FILE, sourcePath, destDir, fileName),

  readFile: (filePath: string): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_READ_FILE, filePath),

  writeFile: (filePath: string, data: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_WRITE_FILE, filePath, data),

  shellOpenPath: (filePath: string): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHELL_OPEN_PATH, filePath),

  setBadgeCount: (count: number): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.BADGE_SET, count),

  onUpdateAvailable: (callback: () => void): void => {
    ipcRenderer.on('update:available', callback)
  },

  onMenuNavigate: (callback: (route: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, route: string): void => callback(route)
    ipcRenderer.on(IPC_CHANNELS.MENU_NAVIGATE, handler)
    return () => {
      ipcRenderer.removeAllListeners(IPC_CHANNELS.MENU_NAVIGATE)
    }
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
