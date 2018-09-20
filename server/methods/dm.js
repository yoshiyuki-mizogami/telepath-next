'use strict'
const {readFileSync} = require('fs')
const {join} = require('path')
const indexHtml = join(__dirname, 'index.html')
const indexPage = readFileSync(indexHtml, 'utf8')
const File = require('../file')
module.exports = (server, cl,res, obj)=>{
  res._end(indexPage)
}