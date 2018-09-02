'use strict'
const App = require('../app')
module.exports = async (wss, sock, obj)=>{
  const apps = await App.find({
    download:{$gte:10}
  }).sort({download:-1}).limit(10)
    .populate({
      path:'author',
      select:'_id name account'
    })
  sock.send({
    method:'gotRecommended',
    apps
  })
}