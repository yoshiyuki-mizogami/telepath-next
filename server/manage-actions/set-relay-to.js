'use strict'
const Team = require('../team.js')
module.exports = async (wss, sock, {teamId, relayId})=>{
  const tgTeam = await Team.findOne({_id:teamId})
  tgTeam.relay = relayId || null
  await tgTeam.save()
  sock.send({
    method:'infoMessage', 
    message:'Success update team relay setting'
  })
}