'use strict'
const User = require('../user')
const Team = require('../team')
const requestTeamDetail = require('../actions/request-team-detail.js')
const logined = require('../actions/logined')
module.exports = async (wss, sock, obj)=>{
  const u = await User.findOne({
    account:obj.account
  })
  if(!u){
    return sock.send({
      method:'caughtMessage',
      message:obj.notFoundMessage
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
  const inUser = targetTeam.users.find(tu=> tu.toString() === userIdStr)
  if(!inUser){
    targetTeam.users.push(u._id)
    await targetTeam.save()
  }
  requestTeamDetail(wss, sock, {id:obj.teamId})
  if(inUser){
    return sock.send({
      method:'caughtMessage',
      message:`That user:${u.account} already exists`
    })
  }
  sock.send({
    method:'infoMessage',
    message:`Add user success: ${u.account}`
  })
  for(const c of wss.clients){
    if(c.userId === userIdStr){
      logined(c, u)
    }
  }
}