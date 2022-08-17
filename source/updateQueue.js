const {handleDownload} = require("./handleDownload.js")

module.exports = (e, context)=>{
  
    while(context.bench.vacancy()&&context.queue.hasItems()){
      let next = context.queue.next()
      if(next.status!=='CANCELLED'){
        let benchIndex = context.bench.addProcess(next)
        const process = context.bench.atIndex(benchIndex)
        handleDownload(e, process, context)
      }
    }
  
  }
