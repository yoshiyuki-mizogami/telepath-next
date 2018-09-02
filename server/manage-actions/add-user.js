'use strict'
const User = require('../user')
module.exports = async (wss, sock, obj)=>{
  const userObj = obj.user
  const user = await User.findOne({
    account:userObj.account
  },{
    select:'_id'
  })
  if(user){
    return sock.send({
      method:'caughtMessage',
      message:`User ${userObj.account} already exists`
    })
  }
  const newUser = new User(userObj)
  await newUser.save()
  /*for first login*/
  sock.send({
    method:'infoMessage',
    message:`Success add user ${userObj.account}`
  })
  return sock.send({
    method:'addedUser',
    user:newUser
  })
}