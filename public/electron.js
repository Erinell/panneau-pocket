const path = require('path');

const { app,shell, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const {ipcMain} = require('electron')
const contextMenu = require('electron-context-menu');

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

}

app.whenReady().then(createWindow);

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