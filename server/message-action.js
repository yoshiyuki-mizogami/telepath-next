'use strict'
const fs = require('fs')
const path = require('path')
const UPDATE_EVENT_FILE = path.join( __dirname, 'update-event-file')
let actions = null
const setActions = ()=>{
  const actDir = path.join(__dirname, 'actions')
  const manageActDir = path.join(__dirname, 'manage-actions')
  const files = fs.readdirSync(actDir).map(f=>path.join(actDir, f))
  files.push(...fs.readdirSync(manageActDir).map(f=>path.join(manageActDir, f)))
  const acts = {}
  files.forEach(f=>{
    const methodName = path.basename(f, '.js').replace(/-(.)/g, (_,c)=>c.toUpperCase())
    acts[methodName] = require(f)
  })
  actions = acts
  const etc = require('./etc')
  etc.set()
}
setActions()
watchEventFile( UPDATE_EVENT_FILE )

const Action = {
  init(){
    return Promise.resolve()
  },
  doAct(wss, sock, obj){
    const {method} = obj
    const action = actions[method]
    if(!action){
      return console.error('unknown action ', method)
    }
    action(wss,sock, obj)
  }
}

module.exports = Action

function watchEventFile(file){
  fs.watch( file ,()=>{
    console.log('Detect event file update reload actions..')
    /*clear require cache*/
    require('mongoose').models = {}
    for( const c in require.cache){
      if(c.includes(__dirname)){
        delete require.cache[c]
      }
    }
    setActions()
    console.log('Done all actions reloaded.')
  })
}