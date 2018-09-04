'use strict'
const path = require('path')
const {spawn,exec} = require('child_process')
const mongoose = require('mongoose')
const share = require('./param.js')
console.log('db server:', share.mongoServer, 'ws server', share.wsServer)
const TELEPATH_PORT = share.wsPort
mongoose.Promise = global.Promise
// mongoose.set('debug', true)
const Act = require('./message-action')
const etc = require('./etc')
bootNginx()
connectMongo().then(Act.init)
  .then(async ()=>{
    console.log('mongo conected')
    await etc.set()
    require('./boot-ws')(TELEPATH_PORT, Act.doAct)
  })


function connectMongo(){
  const userName = 'telepathUser'
  const password = 'telepathPassword'
  const server = share.mongoServer
  const port = '27017'
  const db = 'telepath'
  const connectionString = `mongodb://${userName}:${password}@${server}:${port}/${db}`
  return mongoose.connect(connectionString,{useNewUrlParser:true})
    .catch(console.error)
}


function bootNginx(){
  const os = require('os')
  if(os.type() === 'Linux'){
    return
  }
  exec('taskkill.exe /f /im nginx.exe', ()=>{
    const nginx = path.join(__dirname, 'nginx', 'nginx.exe')
    spawn(nginx,{
      cwd:path.join(__dirname, 'nginx')
    })
  })
}