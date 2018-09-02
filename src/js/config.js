import globals from './globals'
const get = ()=>{
  const def = {
    lang:'ja',
    fontSize:13,
    theme:'basic',
    preventScroll:false,
    unselectAfterSend:false,
    sortOrder:'d-d',
    downloadDir:globals.defaultSaveDir,
    aggregateDests:true
  }
  const save = JSON.parse(localStorage.getItem('config') || '{}')
  Object.assign(def, save)
  return Promise.resolve(def)
}

const set = (conf)=>{
  localStorage.setItem('config', JSON.stringify(conf))
  return Promise.resolve()
}

export default {
  get,
  set
}