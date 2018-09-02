
'use strict'
const Room = require('../room')
const Team = require('../team')
module.exports = async (wss, sock, obj)=>{
  const t = await Team.findById(obj.teamId)
  if(!t){
    return sock.send({
      method:'caughtMessage',
      message:'Team not found'
    })
  }
  if(t.users.length){
    return sock.send({
      method:'caughtMessage',
      message:'Exists user can\'t delete'
    })
  }
  await Room.removeTeamFromAllRooms(t._id)
  await t.remove()
  sock.send({
    method:'infoMessage',
    message:`Remove team "${t.name}" success`
  })
  sock.send({
    method:'removedTeam',
    teamId:obj.teamId
  })
}