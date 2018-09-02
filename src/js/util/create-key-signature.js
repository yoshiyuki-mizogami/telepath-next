export default ev=>{
  const key = []
  if(ev.ctrlKey){
    key.push('ctrl')
  }
  if(ev.altKey){
    key.push('alt')
  }
  if(ev.shiftKey){
    key.push('shift')
  }
  key.push(ev.key)
  return key.join('+').toLocaleLowerCase()
  
}