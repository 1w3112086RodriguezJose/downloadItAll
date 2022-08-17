const {create} = require('youtube-dl-exec')
module.exports = async (ydlpath, url)=>{

    const urlErrorMessage = `ERROR: [generic] '${url}' is not a valid URL`
    const ydl = create(ydlpath)
    const downloadFileName = await ydl(url ,
        {
            format:  "mp4",
            getFilename: true, 
            output: "%(title)s.%(ext)s"
        })
        .then(out => {return out})
        .catch(err=>{
            if (err.stack.indexOf(urlErrorMessage)!=-1) 
                return 'urlerror'
            else
                return "%(title)s.%(ext)s"
        })
    
    return(downloadFileName)        
}
