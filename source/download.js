const {DownloadProcess} = require ('./downloadClasses')
const {handleDownload} = require('./handleDownload')

module.exports = function ( e, url, context, folder = false) {
  const newProcess = new DownloadProcess(url)
  if(folder) newProcess.setDownloadFolder(folder)
  if (!context.queue.alreadyHasProcess(newProcess) && !context.bench.alreadyHasProcess(newProcess)) {
    e.reply('added', newProcess)
    context.queue.add(newProcess)    

    context.updateQueue(e)
  }
  if(context.bench.alreadyHasProcess(newProcess)){
    if(newProcess.status==='FAILED' || newProcess.status==='CANCELLED' || newProcess.status==='CANCELLED'){
      handleDownload(newProcess, context)
    }
  }
}
  
