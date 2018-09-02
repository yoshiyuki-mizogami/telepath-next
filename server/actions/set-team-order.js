'use strict'
const User = require('../user')
module.exports = async (wss, sock, obj)=>{
  const u = await User.findOne({
    _id:sock.userId
  })
  if(!u){
    return 
  }
  u.teamOrder = obj.order
  await u.save()
}