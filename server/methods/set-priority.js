'use strict'
const Read = require('../read.js')
module.exports = (server,cl, res, obj)=>{
  const objId = obj.id
  return Read.updateOne({
    reader:cl.userId,
    message:objId
  },{
    priority:obj.priority
  }).then(()=>{
    cl.send({
      method:'priorityUpdated',
      priority:obj.priority,
      id:objId
    })
  }).catch(e=>{
    console.error(e)
  })
}