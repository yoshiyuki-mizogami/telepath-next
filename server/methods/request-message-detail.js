'use strict'
const Message = require('../message')
module.exports = async (server,cl, res, obj)=>{
  const message = await Message.findById(obj.id)
    .populate([{
      path:'reads',
      populate:{
        path:'reader',
        select:'name nickname iconCache'
      },
      match:{reader:{$exists:true}},
      options:{sort:{readAt:-1}}
    },{
      path:'sender priority'
    }])
  cl.send({
    method:'gotMessageDetail',
    message
  })
}