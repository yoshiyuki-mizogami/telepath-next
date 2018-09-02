import ofs from 'original-fs'
import fs from 'fs'
import {promisify} from 'util'
import {join} from 'path'
import globals from '../globals'
import asar from '../asar'
const mkdirp = promisify(ofs.mkdir)
const readdirp = promisify(ofs.readdir)
const statp = promisify(ofs.stat)
const writeFilep = promisify(ofs.writeFile)
const rmdirp = promisify(ofs.rmdir)
const unlinkp = promisify(ofs.unlink)

export async function deployApp(account, {app,bin}){
  const appdir = join(globals.appsDir, app.name)
  const savePath = join(appdir, app.version + '.app.asar')
  await mkdirp(appdir).catch(()=>{})
  await writeFilep(savePath, bin,'base64')
  if(app.unpack){
    const saveDir = join(appdir, app.version)
    asar.extractAll(savePath, saveDir)
  }
  const jsonPath = join(globals.appsDir, account + globals.appsJson)
  let appsJson
  try{
    appsJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  }catch(e){
    console.log(e)
    appsJson = {}
  }
  const before = appsJson[app.name] || {}
  appsJson[app.name] = Object.assign(before, app)
  await writeFilep(jsonPath, JSON.stringify(appsJson), 'utf8')
  if(!app.icon){
    return
  }
  return new Promise(resolve=>{
    const iconr = fs.createReadStream(join(savePath, app.icon))
    const iconw = fs.createWriteStream(join(appdir,'icon.png'))
    iconr.pipe(iconw).on('finish',resolve)
    eraseOlder(appdir, app.version)
  })

}
export async function removeApp(account, app){
  const appdir = join(globals.appsDir, app.name)
  const jsonPath = join(globals.appsDir, account + globals.appsJson)
  let appsJson
  try{
    appsJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  }catch(e){
    appsJson = {}
  }
  appsJson[app.name] = undefined
  await writeFilep(jsonPath, JSON.stringify(appsJson), 'utf8')
  /* removal when no boot target app because read least once and lock that asar */
  recursiveErace(appdir)
}
async function eraseOlder(dir, latestVersion){
  const allItems = await readdirp(dir)
  const versionReg = /^\d+\.\d+\.\d+(?:\.app\.asar)?$/
  allItems.filter(i=>{
    if(!versionReg.test(i)){
      return false
    }
    return !i.includes(latestVersion)
  }).map(i=>join(dir, i)).forEach(recursiveErace)
}
async function recursiveErace(dir){
  const stat = await statp(dir)
  if(stat.isFile()){
    return unlinkp(dir).catch(console.error)
  }
  const items = await readdirp(dir)
  await items.reduce(async (before, item)=>{
    await before
    const itempath = join(dir, item)
    return await recursiveErace(itempath)
  }, Promise.resolve())
  return rmdirp(dir).catch(console.error)
}