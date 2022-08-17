const { exec } = require('child_process')
const handleClose = require('./handleClose')
const kill = require('./kill')

module.exports = (proc, context) => {

  if (context.bench.alreadyHasProcess(proc)) {
    let process = context.bench.atIndex(context.bench.indexOf(proc))
    process.changeStatus('CANCELLED')
    let pid = process.processPid
    if (pid != undefined) {
      exec(`C:/Windows/System32/tasKlist /FI "PID eq ${pid}" /FO "LIST"`, (error, stdout, stderr) => {
        const output = stdout.trim().split(/ |\n|\r/).filter(n => n.trim())
        console.log(stdout, stderr, error, output)
           if (!error && output[3] == "cmd.exe") {
          console.log("cerrando proceso con pid " + pid)
          kill(pid)
        }
        else{
          handleClose(context.window.webContents, proc, context)         
        }
      })
    }
    else {
      handleClose(context.window.webContents, proc, context)
    }
  }
  else if (context.queue.alreadyHasProcess(proc)) {
    process.changeStatus('CANCELLED')
    handleClose(context.window.webContents, proc, context)
  }
}