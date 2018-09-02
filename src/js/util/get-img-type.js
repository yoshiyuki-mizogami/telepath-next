import path from 'path'
const types = {
  '.png':'png',
  '.jpeg':'jpeg',
  '.jpg':'jpeg',
  '.gif':'gif',
  '.webm':'webm',
  '.mp4':'mp4'
}

export default name=>{
  const ext = path.extname(name).toLowerCase()
  return types[ext]
}