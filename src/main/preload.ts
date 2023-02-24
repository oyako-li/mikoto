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
