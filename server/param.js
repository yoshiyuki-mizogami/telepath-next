const param = {
  protocol:'http',
  server:'ec2-52-14-22-95.us-east-2.compute.amazonaws.com',
  //server:'localhost',//optional
  port:80,//require,
  imgPort:8080,
  mongoServer:'127.0.0.1',//require
  imageServer:'ec2-52-14-22-95.us-east-2.compute.amazonaws.com',//optional
  //localWsServer:'localhost'//optional
}
console.log('test')
const dev = !!process.env.TELEPATH_DEV
if(dev){
  param.server = 
  param.imageServer = 'localhost'
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