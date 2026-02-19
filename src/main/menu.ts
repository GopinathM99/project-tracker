import { Menu, app, BrowserWindow, type MenuItemConstructorOptions } from 'electron'
import { createWindow } from './windows'
import { IPC_CHANNELS } from '@shared/types/ipc'

const isMac = process.platform === 'darwin'

function sendNavigate(route: string): void {
  const win = BrowserWindow.getFocusedWindow()
  if (win) {
    win.webContents.send(IPC_CHANNELS.MENU_NAVIGATE, route)
  }
}

export function createMenu(): void {
  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: isMac ? 'Cmd+Shift+P' : 'Ctrl+Shift+P',
          click: (): void => sendNavigate('/projects/new'),
        },
        {
          label: 'New Task',
          accelerator: isMac ? 'Cmd+N' : 'Ctrl+N',
          click: (): void => sendNavigate('/tasks/new'),
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Sidebar',
          accelerator: isMac ? 'Cmd+B' : 'Ctrl+B',
          click: (): void => sendNavigate('__toggle-sidebar__'),
        },
        { type: 'separator' },
        {
          label: 'Dashboard',
          accelerator: isMac ? 'Cmd+1' : 'Ctrl+1',
          click: (): void => sendNavigate('/dashboard'),
        },
        {
          label: 'Projects',
          accelerator: isMac ? 'Cmd+2' : 'Ctrl+2',
          click: (): void => sendNavigate('/projects'),
        },
        {
          label: 'Calendar',
          accelerator: isMac ? 'Cmd+3' : 'Ctrl+3',
          click: (): void => sendNavigate('/calendar'),
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        {
          label: 'New Window',
          accelerator: isMac ? 'Cmd+Shift+N' : 'Ctrl+Shift+N',
          click: (): void => {
            const id = `window-${Date.now()}`
            createWindow(id, '/')
          },
        },
        { type: 'separator' },
        ...(isMac ? [{ role: 'front' as const }] : [{ role: 'close' as const }]),
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Keyboard Shortcuts',
          accelerator: isMac ? 'Cmd+/' : 'Ctrl+/',
          click: (): void => sendNavigate('/settings/shortcuts'),
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
