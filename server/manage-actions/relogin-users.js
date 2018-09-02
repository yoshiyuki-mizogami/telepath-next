'use strict'
const logined = require('../actions/logined.js')
module.exports = (wss, users)=>{
  const usersIdMap = users.reduce((base, current)=>{
    base[current._id.toString()] = current
    return base
  },{})
  Array.from(wss.clients).forEach(c=>{
    const u = usersIdMap[c.userId]
    if(!u){
      return
    }
    logined(c, u)
  })
}