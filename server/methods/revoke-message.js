'use strict'
const Message = require('../message')
module.exports = async (server,cl, res, obj)=>{
  const message = await Message.findOne({
    _id:obj.messageId,
    sender:cl.userId
  }).select('parent sender destTeams revoked')
    .populate({
      path:'parent',
      select:'sender destTeams'
    })
  if(!message){
    return
  }
  const dt = message.parent?message.parent.destTeams:message.destTeams
  let parentSenderId
  if(message.parent){
    parentSenderId = message.parent.sender.toString()
  }
  const messageSenderId = message.sender.toString()
  const destTeams = dt.map(d=>d.toString())
  message.revoked = true
  const {forAll}  = message.parent || message
  await message.save()
  for(const c of server.clients){
    if(!c.teams){continue}
    const teams = c.teams
    const isTarget = forAll || teams.some(t=>destTeams.includes(t))
    if(!isTarget && parentSenderId !== c.userId && messageSenderId !== c.userId){
      continue
    }
    c.send({
      method:'revokedMessage',
      message
    })
  }
}