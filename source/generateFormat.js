module.exports = (url)=>{
    if(url.indexOf("crunchyroll")!=-1) 
        return '[format_id *= adaptive_hls-audio-jaJP-hardsub-esLA][height=480]'
    if(url.indexOf("youtube") != -1 || url.indexOf("youtu.be") != -1)
        return 'mp4[height<=?1080]+bestaudio/best'
    else return 'bestvideo[height<=?1080]+bestaudio/best'
}