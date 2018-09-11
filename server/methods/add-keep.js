'use strict'
const User = require('../user.js')
const Message = require('../message.js')
const File = require('../file.js')
const KEEP_LIMIT = 300
module.exports = async (server, cl, res, obj)=>{
  const message = await Message.findById(
    obj.messageId
  ).select({
    updatedAt:false,
    sender:false,
    destTeams:false
  })
  if(message.revoked){
    return cl.send({
      method:'receiveNotify', 
      level:'err',
      message:{
        en:'That message has been revoked.',
        ja:'削除されたメッセージです'
      }
    })
  }
  const target = await User.findById(res.userId)

  if( KEEP_LIMIT <= target.keeps.length){
    return cl.send({
      method:'receiveNotify', 
      level:'err',
      message:{
        en:`Reached keep limit size ${KEEP_LIMIT}.`,
        ja:`Keepの登録上限${KEEP_LIMIT}に達しています`
      }
    })
  }
  if(target.keeps.find(k=>k._id === obj.messageId)){
    return cl.send({
      method:'receiveNotify',
      level:'err',
      message:{
        en:'Already added it.',
        ja:'すでに登録されています'
      }
    })
  }

  const mobject = message.toObject()
  mobject._id = mobject._id.toString()
  if(message.parent){
    const parent = await Message.findById(message.parent).select({destTeamNames:true})
    mobject.destTeamNames = parent.destTeamNames
  }
  if(mobject.files.length){
    mobject.files = await Promise.all(mobject.files.map(async f=>{
      return File.findById(f).select({name:true})
    }))
  }
  mobject.keepedAt = new Date()
  target.keeps.push(mobject)
  /*same user other connection ignore*/
  await target.save()
  cl.send({
    method:'receiveNotify',
    level:'sucess',
    message:{
      en:'Succeed add it to keep.',
      ja:'Keepに追加されました。'
    }
  })
}