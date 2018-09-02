import EventEmitter from 'events'
const RETRY_INTERVAL = 10000

class Connection extends EventEmitter{
  contructor(){
    this.url = ''
    this.ws = null
    this.connected = false
    this.fnc = null
    this.retryEvent = null
  }
  setConfig(config){
    this.url = config.url
    this.port = config.port
  }
  setMethods(fnc){
    this.fnc = fnc
  }
  async retryConnect(){
    try{
      await this.connect()
      if(!this.connected){
        console.log('retry connect')
        throw new Error('retry connection')
      }
    }catch(e){
      /*ignore*/
    }
  }
  connect(){
    this.ws = new WebSocket(`${this.url}:${this.port}`)
    const ws = this.ws
    const me = this
    ws.addEventListener('message', function onMessage({data}){
      me.fnc(JSON.parse(data))
    })
    ws.addEventListener('close',()=>{
      this.emit('close')
      this.connected = false
      setTimeout(this.retryConnect.bind(this), RETRY_INTERVAL + Math.ceil(Math.random() * 15 * 1000))
    })
    return new Promise((res, reject)=>{
      ws.addEventListener('open', ()=>{
        clearTimeout(this.retryEvent)
        this.connected = true
        this.emit('open')
        res()
      })
      ws.addEventListener('error',()=>{
        ws.close()
        reject()
      })
    })
  }
  send(m){
    if(!this.connected){
      return
    }
    this.ws.send(JSON.stringify(m))
  }
}

export default new Connection()