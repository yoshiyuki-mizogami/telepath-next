'use strict'
const WebSocket = require('ws')
const fs = require('fs')
const path = require('path')
function toS(o){
  return JSON.stringify(o)
}
WebSocket.prototype._send = WebSocket.prototype.send
WebSocket.prototype.send = function(o){
  this._send(toS(o), e=>{e && console.error(e)})
}
const noop = ()=>{}
module.exports = (port, messageAction)=>{
  const pfx = fs.readFileSync(path.join(__dirname, 'crt', 'mine.pfx'))
  const server = require('https').createServer({
    pfx,
    passphrase:'export'
  }, ()=>{
    console.log('http server req')
    /*ignore*/
  }).listen(port)
  console.log('boot ws server on port:', port)
  const wss = new WebSocket.Server({
    permessageDeflate:false,
    server
  })
  wss.on('connection',function connection(sock){
    sock.on('error', noop)// ws 3.3.3 emit when close connection from browser
    sock.on('message', function incomming(message){
      const json = JSON.parse(message)
      messageAction(wss, sock, json)
    })
  })
  return wss
}