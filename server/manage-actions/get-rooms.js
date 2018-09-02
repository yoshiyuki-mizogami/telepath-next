'use strict'
const Room = require('../room.js')
module.exports = async (wss, sock)=>{
  const rooms = await Room.getAllRooms()
  /*for first login*/
  return sock.send({
    method:'gotRooms',
    rooms
  })
}