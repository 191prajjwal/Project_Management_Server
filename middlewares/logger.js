const fs= require('fs')

function incommingReqLogger(req,res,next){

    fs.appendFileSync("log.txt",`Time : ${new Date().toISOString()} , Method : ${req.method} , URL :${req.url}\n`)
    next()
}
module.exports=incommingReqLogger
