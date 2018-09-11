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
  session:{
    type:String
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
  return global.iconCacheQuery
})
UserSchema.statics.updateGlobalIconCache = function(){
  global.iconCacheQuery = Date.now()
}
UserSchema.statics.auth = function(cookie){
  const authData = cookie.split(',').reduce((base, current)=>{
    const [key,value] = current.split('=')
    base[key] = value
    return base
  }, {})
  return User.findOne(authData)
}
const User = mg.model('User', UserSchema)

module.exports = User