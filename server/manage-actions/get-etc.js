const Etc = require('../etc')
module.exports = function getEtc(wss, sock){
  Etc.set().then(()=>{
    const etc = Etc.get()
    sock.send({
      method:'gotEtc',
      etc
    })
  })
}
