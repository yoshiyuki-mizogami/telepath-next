import el from 'electron'
import {join} from 'path'
import fs from 'fs'
import param from '../../server/param.js'
const {remote} = el
const rootdir = remote.getGlobal('rootdir')
const connectLocal =remote.getGlobal('connectLocal')
const resourceDir =join(rootdir, 'res')
const binDir = join(rootdir, 'bin')
const specialEffect = remote.getGlobal('specialEffect')
const {nativeImage} = remote
const imgDir = join(rootdir, 'img')
const HELP_PAGE = 'http://help-page'
const SERVER = connectLocal ? param.localServer : param.server
const PORT = param.port
const IMAGE_SERVER = param.imageServer
// const WS_SERVER = 'localhost' // dev
const overlays = ['1','2','3','4','5','6','7','8','9','9over'].reduce((b, i)=>{
  b[i] = nativeImage.createFromPath(join(imgDir, `${i}._png`))
  return b
},{})

const userDir = remote.app.getPath('userData')
const defaultSaveDir = join(userDir, 'download')
const appsDir = join(userDir, 'apps')
const appsJson = '.apps.json'
fs.mkdir(appsDir, ()=>{/*noop*/})
fs.mkdir(defaultSaveDir, ()=>{/*noop*/})
export default {
  iconSize:64,
  version:remote.app.getVersion(),
  rootdir,
  binDir,
  specialEffect,
  imgDir,
  appsDir,
  appsJson,
  resourceDir,
  defaultSaveDir,
  getOverlay(v){
    if(!v){
      return null
    }
    if(9 < v){
      return overlays['9over']
    }
    return overlays[v]
  },
  SERVER,
  PORT,
  IMAGE_SERVER,
  /* sort order thread/comment D:decend A:ascend*/
  SORT_ORDER:{
    DD:0,
    DA:1,
    AD:2,
    AA:3,
    TA:2,
    MA:1
  },
  HELP_PAGE
}