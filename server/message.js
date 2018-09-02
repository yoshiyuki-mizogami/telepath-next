'use strict'
require('./file')
const Read = require('./read')
const mg = require('mongoose')
global.iconCacheQuery = Date.now()
const MESSAGE_MODEL_NAME = 'Message'
/* message out date limit*/
const MESSAGE_LIMIT = (1000 * 60 * 60 * 24 ) * 20
const {Types} = mg.Schema

const MessageSchema = new mg.Schema({
  content:String,
  forAll:{
    type:Boolean,
    default:false
  },
  type:String,
  parent:{
    type:Types.ObjectId,
    ref:MESSAGE_MODEL_NAME
  },
  sendAt:{
    type:Date,
    default:Date.now
  },
  updatedAt:{
    type:Date,
    default:Date.now
  },
  senderName:String,
  sender:{
    type:Types.ObjectId,
    ref:'User'
  },
  destTeams:[Types.ObjectId],
  destTeamNames:[String],
  readCount:{
    type:Number,
    default:0
  },
  files:[{
    type:Types.ObjectId,
    ref:'File'
  }],
  revoked:{
    type:Boolean,
    default:false
  }
},{ toJSON: { virtuals: true } })
MessageSchema.virtual('reads',{
  ref:'Read',
  localField:'_id',
  foreignField:'message',
  justOne:false
})
MessageSchema.virtual('children', {
  ref:MESSAGE_MODEL_NAME,
  localField:'_id',
  foreignField:'parent',
  justOne:false
})
MessageSchema.statics.getMessages = async function(from ,teams){
  const limitDate = new Date()
  limitDate.setTime(limitDate.getTime() - MESSAGE_LIMIT)
  const messages = await this.find({$or:[{
    destTeams:{$in:teams},
    updatedAt:{$gt:limitDate}
  },
  {
    sender:from._id,
    parent:null,
    updatedAt:{$gt:limitDate}
  },
  {
    forAll:true,
    parent:null,
    updatedAt:{$gt:limitDate}
  }]}
  ).populate({
    path:'sender',
    select:'_id name nickname'
  }).populate({
    path:'children',
    options:{sort:{sendAt:-1}},
    populate:[
      {
        path:'sender',
        select:'_id name nickname'
      },
      {
        path:'files',
        select:'name icon'
      },
      {
        path:'reads',
        select:'reader priority',
        match:{
          reader:from.id
        }
      }
    ]
  }).populate({
    path:'files',
    select:'name icon'
  }).populate({
    path:'reads',
    select:'reader priority',
    match:{
      reader:from.id
    }
  }).sort({
    sendAt:-1
  })
  messages.forEach(m=>{
    m.senderName = m.sender.nickname || m.sender.name
    m.children.forEach(cm=> cm.senderName = cm.sender.nickname || cm.sender.name)
  })
  return messages
}
MessageSchema.statics.getMessageByParentIds = async function(parentIds, all = false){
  const Team = require('./team.js')
  const hideTeams = await Team.find({hide:true}, {_id:true})
  const hideTeamsIds = hideTeams.map(h=>h._id)
  const searchParam = {
    _id:{$in:parentIds}
  }
  if(!all){
    searchParam.destTeams = {$nin:hideTeamsIds}
  }
  const messages = await  this.find(searchParam).populate({
    path:'sender',
    select:'_id name'
  }).populate({
    path:'children',
    options:{sort:{sendAt:-1}},
    populate:[
      {
        path:'files',
        select:'name'
      }
    ]
  }).populate({
    path:'files',
    select:'name'
  }).sort({
    sendAt:-1
  })
  return messages
}
MessageSchema.statics.updateGlobalIconCache = function(){
  global.iconCacheQuery = Date.now()
}
MessageSchema.virtual('iconCache').get(function(){
  return global.iconCacheQuery
})
MessageSchema.methods.addRead = function(reader, priority = 0){
  const r = new Read({
    reader:reader,
    message:this._id,
    priority
  })
  return r.save().then(()=>{
    this.readCount++
    this.save()
    return r
  })
}
MessageSchema.index({sendAt:-1})
MessageSchema.index({updatedAt:-1})
MessageSchema.index({parent:-1},{sparse:true})
const Message = mg.model(MESSAGE_MODEL_NAME, MessageSchema)

module.exports = Message