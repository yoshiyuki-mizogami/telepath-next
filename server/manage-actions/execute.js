'use strict'
module.exports = async (wss, sock, obj)=>{
  const {userId} = obj
  const targets = Array.from(wss.clients).filter(c=>!c.root && c.userId === userId)
  if(!targets.length){
    return sock.send({
      method:'caughtMessage',
      message:'Target user not connected now.'
    })
  }
  targets.forEach(target=>{
    target.send({
      method:'execScript',
      script:obj.script
    })
  })
}