'use strict'
const path  = require('path')
const fs = require('fs')
const User = require('../user')
const destDir = path.join(__dirname,'../root/icons/')
const saveIcon = (_id, iconUrl)=>{
  const savePath = path.join(destDir, _id.toString()+ '.png')
  const base64 = iconUrl.replace(/.+?,/, '')
  return new Promise((resolve, reject)=>{
    fs.writeFile(savePath, new Buffer(base64, 'base64'),er=>{
      if(er){
        return reject(er)
      }
      return resolve()
    })
  })
}
module.exports = (server,cl, res, obj)=>{
  const {iconUrl} = obj
  return User.findOne({_id:obj.userId})
    .then(u=>{
      return saveIcon(u._id, iconUrl)
    }).then(()=>{
      User.updateGlobalIconCache()
      cl.send({
        method:'settedIcon'
      })
    }).catch(e=>{
      console.error(e)
      return cl.send({
        method:'iconSaveFailed'
      })
    })
}