'use strict'
module.exports = (server, cl, res, obj)=>{
  const roots = Array.from(server.clients).filter(c=>c.root)
  roots.forEach(r=>{
    r.send({
      method:'receiveLog',
      log:obj.log
    })
  })
}