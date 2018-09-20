'use strict'
const {join, basename} = require('path')
const methodDir = join(__dirname, 'methods')
const {readdir} = require('fs').promises
const User = require('./user')
const url = require('url')
const logined = require('./actions/logined')
const SSE = require('sse')
const SSEClient = require('sse/lib/sseclient')
SSEClient.prototype._send = SSEClient.prototype.send
SSEClient.prototype.send = function(d){
  const str = JSON.stringify(d)
  this._send(str)
}
const http = require('http')
const {ServerResponse} = http
ServerResponse.prototype._end = ServerResponse.prototype.end
ServerResponse.prototype.end = function(obj){
  this._end(JSON.stringify(obj))
}

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
    methods.filter(f=>{
      return f.endsWith('.js')
    }).forEach(m=>{
      const tgpath = join(methodDir, m)
      const methodName = '/' + basename(tgpath, '.js')
      this.methods[methodName] = require(tgpath)
    })
  }
  async start(port){
    await this.setMethod()
    this.keepTimer()
    const server = http.createServer(async (req, res)=>{
      const parsed = url.parse(req.url)
      const {
        pathname:urlPath,
        query
       } = parsed
      const method = this.methods[urlPath]
      if(!method){
        console.log('unknown request', urlPath)
        res.writeHead(200, DEFAULT_HEADER)
        res.end('unknown header')
        return
      }
      if(!query){
        res.writeHead(200,{'Content-Type':'text/html'})
        method(this, null, res)
        if(!res.finished){
          res.end('')
        }
        return
      }
      const json = JSON.parse(decodeURIComponent(query))
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
        res.writeHead(200, DEFAULT_HEADER)
        res.end('')
      }
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
