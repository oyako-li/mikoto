/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 * npm install --no-save --build-from-source serialport@10.4.0 // build serialport
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import { SerialPort } from 'serialport';

import path from 'path';
import fs from 'fs';

function myLog(file?:string) {
  return function() {
    const date = new Date();
    const path = `./.log/${date.getFullYear()}-${date.getMonth()+1}`;
    const now = `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}-${date.getMilliseconds()}`;
    if(!fs.existsSync(path)){
      fs.mkdirSync(path, { recursive: true });
    }
    fs.appendFileSync(`${path}/${date.getDate()}.log`, `${now}, ${Array.from(arguments).join('')}\r\n`);
  }
}

console.log = console.info = console.warn = console.error = myLog();

const port = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 115200 });
let result:any;

port.on('readable', function () {
  result = `${port.read()}`.replace(' ', '_').replace('\r','_').replace('\n','_');
  console.info('manipurator-read:', result);
});

const admin_port = new SerialPort({ path: '/dev/ttyUSB1', baudRate: 19200 });
let admin_result:any;
admin_port.on('readable', function () {
  admin_result = `${admin_port.read()}`.replace(' ', '_').replace('\r','_').replace('\n','_');
  console.info('admin-read:', admin_result);
});

async function post_manipulator(data:string){
  return console.info(`manipulator-{${data}}:`.replace(' ', '_').replace('\r','_').replace('\n','_'), port.write(`${data}\r\n`));
}

async function post_admin(data:string){
  return console.info(`admin-{${data}}:`.replace(' ', '_').replace('\r','_').replace('\n','_'), admin_port.write(`${data}\r\n`));
}

async function get_manipulator(data?:string){
  if(data){await post_manipulator(data)};
  return `${port.read()}`;
}

async function get_admin(data?:string){
  if(data){await post_admin(data)};
  return `${admin_port.read()}`;
}

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

ipcMain.handle('post', (event, data)=>{
  post_admin(data);
  return post_manipulator(data);
});

ipcMain.handle('get', async (event, data)=>{
  post_admin(data);
  return await get_manipulator(data);
});
