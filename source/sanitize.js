module.exports = (url)=>{
    const reg= /\\+|'+|"+| +/g
    return url.replace(reg, '')
}