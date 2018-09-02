'use strict'
const User = require('../user')
const Team = require('../team')
const requestTeamDetail = require('../actions/request-team-detail.js')
const logined = require('../actions/logined.js')
module.exports = async (wss, sock, obj)=>{
  const u = await User.findById(obj.userId)
  if(!u){
    return sock.send({
      method:'caughtMessage',
      message:'User not found in that team'
    })
  }
  const targetTeam = await Team.findById(obj.teamId)
  if(!targetTeam){
    return sock.send({
      method:'caughtMessage',
      message:'That team has been deleted'
    })
  }
  const userIdStr = u._id.toString()
  const userIdx = targetTeam.users.findIndex(tu=>{
    return tu.toString() === userIdStr
  })
  if(userIdx !== -1){
    targetTeam.users.splice(userIdx, 1)
    await targetTeam.save()
  }
  requestTeamDetail(wss, sock, {id:obj.teamId})
  sock.send({
    method:'infoMessage',
    message:`Remove user success:${u.account}`
  })
  for(const c of wss.clients){
    if(c.userId === userIdStr){
      logined(c, u)
    }
  }
}