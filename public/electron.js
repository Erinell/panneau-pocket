const path = require('path');
const { app, shell, BrowserWindow, Notification } = require('electron');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const { ipcMain } = require('electron');
const contextMenu = require('electron-context-menu');
const updater = require('./electron-updater');
const tray = require('./electron-tray');
const AutoLaunch = require('auto-launch');

let store = new Store();
let win;
const gotTheLock = app.requestSingleInstanceLock()

contextMenu({
  showInspectElement: false,
  showSaveImageAs: true,
  showSelectAll: false,
  labels: {
    copyImage: "Copier l'image",
    saveImageAs: 'Enregistrer sous...'
  }
});

function createWindow() {

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

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  win.on('close', async e => {
    e.preventDefault();
    win.hide();
  })

  tray.init(win);
}

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  })

  if (!isDev) {
    var AutoLauncher = new AutoLaunch({
      name: app.getName(),
      path: process.platform === 'win32' ? app.getPath('exe') : app.getAppPath()
    });
  }

  app.whenReady().then(() => {
    createWindow();
    if ((process.argv || []).indexOf('--background') !== -1) win.hide();

    updater.checkUpdate();
    updater.registerEvents(win);

    if (process.platform === 'win32') {
      app.setAppUserModelId(app.name);
    }
    if (isDev) {
      win.webContents.openDevTools({ mode: 'detach' });
    }
  });

  app.on('window-all-closed', (event) => {
    if (process.platform !== 'darwin') {
      // app.quit();
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

  ipcMain.on('notify', (event, title, body) => {
    new Notification({
      icon: path.join(__dirname, '/icons/linux-512x512.png'),
      title: title,
      body: body,
      silent: false
    }).show();
  })

  ipcMain.handle('version', (event, arg) => {
    return updater.getVersion();
  });

  ipcMain.on('update-apply', (event) => {
    updater.exitAndInstall();
  });

  ipcMain.handle('is-run-boot', (event) => {
    if (!AutoLauncher) return;
    return new Promise((resolve, reject) => {
      AutoLauncher.isEnabled().then(isEnable => {
        resolve(isEnable);
      });
    });
  })

  ipcMain.on('run-boot', (event, value) => {
    if (isDev || !AutoLauncher) return;
    if (!value) {
      AutoLauncher.disable();
      return;
    }
    AutoLauncher.isEnabled()
      .then(isEnabled => {
        if (isEnabled) {
          return;
        }
        AutoLauncher.enable();
      });
  });
}