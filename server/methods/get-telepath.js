const fs = require('fs')
const path = require('path')
const appPath = path.resolve(__dirname, '..','resources', 'app.asar')
const CONTENT_TIMEOUT = 1000 * 60 * 5
const GOTTELEPATH = 'gotTelepath'
let content = null
module.exports = function getTelepath(server, cl){
  if(content){
    return cl.send({
      method:GOTTELEPATH,
      data:content
    })
  }
  fs.readFile(appPath, 'base64', (er,app)=>{
    setTimeout(contentReset, CONTENT_TIMEOUT)
    content = app
    cl.send({
      method:GOTTELEPATH,
      data:content
    })
  })
}
function contentReset(){
  content = null
}