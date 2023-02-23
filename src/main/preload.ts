import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping'),
});

contextBridge.exposeInMainWorld('clearkerApi', {
  getStream: async ()=>ipcRenderer.invoke('get-stream'),
  sendGCode: async (data:any)=>ipcRenderer.invoke('send-GCode', data),
});