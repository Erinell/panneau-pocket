const path = require('path');

const { app,shell, BrowserWindow, dialog } = require('electron');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const {ipcMain} = require('electron')
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

let store = new Store();
function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    title: "Panneau Pocket",
    width: 700,
    height: 700,
    minWidth:700,
    minHeight:600,
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
  }

  win.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

app.whenReady().then(() => {
  autoUpdater.checkForUpdates();
  createWindow();
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

  webContents.on('did-create-window', function (win, details){
    // details.url
    win.setMenuBarVisibility(false);
 
    if(details.url.startsWith('mailto:') || details.url.startsWith('tel:')){
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

autoUpdater.on("update-available", (_event, releaseNotes, releaseName) => {
  const dialogOpts = {
     type: 'info',
     buttons: ['Ok'],
     title: 'Update Available',
     message: process.platform === 'win32' ? releaseNotes : releaseName,
     detail: 'A new version download started. The app will be restarted to install the update.'
  };
  dialog.showMessageBox(dialogOpts);

});

autoUpdater.on("update-not-available", (_event, releaseNotes, releaseName) => {
  const dialogOpts = {
     type: 'info',
     buttons: ['Ok'],
     title: 'Aucune mise à jour disponible',
     message: process.platform === 'win32' ? releaseNotes : releaseName,
     detail: 'A new version download started. The app will be restarted to install the update.'
  };
  dialog.showMessageBox(dialogOpts);

});

autoUpdater.on("update-downloaded", (_event, releaseNotes, releaseName) => {
  const dialogOpts = {
     type: "info",
     buttons: ["Restart", "Later"],
     title: "Application Update",
     message: process.platform === "win32" ? releaseNotes : releaseName,
     detail: "A new version has been downloaded. Restart the application to apply the updates."
  };
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
     if (returnValue.response === 0) autoUpdater.quitAndInstall()
  });
});