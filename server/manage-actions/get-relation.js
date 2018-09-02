'use strict'
const Room = require('../room.js')
const Team = require('../team.js')
const User = require('../user.js')
module.exports = async (wss, sock, obj)=>{
  const user = await User.findOne({account:obj.account}).select('_id name nickname account')
  if(!user){
    return sock.send({
      method:'userNotFound'
    })
  }
  const teams = await Team.find({
    users:{$in:[user._id]},
    hide:false
  }).select('_id name color')
  const teamParam = teams.map(t=>{
    return {teams:{$in:[t._id]}}
  })
  const teamMap = teams.reduce((b, t)=>{
    b[t._id.toString()] = true
    return b
  },{})
  const srooms = await Room.find({
    $or:teamParam,
    hide:false
  }).populate({
    path:'teams',
    select:'_id name color'
  })
  const rooms = srooms.map(r=>{
    const o = r.toObject()
    o.teams.forEach(t=> t.belong =!! teamMap[t._id])
    return o
  })
  /*for first login*/
  return sock.send({
    method:'gotRelation',
    user,
    rooms,
    teams
  })
}