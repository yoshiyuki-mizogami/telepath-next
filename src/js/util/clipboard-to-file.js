import {clipboard, remote} from 'electron'
import path from 'path'
import fs from 'fs'
const {app} = remote
const CLIP_FILENAME = 'clipboard-image-%s.png'
export default ()=>{
  const hasText = clipboard.availableFormats().includes('text/plain')
  if(hasText){
    return Promise.resolve(false)
  }
  const hasImage = clipboard.availableFormats().includes('image/png')
  if(!hasImage){
    return Promise.resolve(false)
  }
  const img = clipboard.readImage().toPNG()
  const tmpStr = ('' + new Date().getTime()).slice(-10)
  const tmpfile = path.join(app.getPath('temp'), CLIP_FILENAME.replace('%s', tmpStr))
  return new Promise((resolve, reject)=>{
    fs.writeFile(tmpfile, img, er=>{
      if(er){
        return reject(er)
      }
      resolve(tmpfile)
    })
  })
}