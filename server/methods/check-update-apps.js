'use strict'
const App = require('../app')
const INTERVAL = 5000
let cursorTime = Date.now()
module.exports = async (server, cl, res, obj)=>{
  const condition = obj.apps.map(a=>{
    return {
      _id:a._id,
      version:{$ne:a.version}
    }
  })
  const apps = await App.find({$or:condition})
    .populate({
      path:'author',
      select:'_id name'
    })
  const now = Date.now()
  const timer = cursorTime + INTERVAL
  cursorTime = Math.max(now, timer)
  const delay = Math.max(0, timer - now)
  setTimeout(()=>{
    apps.reduce(async (before, app)=>{
      await before
      const bin = await app.fetchBin()
      cl.send({
        method:'gotApp',
        app,
        bin
      })
    }, Promise.resolve())  
  },delay)
}