'use strict'
const User = require('../user')
const Team = require('../team')

module.exports = async (wss, sock, obj)=>{
  const u = await User.findOne({
    account:obj.account,
    pwd:obj.pwd
  })
  
  if(!u){
    return sock.send({method:'managerLoginFailed'})
  }
  if(!u.root && (u.manageTeams||[]).length === 0){
    return sock.send({method:'managerLoginFailed'})
  }
  sock.logined = true
  sock.userId = u._id.toString()
  sock.root = u.root
  sock.manageTeams = u.manageTeams
  const teamSearch = {}
  if(!obj.debug){
    teamSearch.hide = {$ne:true}
  }
  const teams = await Team.find(teamSearch)
  /*for first login*/
  sock.send({
    method:'managerLogined',
    user:u,
    teams
  })
}