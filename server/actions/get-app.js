'use strict'
const App = require('../app')
module.exports = async (wss, sock, obj)=>{
  const app = await App.findOne({_id:obj.appId})
    .populate({
      path:'author',
      select:'_id name account'
    })
  const bin = await app.fetchBin()
  sock.send({
    method:'gotApp',
    app,
    bin
  })
  app.download++
  app.save()
}