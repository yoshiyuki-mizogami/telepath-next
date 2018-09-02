'use strict'
require('./util/unprotect.js')
const path = require('path')
const el = require('electron')
const setSendMessage = require('./util/set-send-message.js')
const {app, ipcMain} = el
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true//for electron2.x.x

app.commandLine.appendSwitch('disable-http-cache')
app.commandLine.appendSwitch('no-proxy-server')
app.commandLine.appendSwitch('ignore-certificate-errors')
let mw
let APP_HEIGHT = 725
const APP_HEIGHT_CHANGE_BORDER = 1000
const APP_SHRINK_HEIGHT =100
const APP_WIDTH = 620
const noop = function(){}
/*Throw command for start Qwave service and drop handle for smooth start shallwin*/
startQwave()
waitCodeInject()
const isPrimaryInstance = app.requestSingleInstanceLock()
if(!isPrimaryInstance){
  app.quit()
}
app.on('second-instance',argv=>{
  const argObj = argv.reduce((base, arg, ind)=>{
    if(arg.indexOf('--') !== 0){
      return base
    }
    arg = arg.substr(2)
    base[arg] = argv[ind+1]
    return base
  },{})
  const eventSender = require('./util/event-sender.js')
  eventSender(mw,argObj)
})
const rootdir = __dirname
const iconName = 'logo.ico'
const isDev = process.execPath.toLowerCase().includes('electron.exe') || process.argv.includes('--debug')
const connectLocal = process.argv.includes('--local')
global.connectLocal = connectLocal
global.rootdir = rootdir
global.specialEffect = isXmas()
app.on('ready',()=>{
  const {height:dispHeight} = el.screen.getPrimaryDisplay().bounds
  if(dispHeight < APP_HEIGHT_CHANGE_BORDER){
    APP_HEIGHT -= APP_SHRINK_HEIGHT
  }
  const {BrowserWindow} = el
  if(isDev){
    try{
      BrowserWindow.addDevToolsExtension(path.join(__dirname,'../node_modules/vue-devtools/vender'))
    }catch(e){
      /*ignore*/
    }
  }
  const {nativeImage} = el
  mw = new BrowserWindow({
    height:APP_HEIGHT,
    width:APP_WIDTH,
    frame:false,
    resizable:false,
    icon:nativeImage.createFromPath(path.join(rootdir,'img', global.specialEffect ? 'special.ico' : iconName)),
    show:isDev,
    webPreferences:{
      affinity:'telepath'
    }
  })
  mw.loadURL(path.join(rootdir, 'html', 'index.html'))
  if(isDev){
    mw.webContents.openDevTools()
  }
  mw.on('closed', app.quit.bind(app))
  const bootTlApp = require('./util/boot-tl-app.js')
  bootTlApp(mw)
  setSendMessage(mw)
})

/*start qwave service for start shallwin to smooth*/
function startQwave(){
  require('child_process').exec('sc query qwave', noop)
}
function waitCodeInject(){
  ipcMain.on('inject-code', (ev, scriptPath, arg)=>{
    require(scriptPath)(arg)
  })
}

function isXmas(){
  const d = new Date()
  const m = d.getMonth()
  if(m !== 11){
    return false
  }
  const dt = d.getDate()
  if(dt < 15 || 26 < dt){
    return false
  }
  return true
}