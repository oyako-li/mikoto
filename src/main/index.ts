/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import { SerialPort } from 'serialport';

import path from 'path';
import fs from 'fs';

function myLog(file?:string) {
  return function() {
    fs.appendFileSync(file || './.log/log.log', Array.from(arguments).join(''));
  }
}

console.log = myLog();
console.warn = myLog();
console.error = myLog('errorLog.log');

const errorHandler = (err:any)=>{
  if (err) return console.error('Error: ', err.message);
}

const port = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 115200 }, errorHandler);

port.on('readable', function () {
  console.log('Data:', port.read());
});

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({ 
    width: 800, 
    height: 600,
    transparent: true,
    // frame: false,
    resizable: true,
    // alwaysOnTop: true
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.maximize();
  win.loadURL(`file://${path.join(__dirname, "../index.html")}`);
  win.on('closed', () => {win = null});
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


ipcMain.handle('send-GCode', async (event, data)=>{
  // return port.write(data, errorHandler);
  console.log('', data)
  return data;
});

ipcMain.handle('get-stream', async (event)=>{
  return 'gstream';
});
// ipcMain.handle('delete-alert', async (event, data)=>{
//   return;
// });
// ipcMain.handle('activate-alert', async (event, data)=>{
//   return;
// });
// ipcMain.handle('deactivate-alert', async (event, data)=>{
//   return;
// });
// ipcMain.handle('set-sound-alert', async (event, data)=>{
//   return;
// });