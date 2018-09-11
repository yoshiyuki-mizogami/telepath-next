'use strict'
const Room = require('../room')

const Team = require('../team')
const Message = require('../message')
const Etc = require('../etc')
const etc = Etc.get()
module.exports = async (connection, u)=>{
  const myTeams = await Team.find({
    users:{$in:[u._id]}
  }).select('name color')
  const myTeamIds = myTeams.map(t=>t._id.toString())
  const inRooms = await Room.find({
    teams:{$in:myTeamIds}
  })
  const allTeamIds = myTeamIds.map(id=>id)
  inRooms.forEach(r=>allTeamIds.push(...r.teams))
  const otherTeams = await Team.find({
    $or:[{
      _id:{$in:allTeamIds}
    },
    {
      everywhere:true
    }
    ]}).select('name color')
 
  const oterTeamObjs = otherTeams.map(_t=>{
    const t = _t.toObject()
    t.ours = myTeamIds.includes(t._id.toString())
    return t
  })
  connection.teams = myTeams.map(t=>t._id.toString())
  const messages = await Message.getMessages(u, connection.teams)
  connection.send({
    method:'logined',
    user:u,
    teams:oterTeamObjs,
    messages,
    etc
  })
}