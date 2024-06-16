import { contextBridge, ipcRenderer } from "electron";

declare global {
  interface Window {
    ipcRenderer: any;
  }
}
//expose global window.electronAPI for font-end by contextBridge
contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel: string, data: any) => ipcRenderer.send(channel, data),
  on: (channel: string, func: any) =>
    ipcRenderer.on(channel, (...args) => func(...args)),
  invoke: (channel: string, data: any) => ipcRenderer.invoke(channel, data),
});
