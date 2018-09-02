'use strict'
const User = require('../user')
module.exports = async (wss, sock, obj)=>{
  const user = await User.findOne({_id:obj.userId}) 
  if(!user){
    return sock.send({
      method:'caughtMessage',
      message:`User ${user.account} not exists`
    })
  }
  user.pwd = user.account
  user.lastLogin = null
  await user.save()
  /*for first login*/
  sock.send({
    method:'infoMessage',
    message:`Success user password Initialize for ${user.account}`
  })
}