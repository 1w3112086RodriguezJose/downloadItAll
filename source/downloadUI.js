
const processes = {}
//actualiza los items de descarga segun el estado
function updateQueueItem(data) {
    const downloadItem = document.getElementById(`url-${data.url}`).children
    switch (data.status) {
        case 'PENDING':
            downloadItem[1].value = 'comenzando..'
            break

        case 'DOWNLOADING':
            downloadItem[0].value = data.progress
            downloadItem[1].textContent = data.progress + '%'
            downloadItem[2].textContent = data.size
            downloadItem[3].textContent = data.speed
            downloadItem[4].textContent = data.eta
            break

        case 'RESTARTING':
            
            downloadItem[1].textContent = 'reiniciando'
            downloadItem[2].textContent = ''
            downloadItem[3].textContent = ''
            downloadItem[4].textContent = ''
            downloadItem[5].textContent = 'cancel'
            downloadItem[5].setAttribute('onclick', `cancel('${data.url}')`)
            break
        
        case 'COMPLETED':
            downloadItem[1].textContent = 'completo'
            downloadItem[2].textContent = ''
            downloadItem[3].textContent = ''
            downloadItem[4].textContent = ''
            break
    }
}
//recarga la descarga
function reload(url) {
    const reloadButton = document.getElementById(`url-${url}`).children[6]
    if(reloadButton){
        reloadButton.remove()
    }
    const proc = processes[url]
    if(proc){
        console.log('reloading : ', proc);
        proc.status = 'RESTARTING'
        updateQueueItem(proc)
        ipc.send('restart', proc)
    }
    else{
        console.log('error en reload, descargando: ', url, proc)
        ipc.send('download', url)
    } 
}
//cambia el boton cancelar por una x para quitar el item
function changeButton(proc, recover = true) {
    const uiItem = document.getElementById(`url-${proc.url}`)
    const closeButton = uiItem.children[5]
    
    closeButton.textContent = 'X'
    closeButton.setAttribute('onclick', `removeItem('${proc.url}')`)
    
    if(recover === 'kill'){
        closeButton.setAttribute('onclick', `kill('${proc.url}')`)
    }
    if(recover===true){
        const reloadButton = document.createElement("button")
        reloadButton.setAttribute('onclick', `reload('${proc.url}')`)
        reloadButton.textContent='R'
        uiItem.appendChild(reloadButton)
    }
}
//quita el item
function removeItem(url) {
    const uiItem = document.getElementById(`url-${url}`)
    uiItem.remove()
}
//señal a main para cancelar el proceso de descarga
function cancel(url) {
    console.log('enviando señal de cancelacion con url: ', url);
    ipc.send('cancel', processes[url])
}
function kill(url){
    console.log('enviando señal remove para la url: ', url)
    ipc.send('remove', processes[url])
    removeItem(url)
}