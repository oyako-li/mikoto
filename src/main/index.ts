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
import glob from 'glob';
import fs from 'fs';
import router from './server';

function myLog(file?:string) {
  return function() {
    const date = new Date();
    const path = `${app.getPath('userData')}/log/${date.getFullYear()}-${date.getMonth()+1}`;
    const now = `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}-${date.getMilliseconds()}`;
    if(!fs.existsSync(path)){
      fs.mkdirSync(path, { recursive: true });
    }
    fs.appendFileSync(`${path}/${date.getDate()}.log`, `${now}, ${Array.from(arguments).join(' ')}\r\n`);
  }
}

console.log = console.info = console.warn = console.error = myLog();

const port = new SerialPort({ path: '/dev/ttyUSB_manipulator', baudRate: 115200 });
const admin_port = new SerialPort({ path: '/dev/ttyUSB_admin', baudRate: 19200, dataBits: 8, stopBits: 1});
let result:any;
let admin_result:any='';
let count=0;
let pre_time:Date;
let win: BrowserWindow | null = null;


async function post_manipulator(data:string){
  return console.log('post-manipulator:',port.write(`${data}\r\n`));
}

async function post_admin(data:string){
  return admin_port.write(`${data}`);
}

function createWindow() {
  
  router.get('/', async (req, res) => { // <2>
    console.log('get /',__dirname);
    // res.send({ok:true});
    res.sendFile(path.join(__dirname, 'index.html'));
  });
  
  router.get('/test/', (req, res)=>res.send({ok:true}));
  
  router.get('/list/', async (req, res) => {
    const files = await glob(`${app.getPath('userData')}/log/*/*.log`);
    console.log(files);
    return res.json({files:files});
  });

  router.get('/log/:filename', async (req, res) => {
    const filename = req.params.filename;

    res.download(filename.replaceAll(',','/'), (err) => {
      if (err) {
        console.log('Error downloading file:', err);
      } else {
        console.log('File downloaded successfully');
      }
    });
  });

  

  router.listen(3000, () => {
    console.log('Listening on port 3000');
    win = new BrowserWindow({ 
      width: 800, 
      height: 600,
      frame: false,
      resizable: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    });
    win.maximize();
    win.loadURL(`http://127.0.0.1:3000/#/home`);
    win.on('closed', () => {win = null});
    post_manipulator('G90\r\nG00 Y220 F9000\r\n');
    pre_time=new Date();
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    port.close();
    admin_port.close();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.handle('post', (event, data)=>{
  return post_manipulator(data);
});

ipcMain.handle('get', async (event, data)=>{
  return await post_manipulator(data);
});

ipcMain.handle('stream', async (event, data)=>{
  return ipcMain.emit("enbody", data);
});

ipcMain.handle('voice', async (event, data)=>{
  let newData = data.split(';');
  newData[0] = "data:audio/ogg;";
  newData = newData[0] + newData[1];
  return ipcMain.emit('speak', newData);
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
  admin_result += `${admin_port.read()}`;
  if (admin_result.match(';')) {
    const command:string = admin_result.match(/([A-Z][A-Z])=/)[1];
    const code:string = admin_result.match(/[A-Z][A-Z]=(.+)/)[1];
    console.info('admin-read:', code);
    switch (command){
      case 'GC':
        post_manipulator(code);
        post_admin('ACK');
        break;
      case 'KN':
        ipcMain.emit('price', code);
        break;
      case 'OS':
        ipcMain.emit('voice', code);
        break;
      default:
        post_admin('NAK');
        break;
    }
    admin_result='';
  }
});

process.on('SIGINT',()=>{
  app.quit();
  port.close();
  admin_port.close();
})