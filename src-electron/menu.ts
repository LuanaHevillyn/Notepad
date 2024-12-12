import { BrowserWindow, dialog, ipcMain, Menu, nativeTheme, type IpcMainEvent } from 'electron';
import Store from 'electron-store';
import { readFileSync, writeFile } from 'fs';
import path from 'path';

const store = new Store();
let filePath: string | null = null;
const menuActions = ['open-file', 'save-changes', 'save-new-file', 'clean-all'];
let mainWindow: BrowserWindow | null;

export class ElectronMenu {
  constructor() {
    mainWindow = BrowserWindow.getFocusedWindow();
  }

  createMenu(): Menu {
    const template = Menu.buildFromTemplate([
      {
        role: 'fileMenu',
        submenu: [
          {
            label: 'Open file',
            accelerator: 'Ctrl+O',
            click: () => openFile(mainWindow),
          },
          {
            label: 'Save changes',
            accelerator: 'Ctrl+S',
            enabled: filePath != null,
            click: () => {
              const menuActionData = [menuActions[1], filePath];
              mainWindow?.webContents.send('menu-action', menuActionData);
            },
          },
          {
            label: 'Save file',
            accelerator: 'Ctrl+Shift+S',
            click: () => {
              const menuActionData = [menuActions[2]];
              mainWindow?.webContents.send('menu-action', menuActionData);
            },
          },
          {
            label: 'Clean all',
            accelerator: 'Ctrl+D',
            click: () => {
              cleanAll(mainWindow)
            },
          },
        ],
      },
      { role: 'editMenu' },
      {
        role: 'viewMenu',
        submenu: [
          {
            label: 'Change theme',
            submenu: [
              {
                label: 'Light theme',
                type: 'radio',
                checked: nativeTheme.themeSource == 'light',
                click: () => {
                  nativeTheme.themeSource = 'light';
                },
              },
              {
                label: 'Dark theme',
                type: 'radio',
                checked: nativeTheme.themeSource === 'dark',
                click: () => {
                  nativeTheme.themeSource = 'dark';
                },
              },
              {
                label: 'System theme',
                type: 'radio',
                checked: nativeTheme.themeSource === 'system',
                click: () => {
                  nativeTheme.themeSource = 'system';
                },
              },
            ],
          },
          {
            label: 'Change input color',
            submenu: [
              {
                label: 'Green',
                type: 'radio',
                checked: store.get('input-color') === 'green',
                click: () => {
                  store.set('input-color', 'green');
                  sendInputColor(mainWindow);
                },
              },
              {
                label: 'Red',
                type: 'radio',
                checked: store.get('input-color') === 'red',
                click: () => {
                  store.set('input-color', 'red');
                  sendInputColor(mainWindow);
                },
              },
              {
                label: 'White',
                type: 'radio',
                checked: store.get('input-color') === 'white',
                click: () => {
                  store.set('input-color', 'white');
                  sendInputColor(mainWindow);
                },
              },
              {
                label: 'Black',
                type: 'radio',
                checked: store.get('input-color') === 'black',
                click: () => {
                  store.set('input-color', 'black');
                  sendInputColor(mainWindow);
                },
              },
            ],
          },
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
      { role: 'windowMenu' },
      { role: 'help' },
    ]);
    return template;
  }
}

function sendInputColor(mainWindow: BrowserWindow | null) {
  mainWindow?.webContents.send(
    'change:input-color',
    store.get('input-color', 'white'),
  );
}

function cleanAll(mainWindow: BrowserWindow | null){
  filePath = null;
  mainWindow?.setTitle('Sem título');

  const menuActionData = [menuActions[3], ''];
  mainWindow?.webContents.send('menu-action', menuActionData);
}

async function openFile(mainWindow: BrowserWindow | null) {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: 'Documentos de texto (*.txt)', extensions: ['txt'] }],
    properties: ['openFile'],
  });
  if (canceled) return;

  filePath = filePaths[0]!;
  const content = readFileSync(filePath, 'utf8');
  const menuActionData = [menuActions[0], content];

  mainWindow?.setTitle(path.basename(filePath));
  mainWindow?.webContents.send('menu-action', menuActionData);

  const reloadedMenu = new ElectronMenu().createMenu();
  mainWindow?.setMenu(reloadedMenu)
}

async function handleSaveNewFile(_event: IpcMainEvent, fileText: string) {
  const firstLine = fileText.split('\n')[0];
  const defaultName = firstLine!.slice(0, 30);
  const result = await dialog.showSaveDialog({
    title: 'Salvar arquivo',
    defaultPath: defaultName,
    filters: [{ name: 'Documentos de texto (*.txt)', extensions: ['txt'] }],
  });

  if (result.canceled) return;

  writeFile(result.filePath, fileText, (error) => console.log(error));
  dialog.showMessageBox({
    type: 'none',
    title: 'Arquivo Salvo',
    message: 'O novo arquivo foi salvo com sucesso!',
  });  
  filePath = result.filePath;
  mainWindow?.setTitle(path.basename(filePath));
}

async function handleSaveChanges(
  _event: IpcMainEvent,
  filePath: string,
  fileContent: string,
) {
  writeFile(filePath, fileContent, (error) => console.log(error));

  dialog.showMessageBox({
    type: 'none',
    title: 'Arquivo Modificado',
    message: 'O texto do arquivo foi modificado!',
  });
  mainWindow?.setTitle(path.basename(filePath));
}

ipcMain.on('file:save-file', handleSaveNewFile);
ipcMain.on('file:save-changes', handleSaveChanges);
ipcMain.on('title:change-indicator', (_event, title: string) => {
  if (filePath) {
    const filename = path.basename(filePath);
    mainWindow?.setTitle(filename + ' • ');
  } else {
    mainWindow?.setTitle(title + ' • ');
  }
});