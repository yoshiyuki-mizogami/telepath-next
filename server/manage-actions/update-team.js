'use strict'
const Team = require('../team.js')
const getRelatedUsersByTeam = require('../util/get-related-users-by-team.js')
const resendTeams = require('../util/resend-teams.js')
module.exports = async (wss, sock, obj)=>{
  const tgTeam = await Team.findOne({_id:obj.teamId},{_id:true, name:true, hide:true})
  Object.assign(tgTeam, obj.data)
  await tgTeam.save()
  sock.send({
    method:'updatedTeam',
    team:tgTeam
  })
  sock.send({
    method:'infoMessage', 
    message:'Success update team infomation'
  })
  if(obj.data.hide){
    return
  }
  const users = await getRelatedUsersByTeam(obj.teamId)
  resendTeams(wss, users)
}