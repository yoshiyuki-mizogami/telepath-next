'use strict'
const mg = require('mongoose')
const {Schema} = mg
const UserSchema = new Schema({
  account:{
    type:String,
    trim:true,
    unique:true,
    sparse:true
  },
  name:{
    type:String,
    trim:true
  },
  nickname:{
    type:String,
    trim:true
  },
  tel:{
    type:String,
    trim:true
  },
  mail:{
    type:String,
    trim:true
  },
  depart:{
    type:String
  },
  message:{
    type:String
  },
  keeps:{
    type:Array,
    default:[]
  },
  pwd:String,
  root:{
    type:Boolean,
    default:false
  },
  sendAll:{
    type:Boolean, 
    default:false
  },
  teamOrder:{
    type:Object,
    default:{}
  },
  lastLogin:Date,
  version:String
},{strict:false})
UserSchema.virtual('iconCache').get(function(){
  console.log(global.iconCacheQuery)
  return global.iconCacheQuery
})
UserSchema.statics.updateGlobalIconCache = function(){
  global.iconCacheQuery = Date.now()
}
const User = mg.model('User', UserSchema)

module.exports = User