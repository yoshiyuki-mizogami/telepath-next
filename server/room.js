'use strict'
const mg = require('mongoose')
const {Schema} = mg

const RoomSchema = new Schema({
  name:String,
  teams:[{
    type:Schema.Types.ObjectId,
    ref:'Team'
  }],
  hide:{
    type:Boolean,
    default:false
  }
})

RoomSchema.statics.getAllRooms = function(){
  return this.find()
    .populate('teams')
}
RoomSchema.statics.removeTeamFromAllRooms = function(id){
  return this.updateMany({}, {$pull:{teams:id}})
}

const Room = mg.model('Room',RoomSchema)
module.exports = Room