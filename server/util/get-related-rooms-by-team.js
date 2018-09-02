'use strict'
const Room = require('../room.js')
const getUsersByRoom = require('../manage-actions/get-users-by-room.js')
const _ = require('lodash')
module.exports = async teamId=>{
  const rooms = await Room.find({teams:{$in:[teamId]}})
  const allRelatedUsers = await rooms.reduce((before, current)=>{
    return before.then((ary)=>{
      return getUsersByRoom(current._id)
        .then((users)=>{
          ary.push(...users)
          return ary
        })
    })
  }, Promise.resolve([]))
  const users = _(allRelatedUsers).uniqBy('_id').value()
  return users
}