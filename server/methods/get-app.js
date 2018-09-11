'use strict'
const App = require('../app')
module.exports = async (server, cl, res, obj)=>{
  const app = await App.findOne({_id:obj.appId})
    .populate({
      path:'author',
      select:'_id name account'
    })
  const bin = await app.fetchBin()
  cl.send({
    method:'gotApp',
    app,
    bin
  })
  app.download++
  app.save()
}