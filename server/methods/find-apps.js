'use strict'
const App = require('../app')
const User = require('../user')
module.exports = async (server, cl,res, obj)=>{
  if(!obj.search){
    cl.send({
      method:'foundApps',
      apps:[]
    })
    return
  }
  const searchReg = new RegExp(obj.search)
  const users = await User.find({
    name:searchReg
  }, {_id:true})
  const userIds = users.map(u=>u._id)
  const apps = await App.find({$or:[
    {name:searchReg},
    {caption:searchReg},
    {description:searchReg},
    {author:{$in:userIds}}
  ]}).populate({
    path:'author',
    select:'_id name account'
  })
  cl.send({
    method:'foundApps',
    apps
  })
}