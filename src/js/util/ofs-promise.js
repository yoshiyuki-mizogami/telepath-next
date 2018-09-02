import fs from 'original-fs'
import {promisify} from 'util'
const pfs = {
  open:promisify(fs.open),
  read:promisify(fs.read),
  close:promisify(fs.close),
  readFile:promisify(fs.readFile),
  writeFile:promisify(fs.writeFile),
  access:promisify(fs.access),
  stat:promisify(fs.stat),
  readdir:promisify(fs.readdir),
  unlink:promisify(fs.unlink),
  rmdir:promisify(fs.rmdir),
  mkdir:promisify(fs.mkdir)
}
export default pfs