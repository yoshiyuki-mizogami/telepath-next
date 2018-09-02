'use strict'
let {format} = require('util')
let scriptTemplate = "setTimeout(()=>store.dispatch('update'), %s)"
/**
 * 
 * @param {WebSocket} sock 
 * @param {number} delay 
 */
function updateClient(sock, delay){
  sock.send({
    method:'execScript',
    script:format(scriptTemplate, delay)
  })
}
module.exports = updateClient