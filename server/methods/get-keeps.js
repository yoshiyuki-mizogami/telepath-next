'use strict'
const User = require('../user')
module.exports = async (_,cl)=>{
  const target = await User.findById(cl.userId)
  /*same user other connection ignore*/
  await target.save()
  cl.send({
    method:'gotKeeps',
    keeps:target.keeps
  })
}