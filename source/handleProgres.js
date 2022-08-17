module.exports = (e, data, proc) => {

    const output = data.trim().split(' ').filter(n => n)

    if (output[0] === '[download]' && output[1].indexOf("100") != -1 || proc.status === 'COMPLETED'){
        proc.status='COMPLETED'
    } 
    else if (output[0] === '[download]'){
        proc.changeStatus('DOWNLOADING')
        proc.updateProgress(parseInt(output[1].slice(0, -1)))
        proc.size = output[3]
        proc.speed = output[5]
        proc.eta = output[7]
    }
    else {
        proc.changeStatus('PENDING')   
    }

    e.send('data', {...proc, data})

}
