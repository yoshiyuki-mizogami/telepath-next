'use strict'
const App = require('../app')
module.exports = async (wss, sock, obj)=>{
  try{
    const app = await App.registApp(obj.app, obj.bin)
    sock.send({
      method:'registedApp',
      app
    })
    advertiseAppUpdate(wss, app.name)
  }catch(e){
    return sock.send({
      method:'receiveNotify',
      level:'warn',
      message:e
    })
  }
}

function advertiseAppUpdate(wss, name){
  for(const c of wss.clients){
    c.send({
      method:'receiveUpdateApp',
      name
    })
  }

}