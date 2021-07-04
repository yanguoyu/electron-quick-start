// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const { remote, ipcRenderer } = require('electron');
const path = require('path')

let viewLength = 0;

function addBrowserView(e) {
  const win = remote.getCurrentWindow();
  var view = new remote.BrowserView()
  win.addBrowserView(view)
  view.setBounds({ x: 110*viewLength, y: 200, width: 100, height: 100 })
  view.webContents.loadURL('https://www.electronjs.org')
  viewLength++;
}

function addBrowserWindow(e) {
  const mainWindow = new remote.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      nodeIntegrationInSubFrames: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    }
  })
  mainWindow.loadFile('index.html')
}

const browserWindow = document.getElementById('BrowserWindow');
browserWindow.onclick = addBrowserWindow;

const browserView = document.getElementById('BrowserView');
browserView.onclick = addBrowserView;

const sendEvent = document.getElementById('sendEvent');
sendEvent.onclick = function(params) {
  const res = ipcRenderer.send('event-async', 1, 2, 3)
  console.log(res);
};

const sendSyncEvent = document.getElementById('sendSyncEvent');
sendSyncEvent.onclick = function(params) {
  const res = ipcRenderer.sendSync('event-sync', 1, 2, 3)
  console.log(res);
};

ipcRenderer.on('reply-event', (e, data) => {
  alert(data)
})