'use strict'
const User = require('../user.js')
const NOT_FOUND = -1
module.exports = async (_, sock, obj)=>{
  const target = await User.findById(sock.userId).select({keeps:true})
  const {keeps} = target
  const pos = keeps.findIndex(k=>{
    return k._id === obj.messageId
  })
  if(pos === NOT_FOUND){
    return sock.send({
      method:'receiveNotify',
      level:'warn',
      messageName:'ALREADY_REMOVED_IT',
      message:{
        en:'Already removed it.',
        ja:'すでに削除されています'
      }
    })
  }
  keeps.splice(pos, 1)
  await target.save()
  sock.send({
    method:'receiveNotify',
    level:'success',
    message:{
      en:'Succeed remove it.',
      ja:'Keepが削除されました'
    }
  })
  sock.send({
    method:'removedKeep',
    messageId:obj.messageId
  })
}