const generateFormat = require('./generateFormat')
class Queue {
    #elems = []
    add = (item) => {
        if (item instanceof DownloadProcess && !this.alreadyHasProcess(item)) {
            this.#elems.push(item)
            return true
        }
        if (item.url != undefined) {
            const newProcess = new DownloadProcess(item.url)
            for (let key of Object.keys(item)) {
                newProcess[key] = item[key]
            }
            if (!this.alreadyHasProcess(newProcess)) {
                this.#elems.push(newProcess)
                return true
            }
        }
        return false
    }
    clear = () => {
        this.#elems = []
    }
    next = () => {
        if (this.hasItems()) {
            return this.#elems.shift()
        }
        return -1
    }
    atIndex = (index) => {
        if (typeof index != 'number') {
            throw new Error('se esperaba un valor numerico se recibio ' + typeof index)
        }
        return this.#elems[Math.floor(index)]
    }
    indexOf = (process) => {
        let result = -1
        const newProcessKeys = Object.keys(process)
        for (let i = 0; i < this.#elems.length; i++) {
            const workingProcessKeys = Object.keys(this.#elems[i]);
            if (newProcessKeys.length !== workingProcessKeys.length) {
                continue
            }
            let counter = 0
            for (let key of newProcessKeys) {
                if (newProcessKeys[key] !== workingProcessKeys[key]) {
                    break
                }
                counter++
            }
            if (counter == workingProcessKeys.length) result = i
        }

        return result;
    }
    count = () => {
        return this.#elems.length
    }
    hasItems = () => {
        return this.#elems.length > 0
    }
    alreadyHasProcess(process) {
        let result = false
        this.#elems.forEach(e => {
            if (process.url === e.url) result = true
        })
        return result
    }
}
class DownloadProcess {
    constructor(url) {
        this.url = url
        this.status = 'NEWBORN'
        this.downloadFolder = './downloads'
        this.downloadFileName = null
        this.processPid = ''
        this.progress = 0
        this.format = generateFormat(url)
        this.benchIndex = null
        this.size = ''
        this.speed = ''
        this.eta = ''
    }
    changeStatus(status) {
        this.status = status
    }
    setDownloadFolder(path) {
        this.downloadFolder = path
    }
    changeDownloadFileName(fileName) {
        if (typeof fileName === 'string' && fileName.trim().length != 0) {
            this.downloadFileName = fileName
        }
    }
    setProcessPid(pid) {
        this.processPid = pid
    }
    updateProgress(progress) {
        if (typeof progress === 'number') {
            if (progress > 100) this.progress = 100
            if (progress < 0) this.progress = 0
            else this.progress = progress
        }

    }
    setFormat(format) {
        if (typeof format === 'string' && format.trim().length != 0) {
            this.format = format
        }
    }


}
class Bench {
    #processes = []
    constructor(maxProcesses) {
        this.maxProcesses = maxProcesses
        this.processCount = 0
    }
    updateMaxProcesses(newValue) {
        if (typeof newValue === "number" && newValue > 0) this.maxProcesses = Math.floor(newValue)
        else throw new Error('valor de maxProcess invalido debe ser entero mayor a 0')
    }
    addProcess(process) {
        if (this.processCount < this.maxProcesses) {
            if (process instanceof DownloadProcess && !this.alreadyHasProcess(process)) {

                this.#processes.push(process)
                this.processCount++
                process.benchIndex = this.#processes.indexOf(process)
                return process.benchIndex
            }
            if (process.url != undefined) {

                const newProcess = new DownloadProcess(process.url)
                for (let key in Object.keys(process)) {
                    newProcess[key] = process[key]
                }
                if (!this.alreadyHasProcess(newProcess)) {
                    this.#processes.push(newProcess)
                    this.processCount++
                    process.benchIndex = this.#processes.indexOf(process)
                    return process.benchIndex
                }
            }
        }
        return -1
    }
    removeProcessAt(index) {
        if (typeof index === 'number' && this.processCount > 0) {
            this.processCount--
            const removedProcess = this.#processes.splice(index, 1)[0]
            this.#processes.forEach((p, i) => {
                p.benchIndex = i
            })
            return removedProcess
        }
        return null
    }
    atIndex(index) {
        return this.#processes[index]
    }
    indexOf(process) {
        let result = -1
        this.#processes.forEach((p,i)=>{
            if(p.url === process.url){
                result=i
            }
        })
        return result;

    }
    vacancy() {
        return this.maxProcesses > this.processCount
    }
    alreadyHasProcess(process) {
        let result = false
        if(process === undefined) return result
        this.#processes.forEach((p)=>{
            if( p.url === process.url){
                result=true
            }
        })
        return result
    }
}
module.exports = { Queue, Bench, DownloadProcess }