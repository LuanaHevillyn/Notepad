import { app, BrowserWindow, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { ElectronMenu } from './menu';
import { TrayMenu } from './tray-menu';

const currentDir = fileURLToPath(new URL('.', import.meta.url));
let mainWindow: BrowserWindow | null;

interface AppElements {
  tray: TrayMenu | null;
  windows: BrowserWindow[];
}

const appElements: AppElements = {
  tray: null,
  windows: [],
};

export function createWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) return;

  mainWindow = new BrowserWindow({
    icon: path.resolve('src-electron/icons/bloco.png'),
    width: 800,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.resolve(
        currentDir,
        path.join(
          process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
          'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION,
        ),
      ),
    },
  });

  mainWindow.focus();

  if (process.env.DEV) {
    mainWindow.loadURL(process.env.APP_URL);
  } else {
    mainWindow.loadFile('index.html');
  }

  mainWindow.on('focus', () => {
    const menu = new ElectronMenu().createMenu();
    mainWindow?.setMenu(menu)
  });

  mainWindow.on('close', (event) => {
    if (mainWindow?.getTitle().includes(' • ')) {
      event.preventDefault();

      const response = dialog.showMessageBoxSync({
        type: 'warning',
        buttons: ['Sim', 'Não'],
        defaultId: 2,
        cancelId: 2,
        title: 'Confirmação',
        noLink: true,
        message: 'Você tem alterações não salvas. Deseja salvar antes de sair?',
      });

      if (response === 1) {
        mainWindow?.destroy();
      }
    }
  });
}

app.whenReady().then(() => {
  appElements.tray = new TrayMenu();
});

app.on('window-all-closed', () => {
  return;
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow();
  }
});