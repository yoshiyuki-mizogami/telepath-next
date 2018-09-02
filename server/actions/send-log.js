'use strict'
module.exports = (wss, sock, obj)=>{
  const roots = Array.from(wss.clients).filter(c=>c.root)
  roots.forEach(r=>{
    r.send({
      method:'receiveLog',
      log:obj.log
    })
  })
}