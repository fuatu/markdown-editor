const { app, BrowserWindow, Menu, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const menu = require('./menu');
const log = require('electron-log');

let window;

app.on('ready', () => {
    window = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true
      }
    });
    window.loadFile('index.html');
    // autoUpdater.checkForUpdatesAndNotify();
    log.info("Checking update... on app ready");
    autoUpdater.autoDownload=false;
    autoUpdater.checkForUpdates();
});

Menu.setApplicationMenu(menu);

autoUpdater.on('update-available', (event) => {
  var update_url = "https://github.com/fuatu/markdown-editor/releases/download/v" + event.version + "/" + event.path;
  const dialogOpts = {
    type: 'info',
    buttons: ['Update', 'Later'],
    title: 'Application Update',
    message: event.releaseName,
    detail: 'New version available\n' + event.path
  }

  
  log.info("Trying an update inside. update-available");
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      log.info("opening browser for downloading!");
      shell.openExternal(update_url);
    }
  })
});

autoUpdater.on('error', message => {
  log.error('There was a problem updating the application index.js')
  //log.error(message)
});
