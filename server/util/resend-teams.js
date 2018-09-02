'use strict'
let Room = require('../room')
let Team = require('../team')
module.exports = async (wss, users)=>{
  let usersIdMap = users.reduce((base, current)=>{
    base[current._id.toString()] = current
    return base
  },{})
  Array.from(wss.clients).forEach(async sock=>{
    let u = usersIdMap[sock.userId]
    if(!u){
      return
    }
    let myTeams = await Team.find({
      users:{$in:[sock.userId]}
    }).select('name color')
    let myTeamIds = myTeams.map(t=>t._id.toString())
    let inRooms = await Room.find({
      teams:{$in:myTeamIds}
    })
    /* concat target belong teams and teams in same room*/
    let allTeamIds = myTeamIds.map(id=>id)
    inRooms.forEach(r=>allTeamIds.push(...r.teams))
  
    let otherTeams = await Team.find({
      $or:[{
        _id:{$in:allTeamIds}
      },
      {
        everywhere:true
      }
      ]}).select('name color')
    let teams = otherTeams.map(_t=>{
      let t = _t.toObject()
      t.ours = myTeamIds.includes(t._id.toString())
      return t
    })
    sock.send({
      method:'gotSendables',
      teams
    })
  })
}