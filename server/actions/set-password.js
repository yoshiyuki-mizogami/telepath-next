'use strict'
const User = require('../user')
const Login = require('./login')
module.exports = async (wss, sock, obj)=>{
  const u = await User.findOne({
    _id:sock.userId
  })
  if(!u){
    return sock.send({method:'loginFailed'})
  }
  u.pwd = obj.newPassword
  u.lastLogin = new Date()
  await u.save()
  Login(wss, sock, u)
}