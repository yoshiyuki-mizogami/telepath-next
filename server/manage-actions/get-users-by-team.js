'use strict'
const Team = require('../room.js')
module.exports = async teamId=>{
  const team = await Team.findById(teamId)
    .populate(
      {
        path:'users',
        select:'_id name'
      }
    )
  const {users} = team
  return users
}