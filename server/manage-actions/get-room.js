'use strict'
const Room = require('../room.js')
module.exports = async (wss, sock,obj)=>{
  const room = await Room.findById(obj.roomId)
    .populate('teams')
  /*for first login*/
  return sock.send({
    method:'gotRoom',
    room
  })
}