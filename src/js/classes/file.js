import fs from 'fs'
import path from 'path'
class File{
  construcotr(id, name){
    this.objectId = id
    this.name = name
  }
  load(){
    return Promise.resolve()
  }
  save(dir){
    this.load()
      .then(content=>{
        return getSaveFilePath(dir, this.name).then(filepath=>{
          return new Promise(res=> fs.writeFile(filepath, content, null, res))
        })
      })
  }
}

function getSaveFilePath(dir, filename, cnt=0){
  if(cnt){
    const ext = path.extname(filename)
    const basename = path.basename(filename, ext)
    filename = `${basename}(${cnt})${ext}`
  }
  const filepath = path.join(dir, filename)
  return new Promise(res=>{
    fs.exists(filepath, exists=>{
      if(!exists){
        return res(filepath)
      }
      return getSaveFilePath(dir, filename, cnt+1)
    })
  })
}
export default File
