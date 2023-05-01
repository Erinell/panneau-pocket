const { autoUpdater } = require('electron-updater');
const { app } = require('electron');
// const log = require('electron-log');

function sendStatusToWindow(win, payload) {
  // log.info(payload);
  win.webContents.send('update-rcv', payload);
}

module.exports = {
  checkUpdate: () => {
    return new Promise((resolve, reject) => {
      autoUpdater.checkForUpdates()
        .then(res => resolve(res))
    });
  },
  getVersion: () => {
    return {
      version: app.getVersion(),
      platform: process.platform
    };
  },
  exitAndInstall: () => {
    autoUpdater.quitAndInstall();
  },
  registerEvents: (win) => {
    autoUpdater.on('checking-for-update', () => {

      sendStatusToWindow(win, {
        message: 'Vérification mise à jour...'
      });
    });

    autoUpdater.on("update-available", (_event, releaseNotes, releaseName) => {
      sendStatusToWindow(win, {
        message: 'Une nouvelle version est disponible.',
        update: true,
        releaseNotes: releaseNotes,
        releaseName: releaseName
      });
    });

    autoUpdater.on('update-not-available', (info) => {
      sendStatusToWindow(win, {
        message: 'Dernière version déjà installée.',
        update: false,
        info: info
      });
    });

    autoUpdater.on('error', (err) => {
      sendStatusToWindow(win, {
        message: 'Mise à jour impossible.',
        update: false,
        err: err
      });
    });

    autoUpdater.on('download-progress', (progressObj) => {
      sendStatusToWindow(win, {
        message: 'Téléchargement en cours',
        downloadSpeed: progressObj.bytesPerSecond,
        percent: progressObj.percent,
        size: progressObj.transferred,
        sizeTotal: progressObj.total
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      sendStatusToWindow(win, {
        message: 'Mise à jour téléchargée',
        downloaded: true,
        version: info.version
      });
    });

  }
}