'use strict'
const User = require('../user')
module.exports = async (server,cl, res, obj)=>{
  const u = await User.findOne({
    _id:cl.userId
  })
  if(!u){
    return 
  }
  u.teamOrder = obj.order
  await u.save()
}