/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 * npm install --no-save --build-from-source serialport@10.4.0 // build serialport
 */
'use struct';

import { app, BrowserWindow, ipcMain, shell } from 'electron';
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
    fs.appendFileSync(`${path}/${date.getDate()}.log`, `${now}, ${Array.from(arguments).join(' ')}\r\n`);
  }
}

console.log = console.info = console.warn = console.error = myLog();
const port = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 115200 });
let result:any;

const admin_port = new SerialPort({ path: '/dev/ttyUSB1', baudRate: 19200 });
let admin_result:any;

async function post_manipulator(data:string){
  return port.write(`${data}`);
}

async function post_admin(data:string){
  return admin_port.write(`${data}`);
}
let count=0;
let pre_time:Date;
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
  win.loadURL(`http://localhost:3000/`);
  // win.loadURL(`file://${path.join(__dirname, "../index.html")}`);
  win.on('closed', () => {win = null});
  win.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });

  post_manipulator('G90\r\nG00 Y220 F9000\r\n');
  pre_time=new Date();
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
  return post_admin(data);
});

ipcMain.handle('get', async (event, data)=>{
  return await post_manipulator(data);
});

ipcMain.handle('stream', async (event, data)=>{
  return event.sender.send("enbody", data);
});

ipcMain.handle('voice', async (event, data)=>{
  let newData = data.split(';');
  newData[0] = "data:audio/ogg;";
  newData = newData[0] + newData[1];
  return event.sender.send('speak', newData);
});

port.on('readable', async function () {
  result = `${port.read()}`.match(/Y:\d+\.\d+/);
  if(result !== null) {
    console.info('manipurator-read:', result);
    // win.webContents.send('position', result);
    let now_time = new Date();
    let buf_time = now_time.getTime()-pre_time.getTime();
    if (`${result}`==='Y:220.00' && buf_time>1000) {
      let gcode = await port.write('G00 Y0 F9000\r\nG00 Y220 F9000\r\n');
      post_admin(`${gcode}`);
      console.log(`remove220to0:${gcode}, count:${count++}, time:${buf_time/1000}`);
      pre_time=now_time;
    }
  }
});

admin_port.on('readable', function () {
  admin_result = `${admin_port.read()}`.replace(' ', '_').replace('\r','_').replace('\n','_');
  console.info('admin-read:', admin_result);
});
