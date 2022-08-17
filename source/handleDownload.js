const getDownloadFileName = require("./getDownloadFileName")
const handleClose = require("./handleClose")
const handleProgres = require("./handleProgres")
const { exec } = require("child_process")

module.exports = {handleDownload}

async function handleDownload ( proc, context) {

    const e = context.window.webContents
    

    if (proc.downloadFileName === null || proc.downloadFileName === 'urlerror') {
    
        proc.downloadFileName = await getDownloadFileName(context.ydlBinPath, proc.url)
    }
    if (proc.downloadFileName === 'urlerror') {
    
        proc.changeStatus('URLERROR')
        handleClose(e, proc, context)
    }
    else if(proc.status ==='CANCELLED'){
        handleClose(e, proc, context)
    }
    else {

        const comand = `${context.ydlBinPath} -o "${proc.downloadFolder}${proc.downloadFileName}" "${proc.url}" -f "${proc.format}" --ignore-errors --retries infinite --fragment-retries infinite --no-warnings`
        console.log(comand)

        const downloader = exec(comand)
        proc.setProcessPid(downloader.pid)

        //envia informacion de progreso a la vista
        downloader.stdout.on('data', data => {
            console.log(data)
            proc.setProcessPid(downloader.pid)
            handleProgres(e, data, proc )
        })

        //envia estado de cierre a la vista
        downloader.stdout.on('close', data => {
            console.log(data)
            if(proc.status === 'PENDING' || proc.status === 'DOWNLOADING'){
                proc.changeStatus('FAILED')
            }
            handleClose( e, proc, context)
        })
        
        downloader.stdout.on('end', data => {
            e.send('end', { ...proc, data })
        })

        downloader.stderr.on('data', data => {
            e.send('data', { ...proc, data })
        })

    }
}
