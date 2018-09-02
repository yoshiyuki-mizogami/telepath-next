'use strict'
const Room = require('../room.js')
const getRoom = require('./get-room.js')
const getUsersByRoom = require('./get-users-by-room.js')
const resendTeams = require('../util/resend-teams.js')
module.exports = async (wss, sock, obj)=>{
  await Room.findByIdAndUpdate(obj.roomId,{
    $addToSet:{teams:obj.teamId}
  })
  sock.send({
    method:'infoMessage',
    message:'Success add team to room'
  })
  getRoom(wss, sock, obj)
  const users = await getUsersByRoom(obj.roomId)
  resendTeams(wss, users)
}