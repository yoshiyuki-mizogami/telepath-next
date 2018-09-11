'use strict'
const File = require('../file')
module.exports = (server, cl,res, obj)=>{
  return File.findOne({_id:obj.id})
    .select('name content')
    .then(async mFile =>{
      const content = await mFile.getContent()
      const file = mFile.toObject()
      file.content =content
      cl.send({
        method:'gotFile', 
        file,
        download:obj.download
      })
    }).catch(e=>{
      console.error(e)
    })
}