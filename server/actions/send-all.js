'use strict'
const Message = require('../message.js')
const File = require('../file.js')
const Read = require('../read.js')
const User = require('../user.js')
module.exports = async (wss, sock, obj)=>{
  /*replay message*/
  const {message} = obj
  const {files} = message
  const newMessage = new Message(message)
  newMessage.destTeamNames = ['All Users']
  newMessage.forAll = true
  newMessage.isTop = true
  const retFiles = await Promise.all(files.map(f=>{
    const {content} = f
    f.content = undefined
    const file = new File(f)
    return file.save()
      .then(()=>file.saveContent(content))
      .then(()=>file)
  }))
  newMessage.files = retFiles.map(f=>f.id)
  await newMessage.save()
  await new Read({
    reader:sock.userId,
    message:newMessage._id
  }).save()
  const sender = await User.findOne(newMessage.sender).select('nickname')
  const newMess = JSON.parse(JSON.stringify(newMessage))
  newMess.sender = sender
  newMess.reads = []
  newMess.files = retFiles.map(f=>{
    return {
      _id:f._id,
      name:f.name,
      icon:f.icon
    }
  })
  for(const s of wss.clients){
    if(!s.userId){
      continue
    }
    s.send({
      method:'receiveMessage',
      message:newMess
    })
  }
}