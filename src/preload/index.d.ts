declare global {
  interface Window {
    electronAPI: {
      platform: NodeJS.Platform
      openNewWindow: (route: string) => Promise<void>
      minimizeWindow: () => Promise<void>
      closeWindow: () => Promise<void>
      getAppVersion: () => Promise<string>
      showNotification: (title: string, body: string) => Promise<void>
      openFileDialog: () => Promise<string[] | null>
      saveFileDialog: (defaultPath: string) => Promise<string | null>
      copyFile: (sourcePath: string, destDir: string, fileName: string) => Promise<string>
      readFile: (filePath: string) => Promise<string>
      writeFile: (filePath: string, data: string) => Promise<void>
      shellOpenPath: (filePath: string) => Promise<string>
      setBadgeCount: (count: number) => Promise<void>
      onUpdateAvailable: (callback: () => void) => void
      onMenuNavigate: (callback: (route: string) => void) => () => void
    }
  }
}

export {}
