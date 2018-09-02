'use strict'
const Message = require('../message')
module.exports = async (wss, sock, obj)=>{
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
  sock.send({
    method:'gotMessageDetail',
    message
  })
}