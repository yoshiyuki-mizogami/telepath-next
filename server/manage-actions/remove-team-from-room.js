'use strict'
const Room = require('../room.js')
const getRoom = require('./get-room.js')
const getUsersByRoom = require('./get-users-by-room.js')
const resendTeams = require('../util/resend-teams.js')
module.exports = async (wss, sock, obj)=>{
  const users = await getUsersByRoom(obj.roomId)
  await Room.findByIdAndUpdate(obj.roomId,{
    $pull:{teams:obj.teamId}
  })
  sock.send({
    method:'infoMessage',
    message:'Success remove team from room'
  })
  getRoom(wss, sock, obj)
  resendTeams(wss, users)
}