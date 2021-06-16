// Modules to control application life and create native browser window
const {app, BrowserWindow } = require('electron')
const cluster = require('cluster');
const path = require('path')
const numCPUs = require('os').cpus().length;

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
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
if (cluster.isMaster) {
  app.whenReady().then(() => {
    createWindow()
    
    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
  
  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })
  
  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.
  console.log('master pid is', process.pid);
  console.log(process['execPath']);
  console.log(process['helperExecPath']);
  // 衍生工作进程。
  for (let i = 0; i < numCPUs - 1; i++) {
    const worker = cluster.fork(process.env);
    console.log("pid:", worker.process.pid, ". work id:",worker.id)
    worker.send({
      i,
    })
  }
} else {
  const worker = cluster.worker;
  console.log(`工作进程 ${process.pid} 已启动, worker id is : ${worker.id}`);
  console.log(app);
  worker.once('message', (message) => {
    console.log(message);
  })
}