'use strict'
const User = require('../user')
const Team = require('../team')
module.exports = async (wss, sock, obj)=>{
  const u = await User.findById(obj.userId)
  if(!u){
    return sock.send({
      method:'caughtMessage',
      message:'User not found'
    })
  }
  await Team.update({},{
    $pull:{users:obj.userId}
  })
  await User.findByIdAndUpdate(obj.userId,{$set:{name:'-DELETED-'},$unset:{account:1, keeps:1}})
  sock.send({
    method:'infoMessage',
    message:`Remove user success:${u.account}`
  })
  sock.send({
    method:'removedUser',
    userId:obj.userId
  })
  for(const c of wss.clients){
    if(c.userId === obj.userId){
      c.close()
    }
  }
}