'use strict'
const User = require('../user.js')
const Team = require('../team.js')
module.exports = async (server, cl)=>{
  const {userId} = cl
  const targetConnection =  Array.from(server.clients).find(c=>{
    return c.userId === userId && !c.root
  })
  let connected = false
  let idle = false
  if( targetConnection ){
    connected = true
    idle = targetConnection.idle
  }
  const teams = await Team.find({
    users:{$in:[userId]},
    hide:false
  }).select('_id name')
  const user = await User.findOne({_id:userId})
    .catch(console.error)
  cl.send({
    method:'gotUserInfo',
    user,
    teams,
    connected,
    idle
  })
  
}