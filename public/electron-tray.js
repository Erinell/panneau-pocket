const { Tray, Menu, app } = require('electron')
const updater = require('./electron-updater')
const path = require('path');

const trayMenuSettings = [
  {
    label: 'Vérifier les mises à jour',
    click: function () {
      updater.checkUpdate();
    }
  },
  {
    label: 'Quitter',
    click: function () {
      app.exit();
    }
  }
]

module.exports = {
  init: () => {
    let trayIcon = new Tray(path.join(__dirname, '/icons/linux-512x512.png'));
    let trayMenu = Menu.buildFromTemplate(trayMenuSettings)
    trayIcon.setContextMenu(trayMenu)
  }
}

