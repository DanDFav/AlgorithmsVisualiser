const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const url = require('url')

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
})

app.whenReady().then(() => { 
    createMainWindow()
    mainWindow.on('closed', ()=> {
        mainWindow = null
    })
  
    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0){
            createMainWindow(); 
            
        }
    })
})


function createMainWindow(){
  console.log(__dirname)
  mainWindow = new BrowserWindow({
      title: "x", 
      resizable: true, 
      webPreferences: {
          contextIsolation: true, 
          nodeIntegration: true, 
          preload: path.join(__dirname, '../dist/preload.js')
      }
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
}

ipcMain.on('startingMessage', (_, data) => {
    let sequence = data.sequence + 1 
    console.log(sequence + ": " + data.message)
    let response = "Okay man"
    mainWindow.webContents.send('responseToStart', {
        response, 
        sequence
    });
})

ipcMain.on('actionSwap', (_, data) => {
    let action = data.type; 
    let values = data.values; 
    console.log(action + ": " + values)
})

ipcMain.on('actionPartition', (_, data) => {
    let action = data.type; 
    let values = data.values; 
    let product = data.product; 
    console.log(action + ": " + values)
})

ipcMain.on('actionStart', (_, data) => {
    let action = data.type; 
    console.log(action)
})

ipcMain.on('StateOfArray', (_, data)=>{
    let values = data.array
    console.log("product: " + values)
    console.log("----------")
})

ipcMain.on('output', (_, data)=>{
    let action = data.action
    console.log(action)
})



