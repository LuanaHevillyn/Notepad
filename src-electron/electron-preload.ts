/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.ts you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in preload script
 *   }
 * }
 */

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('file', {
  menuAction: (callback: (menuActionData: string[]) => void) =>
    ipcRenderer.on('menu-action', (_event, menuActionData) => callback(menuActionData)),
  sendTextForNewFile: (fileContent: string) => ipcRenderer.send('file:save-file',  fileContent),
  sendTextForChanges: (filePath: string, fileContent: string) => ipcRenderer.send('file:save-changes', filePath, fileContent),
});

contextBridge.exposeInMainWorld('change', {
  inputColor: (callback: (inputColor: string) => void) =>
    ipcRenderer.on('change:input-color', (_event, inputColor) => callback(inputColor)),
})

contextBridge.exposeInMainWorld('title', {
  displayChangeIndicator: (title: string) => ipcRenderer.send('title:change-indicator', title),
})
