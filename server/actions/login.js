const semver = require('semver')
const User = require('../user')
const Etc = require('../etc')
let currentVersion = '1.0.0'
Etc.set().then(()=>{
  currentVersion = Etc.get().version || currentVersion
})
const logined = require('./logined.js')

module.exports = async function login(server, res, obj){
  queueManager.queue(async ()=>{
    const u = await User.findOne({
      account:obj.account,
      pwd:obj.pwd
    }).select('_id name account lastLogin nickname tel mail depart pwd message teamOrder iconCache')
    console.log('user', u)
    if(!u){
      return res.send({method:'loginFailed'})
    }
    res.logined = true
    res.userId = u._id.toString()
    /*for first login*/
    if(!u.lastLogin){
      return res.send({
        method:'requireNewPassword'
      })
    }
    if(obj.version && semver.lt(obj.version, currentVersion)){
      //getTelepath(server, res)
    }
    res.idle = false
    await logined(res, u, obj.nomessage)
    u.lastLogin = new Date()
    if(obj.version !== '100.0.0'){
      u.version = obj.version
    }
    return u.save()
  })
}

const queueManager = (()=>{
  const queue = []
  const LIMIT = 100
  let current = 0
  return {
    async call(){
      if(LIMIT < current){
        return
      }
      const target = queue.shift()
      console.log('target fnc', target)
      if(!target){
        return
      }
      current++
      try{
        await target()
      }catch(e){
        console.error(e)
      }
      current--
      this.call()
    },
    queue(clbk){
      queue.push(clbk)
      this.call()
    }
  }
})()