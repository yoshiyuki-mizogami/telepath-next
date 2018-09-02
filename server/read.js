'use strict'
const mg = require('mongoose')
const {Types} = mg.Schema

const ReadSchema = new mg.Schema({
  reader:{
    type:Types.ObjectId,
    ref:'User',
    index:true
  },
  message:{
    type:Types.ObjectId,
    index:true
  },
  priority:{
    type:Number,
    default:0
  },
  readAt:{
    type:Date,
    default:Date.now
  }
})
ReadSchema.index({reader:1, message:1}, {unique:true})
const Read = mg.model('Read', ReadSchema)

module.exports = Read