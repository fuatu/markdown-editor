const { 
  Menu, 
  shell, 
  app, 
  ipcMain, 
  BrowserWindow,
  globalShortcut,
  dialog, 
} = require('electron');
const { autoUpdater } = require('electron-updater');
const fs = require('fs');
const log = require('electron-log');

app.on('ready', () => {
  globalShortcut.register('CommandOrControl+S', () => {
    saveFile();
  });
  globalShortcut.register('CommandOrControl+O', () => {
    loadFile();
  });
});

function saveFile(){
  console.log('Saving the file.');
    const window = BrowserWindow.getFocusedWindow();
    window.webContents.send('editor-event', 'save');
};

function loadFile(){
  console.log('Opening an md file');
  const window = BrowserWindow.getFocusedWindow();
  const options = {
    title: 'Pick a markdown file',
    filters: [
      { name: 'Markdown files', extensions: ['md'] },
      { name: 'Text files', extensions: ['txt'] }
    ]
  };

  dialog.showOpenDialog(window, options).then( result => {
    if (result.filePaths.length > 0) {
      console.log(result.filePaths[0]);
      const content = fs.readFileSync(result.filePaths[0]).toString();
      window.webContents.send('load', content);
    };
  });
};

ipcMain.on('save', (event, arg) => {
  console.log(`Saving content of the file. Menu.js`);
  console.log(arg);

  const window = BrowserWindow.getFocusedWindow();
  const options = {
    title: 'Save markdown file',
    filters: [
      {
        name: 'MyFile.md',
        extensions: ['md']
      }
    ]
  };

  dialog.showSaveDialog(window, options).then(result => {
    var filename = result.filePath;
    if (filename) {
      console.log(`Saving content to the file: ${filename}`);
      fs.writeFileSync(filename, arg);
    }
  });
});

ipcMain.on('editor-reply', (event, arg) => {
  console.log(`Received reply from web page: ${arg}`);
});


const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        accelerator: 'CommandOrControl+O',
        click() {
          loadFile();
        }
      },
      {
        label: 'Save',
        accelerator: 'CommandOrControl+S',
        click() {
          saveFile();
        }
      },
      {
        label: 'Check Updates',
        click() {
          log.info("Checking for update by user trigger from menu")
          autoUpdater.autoDownload=false;
          autoUpdater.checkForUpdates();
        }
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'About Editor Component',
        click() {
            shell.openExternal('https://simplemde.com/');
        }
      }
    ]
  },
  {
    label: 'Format',
    submenu: [
      {
        label: 'Toggle Bold',
        click() {
          const window = BrowserWindow.getFocusedWindow();
          window.webContents.send('editor-event', 'toggle-bold');
        }
      },
      {
        label: 'Toggle Italic',
        click() {
          const window = BrowserWindow.getFocusedWindow();
          window.webContents.send('editor-event', 'toggle-italic');
        }
      }
    ]
  },
];

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  })
}

if (process.env.DEBUG) {
  template.push({
    label: 'Debugging',
    submenu: [
      {
        label: 'Dev Tools',
        role: 'toggleDevTools'
      },

      { type: 'separator' },
      {
        role: 'reload',
        accelerator: 'Alt+R'
      }
    ]
  });
}
const menu = Menu.buildFromTemplate(template);

module.exports = menu;

