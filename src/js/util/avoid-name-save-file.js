import path from 'path'
import pfs from './ofs-promise'
const avoidNameSaveFile = (dir, name, content, n = 0)=>{
  let tryPath
  const ext = path.extname(name)
  const withoutExt = path.basename(name, ext)
  if(!n){
    tryPath = path.join(dir, name, )
  }else{
    tryPath = path.join(dir, `${withoutExt}(${n})${ext}`)
  }
  return pfs.access(tryPath)
    .then(()=>avoidNameSaveFile(dir, name, content, n+1))
    .catch(()=>{
      //when not exists that path
      return pfs.writeFile(tryPath, content, 'base64')
        .then(()=>tryPath)
    })
}

export default avoidNameSaveFile