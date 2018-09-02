import {format} from 'util'
import fs from 'fs'
import path from 'path'
import {exec} from 'child_process'
import os from 'os'
import {remote} from 'electron'
import gev from '../g-event'
const LINK_TIMEOUT = 1000 * 60 * 10
const PW = 'telepath'
const SUFFIX = '.msrcincident'
const TLP = 'telepath-ra'
const {protocol} = remote
const RA_URL_TMPL = `<a href="${TLP}:%s">Start assist PW:${PW}</a>`

export default {
  async advertise(){
    const fileContent = await getRAFileContent(PW)
    const argStr = encodeURIComponent(JSON.stringify({
      fileContent,
      at:Date.now()
    }))
    const raUrl = format(RA_URL_TMPL,argStr)
    return raUrl
  },
  bootClient:async param=>{
    return new Promise(resolve=>{
      const tmpfilename = Date.now() + SUFFIX
      const tmpfile = path.join(os.tmpdir(), tmpfilename)
      fs.writeFile(tmpfile, param.fileContent,'utf8',()=>{
        setTimeout(()=>{
          const cmd = `msra.exe /openfile "${tmpfile}"`
          const child = exec(cmd)
          child.on('close', ()=> fs.unlink(tmpfile))
          resolve()
        },1000)
      })
    })
  },
  regist(){
    protocol.unregisterProtocol(TLP)
    protocol.registerHttpProtocol(TLP, ({url})=>{
      const param = JSON.parse(decodeURIComponent(url).replace(TLP + ':', ''))
      if((param.at + LINK_TIMEOUT) < Date.now()){
        return gev.$emit('notify-message', 'Too old link')
      }
      this.bootClient(param)
    })
  }
}
async function getRAFileContent(pw){
  const tmpfilename = Date.now() + SUFFIX
  const tmpfile = path.join(os.tmpdir(), tmpfilename)
  return new Promise((resolve, reject)=>{
    const child = exec(`msra.exe /saveasfile "${tmpfile}" ${pw}`, (er)=>{
      reject(er)
    })
    child.on('close', ()=> fs.unlink(tmpfile))
    const readCheckLoop = ()=>{
      fs.access(tmpfile, 1, (er)=>{
        if(er){
          return setTimeout(readCheckLoop, 500)
        }
        fs.readFile(tmpfile, 'utf8', (er, content)=>{
          resolve(content)
        })
      })
    }
    readCheckLoop()
  })
  
}