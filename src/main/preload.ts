import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping'),
});

contextBridge.exposeInMainWorld('clearkerApi', {
  get: async (data?:any)=>ipcRenderer.invoke('get', data),
  post: async (data:any)=>ipcRenderer.invoke('post', data),
});

contextBridge.exposeInMainWorld('streamApi', {
  stream: (data:any)=>ipcRenderer.invoke('stream', data),
  voice: (data:any)=>ipcRenderer.invoke('voice', data),
});

ipcRenderer.on('enbody', (event, image)=>{
  const camera:HTMLImageElement = document.querySelector('#camera');
  if (camera) {
    camera.src = image;
  }
});

ipcRenderer.on('speak', (event, voice)=>{
  const speak:HTMLAudioElement = document.querySelector('#voice');
  if (speak){
    speak.src=voice;
    speak.play();
  }
});