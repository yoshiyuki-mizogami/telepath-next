'use strict'
const App = require('../app')
module.exports = async (wss, sock, obj)=>{
  const {appId} = obj.appId
  const app = await App.findOne({
    _id:appId
  },{
    select:'_id name collaborators'
  })
  if(!app){
    return sock.send({
      method:'caughtMessage',
      message:'The App not found'
    })
  }
  app.collaborators.push(obj.userId)
  await app.save()
  /*for first login*/
  return sock.send({
    method:'infoMessage',
    message:`Success add collaborator to ${app.name}`
  })
}