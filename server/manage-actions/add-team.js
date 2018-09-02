
'use strict'
const Team = require('../team.js')
module.exports = async (wss, sock, obj)=>{
  const team = obj.team
  const newTeam = new Team(team)
  await newTeam.save()
  /*for first login*/
  sock.send({
    method:'infoMessage',
    message:`Success add team ${newTeam.name}`
  })
  return sock.send({
    method:'addedTeam',
    team:newTeam
  })
}