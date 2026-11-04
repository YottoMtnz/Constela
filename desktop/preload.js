// Puente seguro entre la app y Windows: sólo expone estas funciones.
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("desktop", {
  platform: "windows",
  saveFile: (name, data) => ipcRenderer.invoke("save-file", { name, data }),
  showInFolder: (p) => ipcRenderer.invoke("show-in-folder", p),
  fetchText: (url, headers) => ipcRenderer.invoke("fetch-text", { url, headers }),
  fetchBinary: (url) => ipcRenderer.invoke("fetch-binary", { url }),
  streamFetch: (id, url, opts) => ipcRenderer.invoke("stream-fetch", { id, url, opts }),
  abortStream: (id) => ipcRenderer.invoke("stream-abort", id),
  onStream: (cb) => { ipcRenderer.on("stream-ev", (_e, msg) => cb(msg)); },
});
