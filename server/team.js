'use strict'
const mg = require('mongoose')
const {Schema} = mg

const TeamSchema = new Schema({
  name:String,
  color:String,
  hide:{
    type:Boolean,
    default:false
  },
  relay:{
    type:Schema.Types.ObjectId,
    ref:'Team'
  },
  everywhere:{
    type:Boolean,
    default:false
  },
  users:[{
    type:Schema.Types.ObjectId,
    ref:'User'
  }]
})

const Team = mg.model('Team',TeamSchema)
module.exports = Team