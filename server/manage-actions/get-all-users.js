'use strict'
const CONNECT = 1
const IDLE = 2
const User = require('../user')
module.exports = async (wss, sock)=>{
  const _users = await User.find({
    account:{$exists:true}
  })
    .select('_id account name lastLogin version nickname tel mail depart message')
  const connectedUsers = 
    Array.from(wss.clients).reduce((before,c)=>{
      let state = CONNECT
      if(c.idle){
        state |= IDLE
      }
      before[c.userId] = state
      return before
    },{})
  const users = _users.map(u=>{
    const uo = u.toObject()
    const state = connectedUsers[uo._id.toString()] || 0
    uo.connected = !!state
    uo.idle = !!(state & IDLE)
    return uo
  })
  /*for first login*/
  return sock.send({
    method:'gotAllUsers',
    users
  })
}