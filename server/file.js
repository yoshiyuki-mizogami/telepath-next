'use strict'
const fs = require('fs')
const path = require('path')
const FILE_DIR = path.join(__dirname, './files')
fs.mkdir(FILE_DIR, ()=>{})
const mongoose = require('mongoose')
const {Schema} = mongoose

const FileSchema = new Schema({
  name:String,
  icon:String
})
FileSchema.methods.getContent = function(){
  const idString = this._id.toString()
  return new Promise(resolve=>{
    fs.readFile(path.join(FILE_DIR, idString), null, (er, content)=>{
      if(er){
        content = new Buffer('File has been deleted')
      }
      resolve(content.toString('base64'))
    })
  })
}
FileSchema.methods.saveContent = function(base64){
  const filePath = path.join(FILE_DIR, this._id.toString())
  return new Promise(resolve=>{
    fs.writeFile(filePath, base64, 'base64', er=>{
      if(er){
        console.error(er)
      }
      resolve()
    })
  })
}
const File = mongoose.model('File', FileSchema)

module.exports = File
