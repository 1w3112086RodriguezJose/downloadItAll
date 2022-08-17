const download = require('./download')
const cancel = require('./cancel')
const sanitize = require('./sanitize')
const fs = require('fs')
const { app, BrowserWindow, ipcMain } = require('electron')
const { Bench, Queue, DownloadProcess } = require('./downloadClasses')
const updateQueue = require('./updateQueue')
const {handleDownload} = require('./handleDownload')

const rootPath = __dirname.substring(0, (__dirname.lastIndexOf('source')))
const ydlBinPath = rootPath + '/node_modules/youtube-dl-exec/bin/yt-dlp.exe'
const saveState = fs.existsSync(rootPath + 'downloading.dl')
  ? fs.readFileSync(rootPath + 'downloading.dl') : ''
const queue = new Queue()
//cantidad maxima de procesos paralelos usese con precaucion
const bench = new Bench(2) 
//objeto para manejar las variables globales entre funciones
const context = {
  rootPath,
  ydlBinPath,
  queue,
  bench,
  updateQueue(e) {
    while (this.bench.vacancy() && this.queue.hasItems()) {
      let next = this.queue.next()
      let benchIndex = this.bench.addProcess(next)
      const process = this.bench.atIndex(benchIndex)
      if(benchIndex!=-1) handleDownload(process, this)
    }
  }
}


const debug = global.$jsDebugIsRegistered
console.log("debugging: ", debug)

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  context.window = mainWindow

  //inicia la descarga
  ipcMain.on('download', (e, url, folder = rootPath) => {
    download(e, sanitize(url), context, folder)
  })

  //maneja la señal cancelar descarga
  ipcMain.on('cancel', (e, proc) => {
      console.log('cancelando: ', proc)
      cancel(proc, context)
    
  })
  
  ipcMain.on('remove', (e, proc) => {
    if(!context.bench.removeProcessAt(proc.benchIndex)){
      console.log('no se pudo remover el proceso')
    }
    console.log('procesos en bench: ', context.bench.processCount)
  })

  //mareja el pedido de reanudacion de descarga
  ipcMain.on('restart', (e, proc) => {
    console.log('señal restart con proc: ', proc);
    if(context.bench.alreadyHasProcess(proc)){
      let benchProcess = context.bench.atIndex(proc.benchIndex)
      console.log('reiniciando ',proc)
      benchProcess.changeStatus('RESTARTING')
      handleDownload(benchProcess, context)
    }
    else{
      console.log('reload: download process not in bench : ', proc);
      download(e, sanitize(proc.url), context, context.rootPath)
    } 
  })

  //mareja el pedido de recuperacion de descarga por cierre
  ipcMain.on('recover', (e, signal) => {
    if (signal) context.updateQueue(e)
  })


  mainWindow.loadFile(debug ? './source/index.html' : 'index.html')

  //si hay algo en el archivo de recuperacion reanuda las descargas
  if (saveState != '') {
    const recover = JSON.parse(saveState)
    recover.forEach((proc) => {
      if (proc != '' || proc.status != "COMPLETED") {
        queue.add(proc)
        mainWindow.webContents.send('added',proc)
      }
    })
    if (queue.hasItems()) mainWindow.webContents.send('recover', true)
  }

  mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })


})


app.on('window-all-closed', function () {

  if (process.platform !== 'darwin') app.quit()
  //crea un archivo de recuperacion

  // let recover = []

  // while (bench.processCount > 0) {
  //   recover.push(bench.removeProcessAt(0))
  // }
  // while (queue.hasItems()) {
  //   recover.push(queue.next())
  // }

  // fs.writeFileSync(rootPath + 'downloading.dl',
  //   JSON.stringify(recover)
  // )

})

