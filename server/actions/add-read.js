'use strict'
const Message = require('../message')
const MESSAGE_READ_COUNT_LIMIT = 100
module.exports = (wss, sock, obj)=>{
  return Message.findOne({
    _id:obj.messageId
  }).select('parent sender readCount destTeams revoked forAll')
    .populate({
      path:'parent',
      select:'sender destTeams'
    }).then(message=>{
      const {forAll} = message
      const dt = message.parent?message.parent.destTeams:message.destTeams
      let parentSenderId
      if(message.parent){
        parentSenderId = message.parent.sender.toString()
      }
      const messageSenderId = message.sender.toString()
      const destTeams = dt.map(d=>d.toString())
      if(!sock.userId){
        console.log('socket user id not found')
        return
      }
      message.addRead(sock.userId,obj.priority).then(read=>{
        /*return read user only*/
        if(message.revoked || MESSAGE_READ_COUNT_LIMIT < message.readCount){
          sock.send({
            method:'increamentReadMessage',
            yours:true,
            message,
            read:read
          })
          return
        }
        for(const c of wss.clients){
          if(!c.userId || !c.teams){continue}
          const yours = sock.userId === c.userId
          const teams = c.teams
          const isTarget = forAll || teams.some(t=>destTeams.includes(t))
          if(!isTarget && parentSenderId !== c.userId && messageSenderId !== c.userId){
            continue
          }
          const readObj = {
            method:'increamentReadMessage',
            yours,
            message
          }
          if(yours){
            readObj.read = read
          }
          c.send(readObj)
        }
      })
    }).catch(e=>{
      console.error(e)
    })
}