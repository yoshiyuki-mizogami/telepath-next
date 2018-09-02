'use strict'
const Team = require('../team.js')
module.exports = async (wss, sock, obj)=>{
  const _team = await Team.findById(obj.id)
    .populate([
      {
        path:'users',
        select:'name nickname account lastLogin iconCache'
      },
      {
        path:'relay',
        select:'name color'
      }
    ])
  const connectedUserIds = {}
  const team = _team.toObject()
  for(const c of wss.clients){
    if(c.root){
      continue
    }
    connectedUserIds[c.userId] = c
  }
  team.users.forEach(u=>{
    const sock = connectedUserIds[u._id.toString()]
    u.connected = !!sock
    u.idle = false
    if(sock){
      u.idle = sock.idle
    }
  })
  sock.send({
    method:'gotTeamDetail',
    team
  })
}