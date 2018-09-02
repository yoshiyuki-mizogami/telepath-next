'use strict'
const Room = require('../room')

const Team = require('../team')
const Message = require('../message')
const Etc = require('../etc')
const etc = Etc.get()
module.exports = async (sock, u, nomessage = false)=>{
  const myTeams = await Team.find({
    users:{$in:[u._id]}
  }).select('name color')
  const myTeamIds = myTeams.map(t=>t._id.toString())
  const inRooms = await Room.find({
    teams:{$in:myTeamIds},
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
  sock.teams = myTeams.map(t=>t._id.toString())
  let messages
  if(nomessage){
    messages = []
  }else{
    messages = await Message.getMessages(u, sock.teams)
  }

  sock.send({
    method:'logined',
    user:u,
    teams:oterTeamObjs,
    messages,
    etc
  })
}