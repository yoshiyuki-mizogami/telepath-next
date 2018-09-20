'use strict'
const uuid = require('uuid/v5')
const User = require('../user')
module.exports = async function login(server,cl, res, obj){
  const u = await User.findOne({
    account:obj.account, 
    pwd:obj.pwd
  })
  if(!u){
    return res.end({
      logined:false
    })
  }
  if(obj.newPassword){
    u.pwd = obj.newPassword
    u.lastLogin = new Date()
    await u.save()
  }
  if(!u.lastLogin){
    return res.end({
      logined:false,
      requireNewPassword:true
    })
  }
  const idStr = u._id.toString()
  const hash = uuid(idStr + Date.now(), uuid.DNS)
  u.session = hash
  await u.save()
  res.writeHead(200, {'Set-Cookie':`session=${hash},_id=${idStr}`, 'Content-Type':'application/json'})
  res.end({
    logined:true
  })
}