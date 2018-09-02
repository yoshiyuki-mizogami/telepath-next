'use strict'
const Room = require('../room.js')
const _ = require('lodash')
module.exports = async roomId=>{
  const room = await Room.findById(roomId)
    .populate({
      path:'teams',
      populate:{
        path:'users',
        select:'_id name'
      }
    })
  const users = _(room.teams.map(t=> t.users)).flatten().uniqBy('_id').value()
  return users
}