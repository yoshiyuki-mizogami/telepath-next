'use strict'
const Message = require('../message.js')
const _ = require('lodash')
module.exports = async (_wss, sock, obj)=>{
  const {searchParams:s} = obj
  const searchParam = {
    sendAt:s.sendAt
  }
  if(s.senderName){
    searchParam.senderName = new RegExp(s.senderName)
  }
  if(s.content){
    searchParam.content = new RegExp(s.content)
  }
  if(s.destTeam){
    searchParam.destTeams = {
      $in:[s.destTeam]
    }
  }
  const resultMessages = await Message.find(searchParam)
  const group = _.groupBy(resultMessages, m=>{
    return m.parent?'child':'parent'
  })
  const parents = group.parent || []
  const children = group.child || []
  const parentIds = children.map(m=>m.parent)
  parentIds.push(...parents.map(p=>p._id))
  const messages = await Message.getMessageByParentIds(parentIds, obj.all)
  sock.send({
    method:'resultSearchMessages',
    messages
  })
}