'use strict'
const Room = require('../room.js')
module.exports = async (wss, sock, obj)=>{
  const tgroom = await Room.findOne({_id:obj.roomId},{_id:true, name:true})
  Object.assign(tgroom, obj.data)
  await tgroom.save()
  sock.send({
    method:'updatedRoom',
    room:tgroom
  })
  sock.send({
    method:'infoMessage', 
    message:'Success update room infomation'
  })
}