export const IPC_CHANNELS = {
  WINDOW_OPEN: 'window:open',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_CLOSE: 'window:close',
  APP_VERSION: 'app:version',
  NOTIFICATION_SHOW: 'notification:show',
  DIALOG_OPEN_FILE: 'dialog:openFile',
  DIALOG_SAVE_FILE: 'dialog:saveFile',
  FS_COPY_FILE: 'fs:copyFile',
  FS_READ_FILE: 'fs:readFile',
  FS_WRITE_FILE: 'fs:writeFile',
  SHELL_OPEN_PATH: 'shell:openPath',
  BADGE_SET: 'badge:set',
  MENU_NAVIGATE: 'menu:navigate',
} as const

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]
