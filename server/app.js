'use strict'
const mg = require('mongoose')
const {Schema} = mg
const {Types} = Schema
const path = require('path')
const fs = require('fs')
const {promisify} = require('util')
const appRoot = path.resolve(__dirname, 'root', 'apps')
const mkdirp = promisify(fs.mkdir)
const writeFilep = promisify(fs.writeFile)
const readFilep = promisify(fs.readFile)
const readdirp = promisify(fs.readdir)
const rmdirp = promisify(fs.rmdir)
const statp = promisify(fs.stat)
const unlinkp = promisify(fs.unlink)
const APP_ASAR = 'app.asar'
const ICON = 'icon.png'
const semver = require('semver')
const AppSchema = new Schema({
  name:{
    type:String,
    unique:true
  },
  main:String,
  multi:{
    type:Boolean,
    default:false
  },
  icon:String,
  scripts:Object,
  window:Object,
  version:String,
  caption:String,
  description:String,
  download:{
    type:Number,
    default:0
  },
  unpack:{
    type:Boolean,
    default:false
  },
  created:{
    type:Date,
    default:Date.now
  },
  collaborators:[Types.ObjectId],
  updated:{
    type:Date,
    default:Date.now
  },
  author:{
    type:Schema.Types.ObjectId,
    ref:'User'
  }
})

AppSchema.statics.deleteApp = function(id){
  return this.removeOne({_id:id})
}
const nameReg = /^[a-zA-Z][a-zA-Z\d-]*$/
AppSchema.statics.registApp = async function(appObj, _bin){
  let app
  let {name} = appObj
  if(!nameReg.test(name)){
    return Promise.reject({
      ja:'使えない名前規則です:(先頭アルファベット、続いてハイフン、数字が使えます)',
      en:'Invalid name:In the name property, the first letter can only be alphabet, followed letters can be hyphens and digits'
    })
  }
  const icon = _bin.icon
  const bin = _bin.bin
  const already = await this.findOne({name:appObj.name})
  if(!already){
    app = new App(appObj)
  }else{
    const developpers = [already.author.toString()]
    const collaborators = already.collaborators.map(c=>c.toString())
    developpers.push(...collaborators)
    if(!developpers.includes(appObj.author)){
      return Promise.reject({
        ja:`${appObj.name}はすでに使われてるID(name)です`,
        en:`Already used app name ${appObj.name}.`,
      })
    }
    /*no  overwrite original author*/
    appObj.author = already.author || appObj.author
    const alreadyVersion = already.version
    const newVersion = appObj.version
    if(semver.lt(newVersion ,alreadyVersion)){
      return Promise.reject({
        ja:'versionは同じか増やす必要があります',
        en:'version field must be increasing or the same',
      })
    }
    Object.assign(already, appObj)
    app = already
    app.updated = new Date()
  }
  name = app.name
  const saveDir = path.join(appRoot, name)
  const savePath = path.join(saveDir, APP_ASAR)
  const iconPath = path.join(saveDir,ICON)
  await mkdirp(saveDir).catch(()=>{/*ignore*/})
  await writeFilep(savePath, new Buffer(bin, 'base64'))
  await writeFilep(iconPath, new Buffer(icon, 'base64'))
  App.updateGlobalIconCache()
  return await app.save()
}
AppSchema.methods.fetchBin = async function fetchBin(){
  const {name} = this
  const saveDir = path.join(appRoot, name)
  const savePath = path.join(saveDir, APP_ASAR)
  return await readFilep(savePath, 'base64')
}
AppSchema.methods.unregist = async function fetchBin(){
  const {name} = this
  const saveDir = path.join(appRoot, name)
  recursiveErace(saveDir)
  return this.remove()
}
AppSchema.statics.updateGlobalIconCache = function(){
  global.iconCacheQuery = Date.now()
}
AppSchema.virtual('iconCache').get(function(){
  return global.iconCacheQuery
})
const App = mg.model('App',AppSchema)
module.exports = App

async function recursiveErace(dir){
  const items = await readdirp(dir)
  await items.reduce((before, item)=>{
    const itempath = path.join(dir, item)
    return before.then(async ()=>{
      const stat = await statp(itempath)
      if(stat.isDirectory()){
        return await recursiveErace(itempath)
      }
      return unlinkp(itempath)
    })
  }, Promise.resolve())
  return rmdirp(dir)
}