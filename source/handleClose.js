
module.exports = (e, proc, context) => {
   
    if (proc.status === 'URLERROR' && context.bench.alreadyHasProcess(proc)){
        e.send('error', proc).
        context.bench.removeProcessAt(proc.benchIndex)
    } 
        
    else if (proc.status === 'CANCELLED' && context.bench.alreadyHasProcess(proc)) {
        e.send('cancelled', proc)
        context.bench.removeProcessAt(proc.benchIndex)
    }
    
    else if (proc.status === 'COMPLETED'&& context.bench.alreadyHasProcess(proc)) {
        e.send('completed', proc)
        context.bench.removeProcessAt(proc.benchIndex)
    }
    
    else if (proc.status === 'FAILED'&& context.bench.alreadyHasProcess(proc)){
        e.send('failed', proc)
       
    }
    else if (!context.bench.alreadyHasProcess(proc)){
        e.send('cancelled', proc)       
    }    
    
    context.updateQueue(e)
}