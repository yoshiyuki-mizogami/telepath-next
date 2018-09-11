'use strict'
const _ = require('lodash')
const User = require('../user')
module.exports = async (server,cl, res, obj)=>{
  if(!cl){
    return
  }
  const u = await User.findOne({
    _id:cl.userId
  })
  if(!u){
    return 
  }
  Object.assign(u, _.pick(obj.data, ['nickname', 'tel', 'mail', 'depart', 'message']))
  await u.save()
}