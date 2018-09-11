const param = {
  server:'ec2-52-14-22-95.us-east-2.compute.amazonaws.com',
  //server:'localhost',//optional
  port:443,//require,
  imgPort:8080,
  //mongoServer:'127.0.0.1',//require
  //imageServer:'192.168.11.3',//optional
  //localWsServer:'localhost'//optional
}

/* optional setting overwrite base server address if not provide */
if(!param.server){
  throw new Error('server parameter not set. Require it')
}
if(!param.mongoServer){
  param.mongoServer = param.server
}
if(!param.imageServer){
  param.imageServer = param.mongoServer
}
if(!param.localServer){
  param.localServer = param.server
}

module.exports = param