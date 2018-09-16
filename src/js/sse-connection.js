import {EventEmitter} from 'events'
const RETRY_INTERVAL = 10000

class Connection extends EventEmitter{
  contructor(){
    this.url = 
    this.port = ''
    this.sse = null
    this.connected = false
    this.fnc = null
    this.retryEvent = null
  }
  setConfig(config){
    this.url = config.url
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
    const sse = new EventSource(`${this.url}/sse`,{
      withCredentials:true
    })
    this.sse = sse
    const me = this
    sse.addEventListener('message', function onMessage(ev){
      const {data} = ev
      if(!data.length){
        return
      }
      const dataObj = JSON.parse(data)
      me.fnc(dataObj)
    })
    sse.addEventListener('close',()=>{
      this.emit('close')
      this.connected = false
      setTimeout(this.retryConnect.bind(this), RETRY_INTERVAL + Math.ceil(Math.random() * 15 * 1000))
    })
    return new Promise((res, reject)=>{
      sse.addEventListener('open', ()=>{
        clearTimeout(this.retryEvent)
        this.connected = true
        this.emit('open')
        res()
      })
      sse.addEventListener('error',()=>{
        this.connected = false
        sse.close()
        this.emit('close')
        reject()
      })
    })
  }
  send(m){
    if(!this.connected){
      return
    }
    this.sse.send(JSON.stringify(m))
  }
}

export default Connection