'use strict'
const _ = require('lodash')
const User = require('../user')
module.exports = async (wss, sock, obj)=>{
  const u = await User.findOne({
    _id:sock.userId
  })
  if(!u){
    return 
  }
  Object.assign(u, _.pick(obj.data, ['nickname', 'tel', 'mail', 'depart', 'message']))
  await u.save()
}