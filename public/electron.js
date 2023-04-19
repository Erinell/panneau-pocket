const path = require('path');

const { app, shell, BrowserWindow, dialog } = require('electron');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const { ipcMain } = require('electron')
const contextMenu = require('electron-context-menu');
const { autoUpdater } = require('electron-updater');

contextMenu({
  showInspectElement: false,
  showSaveImageAs: true,
  showSelectAll: false,
  labels: {
    copyImage: "Copier l'image",
    saveImageAs: 'Enregistrer sous...'
  }
});

let win;
function sendStatusToWindow(payload) {
  win.webContents.send('update-rcv', payload);
}

let store = new Store();
function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    title: "Panneau Pocket",
    width: 700,
    height: 700,
    minWidth: 700,
    minHeight: 600,
    icon: path.join(__dirname, '/icons/linux-512x512.png'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      webviewTag: true,
      nativeWindowOpen: false,

    },
    // resizable: false,
    fullscreenable: false,
  });
  win.setMenuBarVisibility(false);


  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
    // process.env.APPIMAGE = path.join(__dirname, 'dist', `panneau-pocket_${app.getVersion()}_amd64.deb`)
  }

}

app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
  // vérifie si mise à jour disponible
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('web-contents-created', (_, webContents) => {
  webContents.on('did-fail-load', (event, errorCode) => console.log('did-fail-load'));

  webContents.on('did-create-window', function (win, details) {
    // details.url
    win.setMenuBarVisibility(false);

    if (details.url.startsWith('mailto:') || details.url.startsWith('tel:')) {
      win.close();
      shell.openExternal(details.url);
    }
  });
});

ipcMain.on('save', (event, label, value) => {
  store.set(label, value);
});

ipcMain.handle('load', (event, label) => {
  const result = store.get(label)
  return result
})

ipcMain.handle('fetch', async (event, url) => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(res => resolve(res.text()))
  });
})

ipcMain.on('clear', (event) => {
  store.clear();
});

ipcMain.handle('version', (event, arg) => {
  return {
    version: app.getVersion(),
    platform: process.platform
  };
});

ipcMain.handle('update', (event) => {
  return new Promise((resolve, reject) => {
    autoUpdater.checkForUpdatesAndNotify()
      .then(res => resolve(res))
  });
})

ipcMain.on('update-apply', (event) => {
  autoUpdater.quitAndInstall();
})

autoUpdater.on('checking-for-update', () => {

  sendStatusToWindow({
    message: 'Vérification mise à jour...'
  });
})

autoUpdater.on("update-available", (_event, releaseNotes, releaseName) => {
  sendStatusToWindow({
    message: 'Une nouvelle version est disponible.',
    update: true,
    releaseNotes: releaseNotes,
    releaseName: releaseName
  });
});

autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow({
    message: 'Dernière version déjà installée.',
    update: false,
    info: info
  });
})

autoUpdater.on('error', (err) => {
  sendStatusToWindow({
    message: 'Mise à jour impossible.',
    update: false,
    err: err
  });
})

autoUpdater.on('download-progress', (progressObj) => {
  sendStatusToWindow({
    message: 'Téléchargement en cours',
    downloadSpeed: progressObj.bytesPerSecond,
    percent: progressObj.percent,
    size: progressObj.transferred,
    sizeTotal: progressObj.total
  });
})

autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow({
    message: 'Mise à jour téléchargée',
    downloaded: true,
    version: info.version
  });
});