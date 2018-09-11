'use strict'
const User = require('../user.js')
const Team = require('../team.js')
module.exports = async (server, cl, res, obj)=>{
  const {userId} = cl
  const {targetUserId} = obj
  const targetConnection =  Array.from(server.clients).find(c=>{
    return c.userId === targetUserId && !c.root
  })
  let connected = false
  let idle = false
  if( targetConnection ){
    connected = true
    idle = targetConnection.idle
  }
  const teams = await Team.find({
    users:{$in:[targetUserId]},
    hide:false
  }).select('_id name')
  const user = await User.findOne({_id:targetUserId})
    .catch(console.error)
  cl.send({
    method:'gotUserInfo',
    user,
    teams,
    connected,
    idle
  })
  
}