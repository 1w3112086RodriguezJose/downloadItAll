//mata funcion por pid
const {exec} = require('child_process')
module.exports = (pid) => {
    
      exec(`C:/Windows/System32/taskkill /PID ${pid} /T /F`, (error) => {
        if (error) {
          console.error("no se pudo cancelar la descarga", error)
        }
      })
  
  }