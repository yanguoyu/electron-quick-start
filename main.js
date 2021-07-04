// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, dialog, globalShortcut, ipcMain } = require('electron')
const path = require('path')

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      nodeIntegrationInSubFrames: true,
      contextIsolation: false,
      webSecurity: false,
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.key.toLowerCase() === 'i') {
      console.log('Pressed Control+I')
      event.preventDefault()
    }
  })
}

function addMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: '菜单1',
      submenu: [
        {
          label: '菜单1',
          accelerator: process.platform === 'darwin' ? "Alt+Cmd+I" : "Alt+Shift+I",
          click: (menuItem, browserWindow) => {
            dialog.showMessageBox({
              type: 'info',
              message: menuItem.label,
            });
          }
        },
        {
          label: 'openDevTool',
          accelerator: process.platform === 'darwin' ? "Alt+Cmd+J" : "Alt+Shift+J",
          click: (menuItem, browserWindow) => {
            browserWindow.webContents.openDevTools()
          }
        },
      ]
    }
  ])
  Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  addMenu()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  globalShortcut.register('Alt+CommandOrControl+P', () => {
    console.log('Electron loves global shortcuts!')
  })
  ipcMain.on('event-async', (e, ...args) => {
    console.log(args)
    e.reply('reply-event', args.reduce((pre, cur) => pre + cur, 0))
  })
  ipcMain.on('event-sync', (e, ...args) => {
    console.log(args)
    e.returnValue = args.reduce((pre, cur) => pre + cur, 0);
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})