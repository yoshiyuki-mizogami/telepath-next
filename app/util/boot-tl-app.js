const {ipcMain, BrowserWindow} = require('electron')
const path = require('path')
const windowStore = {}
module.exports = function bootTlApp(mainWindow){
  ipcMain.on('boot-tl-app', (ev, dir, pkg, dev=false)=>{
    const {name} = pkg
    if(windowStore[name]){
      /*show exists window on multiboot*/
      const win = windowStore[name]
      win.restore()
      win.focus()
      win.show()
      return
    }
    let showMenu = false
    /*Set root for icon path*/
    if(dev){
      showMenu = true
      const {Menu} = require('electron')
      const templ = [
        {role:'reload'},
        {role:'toggledevtools'}
      ]
      Menu.setApplicationMenu(Menu.buildFromTemplate(templ))
      if(pkg.devtool){
        const devtoolPath = path.join(dir, pkg.devtool)
        try{
          const devs = BrowserWindow.getDevToolsExtensions()
          Object.keys(devs).map(name=>BrowserWindow.removeDevToolsExtension(name))
          BrowserWindow.addDevToolsExtension(devtoolPath)
        }catch(e){
          throw new Error(`Devtool not found at "${devtoolPath}"`)
        }
      }
    }
    pkg.icon = path.join(dir, pkg.icon)
    const main = path.join(dir, pkg.main)
    const {window:wopt} = pkg
    wopt.icon = wopt.icon || pkg.icon
    const w = new BrowserWindow(wopt)
    w.on('get-account', (f)=>  mainWindow.emit('get-account', f))
    w.on('get-account-info', fnc1=>{
      mainWindow.emit('get-account-info', data=>fnc1(data))
    })
    windowStore[name] = w
    w.TL_TEST = showMenu
    w.setMenuBarVisibility(showMenu)
    w.loadFile(main)
    w.on('close', ()=>{
      delete windowStore[name]
      w.destroy()
    })
  })
}
