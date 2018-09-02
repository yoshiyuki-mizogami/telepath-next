const param = {
  wsServer:'192.168.11.3',//optional
  wsPort:10084,//require,
  //mongoServer:'127.0.0.1',//require
  //imageServer:'192.168.11.3',//optional
  //localWsServer:'localhost'//optional
}

/* optional setting overwrite base server address if not provide */
if(!param.wsServer){
  throw new Error('wsServer parameter not set. Require it')
}
if(!param.mongoServer){
  param.mongoServer = param.wsServer
}
if(!param.imageServer){
  param.imageServer = param.mongoServer
}
if(!param.localWsServer){
  param.localWsServer = param.wsServer
}

module.exports = param