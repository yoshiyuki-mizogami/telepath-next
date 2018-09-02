'use strict'
const User = require('../user')
module.exports = async (_, sock)=>{
  const target = await User.findById(sock.userId)
  /*same user other connection ignore*/
  await target.save()
  sock.send({
    method:'gotKeeps',
    keeps:target.keeps
  })
}