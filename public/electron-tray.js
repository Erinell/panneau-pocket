const { Tray, Menu, app } = require('electron')
const updater = require('./electron-updater')
const path = require('path');

module.exports = {
  init: (win) => {
    let trayIcon = new Tray(path.join(__dirname, '/icons/linux-512x512.png'));
    trayIcon.on('click', () => {
      win.show();
    })

    let trayMenu = Menu.buildFromTemplate(
      [
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
      ])

    trayIcon.setContextMenu(trayMenu)
  }
}

