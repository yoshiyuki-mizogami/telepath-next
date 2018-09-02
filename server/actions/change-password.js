'use strict'
const User = require('../user')
module.exports = async (wss, sock, obj)=>{
  const u = await User.findOne({
    _id:sock.userId,
    pwd:obj.currentPassword
  })
  if(!u){
    return sock.send({
      method:'receiveNotify',
      level:'warn',
      message:{
        en:'Current password missmatched.',
        ja:'現在のパスワードが一致していません'
      }
    })
  }
  u.pwd = obj.newPassword
  u.lastLogin = new Date()
  await u.save()
  return sock.send({
    method:'passwordChanged'
  })
}