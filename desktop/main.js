// Constela para Windows (Electron).
// - Sirve la app desde app://constela (así Ollama la acepta sin configurar CORS).
// - Las descargas abren «Guardar como» y se escriben en disco de verdad.
// - Lee webs sin CORS para las herramientas buscar_web / leer_web.
// - El inicio de sesión de Puter se abre en una ventana propia.
const { app, BrowserWindow, protocol, net, ipcMain, dialog, shell, session, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");

// La carpeta www/ trae la pagina de presentacion en la raiz y la app en app/:
// se sirve la app desde app/app para que app://constela/index.html sea el chat.
const APP_DIR = path.join(__dirname, "app", "app");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true, codeCache: true } },
]);

if (!app.requestSingleInstanceLock()) app.quit();

let win = null;
function createWindow() {
  win = new BrowserWindow({
    width: 1320, height: 880, minWidth: 380, minHeight: 520,
    backgroundColor: "#1B1423", title: "Constela", autoHideMenuBar: true,
    icon: path.join(__dirname, "icon.png"),
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: true },
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    // Puter abre una ventana para iniciar sesión y se comunica con la app: debe quedarse dentro de Electron.
    if (/^https:\/\/([a-z0-9-]+\.)*puter\.(com|site)\//i.test(url)) return { action: "allow", overrideBrowserWindowOptions: { width: 560, height: 760, autoHideMenuBar: true, parent: win } };
    // Vistas previas (blob:) e impresión (about:blank) se abren dentro de la app.
    if (url === "about:blank" || url.startsWith("blob:")) return { action: "allow", overrideBrowserWindowOptions: { autoHideMenuBar: true } };
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith("app://")) { e.preventDefault(); if (/^https?:/i.test(url)) shell.openExternal(url); } });
  win.loadURL("app://constela/index.html");
}

app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  protocol.handle("app", (req) => {
    const { pathname } = new URL(req.url);
    let rel = decodeURIComponent(pathname); if (rel === "/" || rel === "") rel = "/index.html";
    const file = path.normalize(path.join(APP_DIR, rel));
    if (!file.startsWith(APP_DIR)) return new Response("Prohibido", { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
  const ses = session.defaultSession;
  ses.setPermissionRequestHandler((_wc, perm, cb) => cb(["media", "clipboard-read", "clipboard-sanitized-write", "notifications", "fullscreen"].includes(perm)));
  // Deja que las páginas de Perchance se muestren dentro de la app aunque pidan no ser incrustadas.
  ses.webRequest.onHeadersReceived({ urls: ["https://perchance.org/*", "https://*.perchance.org/*"] }, (details, cb) => {
    const h = { ...details.responseHeaders };
    for (const k of Object.keys(h)) {
      const lk = k.toLowerCase();
      if (lk === "x-frame-options") delete h[k];
      if (lk === "content-security-policy") h[k] = h[k].map((v) => v.replace(/frame-ancestors[^;]*;?/gi, ""));
    }
    cb({ responseHeaders: h });
  });
  // Cualquier otra descarga (enlaces, imágenes…) también pregunta dónde guardar.
  ses.on("will-download", (_e, item) => { item.setSaveDialogOptions({ defaultPath: path.join(app.getPath("downloads"), item.getFilename()) }); });

  ipcMain.handle("save-file", async (e, { name, data }) => {
    const owner = BrowserWindow.fromWebContents(e.sender);
    const r = await dialog.showSaveDialog(owner, { defaultPath: path.join(app.getPath("downloads"), name) });
    if (r.canceled || !r.filePath) return { canceled: true };
    await fs.promises.writeFile(r.filePath, Buffer.from(data));
    return { path: r.filePath };
  });
  ipcMain.handle("show-in-folder", (_e, p) => { shell.showItemInFolder(p); });
  ipcMain.handle("fetch-text", async (_e, { url, headers }) => {
    if (!/^https?:\/\//i.test(url)) throw new Error("URL no válida");
    const r = await net.fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "es,en;q=0.8", ...(headers || {}) } });
    const text = await r.text();
    return { status: r.status, url: r.url, text: text.slice(0, 5_000_000) };
  });
  // Peticiones de los modelos sin CORS, con la respuesta en vivo (streaming) hacia la app.
  const streams = new Map();
  ipcMain.handle("stream-fetch", async (e, { id, url, opts }) => {
    if (!/^https?:\/\//i.test(url)) throw new Error("URL no válida");
    const ctl = new AbortController(); streams.set(id, ctl);
    const to = setTimeout(() => ctl.abort(), (opts && opts.connectTimeout) || 30000);
    let r;
    try { r = await net.fetch(url, { method: opts.method || "GET", headers: opts.headers || {}, body: opts.body, signal: ctl.signal }); }
    catch (err) { streams.delete(id); throw err; }
    finally { clearTimeout(to); }
    const sender = e.sender;
    (async () => {
      try {
        if (r.body) { const reader = r.body.getReader(); for (;;) { const { value, done } = await reader.read(); if (done) break; if (!sender.isDestroyed()) sender.send("stream-ev", { id, chunk: value }); } }
        if (!sender.isDestroyed()) sender.send("stream-ev", { id, done: true });
      } catch (err) { if (!sender.isDestroyed()) sender.send("stream-ev", { id, error: String((err && err.message) || err) }); }
      finally { streams.delete(id); }
    })();
    return { status: r.status, headers: Object.fromEntries(r.headers.entries()) };
  });
  ipcMain.handle("stream-abort", (_e, id) => { const c = streams.get(id); if (c) { c.abort(); streams.delete(id); } });
  ipcMain.handle("fetch-binary", async (_e, { url }) => {
    if (!/^https?:\/\//i.test(url)) throw new Error("URL no válida");
    const r = await net.fetch(url, { headers: { "User-Agent": UA } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return { type: r.headers.get("content-type") || "", data: new Uint8Array(await r.arrayBuffer()) };
  });

  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
