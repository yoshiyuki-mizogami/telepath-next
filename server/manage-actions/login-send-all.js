'use strict'
const User = require('../user')
module.exports = async (wss, sock, obj)=>{
  const u = await User.findOne({
    account:obj.account,
    pwd:obj.pwd
  })
  
  if(!u){
    return sock.send({method:'managerLoginFailed'})
  }
  if(!u.root && !u.sendAll){
    return sock.send({method:'managerLoginFailed'})
  }
  sock.logined = true
  sock.userId = u._id.toString()
  sock.canSendAll = true
  /*for first login*/
  sock.send({
    method:'managerLogined',
    user:u
  })
}