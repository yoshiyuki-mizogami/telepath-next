'use strict'
const App = require('../app')
module.exports = async (server, cl, res, obj)=>{
  try{
    const app = await App.registApp(obj.app, obj.bin)
    cl.send({
      method:'registedApp',
      app
    })
    advertiseAppUpdate(server, app.name)
  }catch(e){
    return cl.send({
      method:'receiveNotify',
      level:'warn',
      message:e
    })
  }
}
function advertiseAppUpdate(server, name){
  for(const c of server.clients){
    c.send({
      method:'receiveUpdateApp',
      name
    })
  }

}