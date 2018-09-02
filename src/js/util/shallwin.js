import {format} from 'util'
import {spawn,exec} from 'child_process'
import {remote} from 'electron'
import gev from '../g-event'
const LINK_TIMEOUT = 1000 * 60 * 60 * 2
const {protocol} = remote
const SHALLWIN_URL_TMPL = '<a href="shallwin:%s">Start Shallwin</a>'
const shallWinRegPath = 'Software\\mizogami\\shallwin'

export default {
  advertise:async ({name,iconUrl})=>{
    const shallWinExecPath = await getShallWinExecPath()
    const argStr = encodeURIComponent(JSON.stringify({
      type:'host',
      yourName:name,
      iconUrl
    }))
    await killExist()
    return new Promise((resolve, reject)=>{
      const child = spawn(shallWinExecPath, ['direct', argStr])
      child.on('error', reject)
      child.on('close', reject)
      child.stdout.setEncoding('utf8')
      child.stdout.on('data', _d=>{
        const d = _d.trim()
        if(!d){
          return
        }
        if(!d.startsWith('%')){
          return
        }
        const shallWinUrl = format(SHALLWIN_URL_TMPL,d) 
        resolve(shallWinUrl)
      })
    })
  },
  bootClient:async param=>{
    await killExist()
    const shallWinExecPath = await getShallWinExecPath()
    const arg = decodeURIComponent(JSON.stringify(param))
    spawn(shallWinExecPath,['direct', arg])
  },
  register:clbk=>{
    protocol.unregisterProtocol('shallwin')
    protocol.registerHttpProtocol('shallwin', ({url})=>{
      const param = JSON.parse(decodeURIComponent(url).replace('shallwin:', ''))
      if((param.at + LINK_TIMEOUT) < new Date().getTime()){
        return gev.$emit('notify-message', 'Too old link')
      }
      clbk(param)
    })
  }
}
const cmd = `reg query HKCU\\${shallWinRegPath} /v ExecPath`
function getShallWinExecPath(){
  return new Promise(resolve=>{
    exec(cmd, {
      encoding:'utf8'
    },(er, _out)=>{
      if(er){
        return resolve()
      }
      const out = _out.trim()
      const lastLine = out.split('\n').pop().replace(/.*ExecPath\s+REG_SZ\s+/, '')
      return resolve(lastLine)
    })
  })
}
function killExist(){
  return new Promise(resolve=>{
    exec('taskkill /f /im shallwin.exe',resolve)
  })
}