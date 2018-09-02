'use strict'
const Read = require('../read.js')
module.exports = (wss, sock, obj)=>{
  const objId = obj.id
  return Read.updateOne({
    reader:sock.userId,
    message:objId
  },{
    priority:obj.priority
  }).then(()=>{
    sock.send({
      method:'priorityUpdated',
      priority:obj.priority,
      id:objId
    })
  }).catch(e=>{
    console.error(e)
  })
}