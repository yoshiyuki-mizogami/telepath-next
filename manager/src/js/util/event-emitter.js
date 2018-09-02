class EventEmitter{
  constructor(){
    this.events = {}
  }
  on(eventName,clbk){
    (this.events[eventName]) || (this.events[eventName] = [])
    this.events[eventName].push(clbk)
  }
  emit(eventName, ...args){
    let hooks = this.events[eventName]
    if(!hooks){
      return
    }
    hooks.forEach(hook=>hook(...args))
  }
}
export default EventEmitter