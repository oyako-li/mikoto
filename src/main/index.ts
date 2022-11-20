/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */
import { app, BrowserWindow } from 'electron';
import path from 'path';

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({ 
    width: 800, 
    height: 600,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true
  });
  // console.log(`file://${path.join(__dirname, "../index.html")}`);
  win.loadURL(`file://${path.join(__dirname, "../index.html")}`);
  win.on('closed', () => {win = null});
  win.webContents.isDevToolsOpened();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});