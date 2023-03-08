// import { contextBridge, ipcRenderer } from 'electron';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping'),
});

contextBridge.exposeInMainWorld('clearkerApi', {
  get: async (data)=>ipcRenderer.invoke('get', data),
  post: async (data)=>ipcRenderer.invoke('post', data),
});

contextBridge.exposeInMainWorld('streamApi', {
  stream: (data)=>ipcRenderer.invoke('stream', data),
  voice: (data)=>ipcRenderer.invoke('voice', data),
});

ipcRenderer.on('enbody', (event, image)=>{
  console.log('come enbody');
  const camera = document.querySelector('.camera');
  if (camera) {
    camera.src = image;
  }
});

ipcRenderer.on('speak', (event, voice)=>{
  const speak = document.querySelector('.voice');
  if (speak){
    speak.src=voice;
    speak.play();
  }
});