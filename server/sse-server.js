'use strict'
const {join, basename} = require('path')
const methodDir = join(__dirname, 'methods')
const {readdir} = require('fs').promises
const User = require('./user')
const logined = require('./actions/logined')
const SSE = require('sse')
const SSEClient = require('sse/lib/sseclient')
SSEClient.prototype._send = SSEClient.prototype.send
SSEClient.prototype.send = function(d){
  const str = JSON.stringify(d)
  this._send(str)
}
const http = require('http')
const https = require('https')
const {ServerResponse} = http
ServerResponse.prototype._end = ServerResponse.prototype.end
ServerResponse.prototype.end = function(obj){
  this._end(JSON.stringify(obj))
}

const {readFile} = require('fs').promises
const path = require('path')
const UTF8 = 'utf8'
const DEFAULT_HEADER = {'Content-Type':'text/plain'}
const KEEPINTERVAL = 30 * 1000 // 30 seconds
const events = require('events')
class SSEServer extends events{
  constructor(){
    super()
    this.clients = new Set()
    this.methods = {}
  }
  keepTimer(){
    setTimeout(()=>{
      this.keep()
      this.keepTimer()
    },KEEPINTERVAL)
  }
  keep(){
    this.clients.forEach(c=>{
      c._send('')
    })
  }
  async setMethod(){
    const methods = await readdir(methodDir)
    methods.forEach(m=>{
      const tgpath = join(methodDir, m)
      const methodName = '/' + basename(tgpath, '.js')
      this.methods[methodName] = require(tgpath)
    })
  }
  async start(port){
    await this.setMethod()
    this.keepTimer()
    const pfx = await readFile(path.join(__dirname, 'crt', 'mine.pfx'))
    const server = https.createServer({
      pfx,
      passphrase:'export'
    }, (req, res)=>{
      const urlPath = req.url
      const method = this.methods[urlPath]
      if(!method){
        console.log('unknown request', urlPath)
        res.setHeader('Content-Type', DEFAULT_HEADER)
        res.end('unknown header')
        return
      }
      req.setEncoding(UTF8)
      const result = []
      req.on('data', d=> result.push(d))
      req.on('end', async ()=>{
        const json = JSON.parse(result.join(''))
        const {userId} = json
        let tgClient
        for(const c of this.clients){
          if(c.userId === userId){
            tgClient = c
            break
          }
        }
        await method(this, tgClient, res, json)
        if(!res.finished){
          res._end('')
        }
      })
    }).listen(port, ()=>{
      const sse = new SSE(server)
      this.sse = sse
      sse.on('connection', async cl=>{
        const cookie = cl.req.headers['cookie'] || ''
        const user = await User.auth(cookie)
        if(!user){
          //illegal logic
          cl.close()
          return
        }
        cl.userId = user._id.toString()
        this.clients.add(cl)
        cl.req.on('close', ()=>{
          this.clients.delete(cl)
        })
        logined(cl, user)
      })
    })
  }
}

module.exports = new SSEServer()
