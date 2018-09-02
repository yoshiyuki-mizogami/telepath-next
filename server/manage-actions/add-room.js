'use strict'
const Room = require('../room.js')
const getRooms = require('./get-rooms.js')
module.exports = async (wss, sock, obj)=>{
  const newRoom = await Room.create({
    name:obj.name,
    teams:[]
  })
  await newRoom.save()
  /*for first login*/
  sock.send({
    method:'infoMessage',
    message:'Success add new room'
  })
  getRooms(wss, sock)
}