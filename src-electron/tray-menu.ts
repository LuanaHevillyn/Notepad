import { BrowserWindow, Menu, Tray } from 'electron';
import { createWindow } from './electron-main';

export class TrayMenu {
  public readonly tray: Tray;
  public readonly mainWindow: BrowserWindow | null;

  constructor() {
    this.mainWindow = BrowserWindow.getFocusedWindow();
    this.tray = new Tray('src-electron/icons/bloco.png');
    this.tray.setContextMenu(this.createMenu());
    this.tray.setToolTip('Electron e Quasar App.');

    this.tray.on('double-click', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  }

  createMenu(): Menu {
    const template = Menu.buildFromTemplate([
      {
        label: 'Abrir App',
        click: () => {
          createWindow();
        },
      },
      { type: 'separator' },
      { role: 'quit', label: 'Fechar' },
    ]);
    return template;
  }
}
