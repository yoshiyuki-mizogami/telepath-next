'use strict'
const App = require('../app')
module.exports = async (server, cl, res, obj)=>{
  const app = await App.findOne({_id:obj.appId})
    .populate({
      path:'author',
      select:'_id name account'
    })
  if(app.author._id.toString() !== cl.userId){
    return cl.send({
      method:'receiveNotify',
      level:'warn',
      message:{
        ja:'あなたのアプリでは有りません',
        en:'Not your App.'
      }
    })
  }
  await app.unregist()
  return cl.send({
    method:'receiveNotify',
    level:'warn',
    message:{
      ja:'削除されました',
      en:'Unregist complete.'
    }
  })
}