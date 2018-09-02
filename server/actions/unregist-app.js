'use strict'
const App = require('../app')
const path = require('path')
const fs = require('fs')
module.exports = async (wss, sock, obj)=>{
  const app = await App.findOne({_id:obj.appId})
    .populate({
      path:'author',
      select:'_id name account'
    })
  if(app.author._id.toString() !== sock.userId){
    return sock.send({
      method:'receiveNotify',
      level:'warn',
      message:{
        ja:'あなたのアプリでは有りません',
        en:'Not your App.'
      }
    })
  }
  await app.unregist()
  return sock.send({
    method:'receiveNotify',
    level:'warn',
    message:{
      ja:'削除されました',
      en:'Unregist complete.'
    }
  })
}