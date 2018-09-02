'use strict'
const Message = require('../message')
const File = require('../file')
const User = require('../user')
const Read = require('../read.js')
function getReplyFrom(_id){
  return Message.findOne({_id})
}
module.exports = async (wss, sock, obj)=>{
  /*replay message*/
  const {message} = obj
  let {destTeams} = message
  const {files} = message
  const from = sock.userId
  let p
  let replySorceUserId
  let fromAll = false
  if(message.parent){
    p = getReplyFrom(message.parent)
      .then(replySource=>{
        replySource.updatedAt = Date.now()
        replySorceUserId = replySource.sender.toString()
        destTeams = replySource.destTeams.map(t=>t.toString())
        fromAll = replySource.forAll
        /*no return because no need wait update*/
        replySource.save()
      })
  }else{
    p = Promise.resolve()
  }
  await p
  const newMessage = new Message(message)
  newMessage.isTop = !message.parent
  const retFiles = await Promise.all(files.map(f=>{
    const {content} = f
    f.content = undefined
    const file = new File(f)
    return file.save()
      .then(()=>file.saveContent(content))
      .then(()=>file)
  }))
  newMessage.forAll = fromAll
  newMessage.files = retFiles.map(f=>f.id)
  await newMessage.save()
  await new Read({
    reader:sock.userId,
    message:newMessage._id
  }).save()
  const sender = await User.findOne(newMessage.sender).select('name nickname')
  const newMess = JSON.parse(JSON.stringify(newMessage))
  newMess.sender = sender
  newMess.senderName = sender.nickname || sender.name
  newMess.reads = []
  newMess.files = retFiles.map(f=>{
    return {
      _id:f._id,
      name:f.name,
      icon:f.icon
    }
  })
  /* Optimize for Send same objext as string to multi sockets*/
  const messString = JSON.stringify({
    method:'receiveMessage',
    message:newMess
  })
  for(const s of wss.clients){
    if(!s.teams){
      continue
    }
    const isTarget = fromAll || s.teams.some(t=>destTeams.includes(t))
    if(!isTarget && s.userId !== from && s.userId !== replySorceUserId){
      continue
    }
    s._send(messString)
  }
}