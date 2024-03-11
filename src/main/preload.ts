import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke("ping"),
});

contextBridge.exposeInMainWorld("micotoApi", {
  get: async (data?: any) => ipcRenderer.invoke("get", data),
  post: async (data: any) => ipcRenderer.invoke("post", data),
  command: async (data: any) => ipcRenderer.invoke("command", data),
  stream: (data: any) => ipcRenderer.invoke("stream", data),
  voice: (data: any) => ipcRenderer.invoke("voice", data),
  embody: (callback: any) => ipcRenderer.on("price", callback),
  speak: (callback: any) => ipcRenderer.on("voice", callback),
});
