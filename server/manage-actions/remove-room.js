'use strict'
const Room = require('../room.js')
module.exports = async (wss, sock, obj)=>{
  const r = await Room.findById(obj.roomId)
  if(!r){
    return sock.send({
      method:'caughtMessage',
      message:'Room not found'
    })
  }
  if(r.teams.length){
    return sock.send({
      method:'caughtMessage',
      message:'Exists team(s) can\'t remove room'
    })
  }
  await r.remove()
  sock.send({
    method:'infoMessage',
    message:`Room "${r.name}" removed success`
  })
  sock.send({
    method:'removedRoom',
    roomId:obj.roomId
  })
}