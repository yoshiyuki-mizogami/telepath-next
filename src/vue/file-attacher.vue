<style lang="stylus">
  .file-attacher
    margin auto
    background-color var(--f-bg)
    font-size 13px
    width 350px
    padding 2px
    border-radius 2px
    .attachies
      background-color var(--f-bg)
      color var(--f-color)
      height 100%
      .attach
        border-bottom solid 1px rgb(233,233,233)
        height 20px
        overflow hidden
      .attach-enter-active,.attach-leave-active
        transition height .3s ease
      .attach-enter, .attach-leave-to
        height 0
      .att-icon
        width 20px
        height 20px
        margin-right 5px
        vertical-align top
      .att-name
        display inline-block
        width 80%
        height 100%
        white-space nowrap
        overflow hidden
        text-overflow ellipsis
      .att-remove
        float right
        font-size 12px
        height 100%
        width 22px
</style>
<template>
  <div class="file-attacher" v-show="show">
    <div class="attachies">
      <transition-group name="attach">
        <div class="attach" v-for="a in attachies" :key="a.path">
          <img class="att-icon" :src="a.icon"><span :title="a.name" class="att-name">{{ a.name }}</span>
          <button class="att-remove" @click="removeAttach(a)">X</button>
        </div>
      </transition-group>
    </div>
  </div>
</template>
<script>
import gev from '../js/g-event'
import {remote, ipcRenderer} from 'electron'
import pfs from '../js/util/ofs-promise'
import {basename} from 'path'
const PROTECTED_PREFIX = '0M8R4KGxGuEAAAAAAAAAAAAAAAA='
const ATTACH_LIMIT = 5
const ATTACH_SIZE_LIMIT = 1024 * 1024 * 15
class AttachFlile{
  constructor(filepath){
    this.path = filepath
    this.name = basename(filepath)
    this.size = 0
    this.icon = ''
    this.isProtected = false
    this.temped = false
  }
  getStat(){
    return new Promise(resolve=>{
      remote.app.getFileIcon(this.path, {size:'small'}, async (er, icon)=>{
        this.icon = icon.toDataURL()
        const stat = await pfs.stat(this.path)
        this.size = stat.size
        this.isFile = stat.isFile()
        resolve(this)
      })
    })
  }
  async checkProtected(){
    const fd = await pfs.open(this.path, 'r')
    const buf = new Buffer(20)
    const {buffer} = await pfs.read(fd, buf, 0, 20, 0)
    await pfs.close(fd)
    const first = buffer.toString('base64')
    this.isProtected = first === PROTECTED_PREFIX
  }
  async unprotect(n){
    if(!this.isProtected){
      return
    }
    const srcPath = this.path
    return new Promise(resolve=>{
      const responseEventName = `file-unprotected-${n}`
      ipcRenderer.send('unprotect-fileshell', srcPath,responseEventName)
      ipcRenderer.once(responseEventName, (ev,tmpPath)=>{
        this.path = tmpPath
        this.temped = true
        return resolve()
      })
    })
  }
  clearTmp(){
    console.log(this.path)
    if(!this.temped){
      return
    }
    pfs.unlink(this.path)
  }
  async getBin(n){
    await this.unprotect(n)
    return pfs.readFile(this.path, null)
  }
  async toSendObject(n){
    const buf = await this.getBin(n)
    this.clearTmp()
    return {
      name:this.name,
      icon:this.icon,
      content:buf.toString('base64')
    }
  }
}
export default {
  data(){
    return {
      attachTarget:'',
      attachies:[]
    }
  },
  created(){
    this.$on('receive-files', this.receiveFiles)
  },
  computed:{
    show(){
      return !!this.attachies.length
    },
    ui(){
      return this.$store.state.ui
    }
  },
  methods:{
    receiveFiles(files){
      return Promise.all(
        Array.from(files).map(f=>new AttachFlile(f.path).getStat())
      ).then(files=>{
        const paths = this.attachies.map(a=>a.path)
        let currentSize = sumBy(this.attachies, 'size')
        files.filter(f=>f.isFile).forEach(f=>{
          if(paths.includes(f.path)){
            return
          }
          const willSize = currentSize + f.size
          if(ATTACH_SIZE_LIMIT < willSize){
            return gev.$emit('notify-message', this.ui.ATTACH_SIZE_LIMIT)
          }
          if(ATTACH_LIMIT <= this.attachies.length){
            return gev.$emit('notify-message', this.ui.ATTACH_FILE_LIMIT)
          }
          this.attachies.push(f)
          f.checkProtected()
          currentSize = willSize
        })
      })
    },
    removeAttach(a){
      const i = this.attachies.indexOf(a)
      this.attachies.splice(i,1)
    },
    async getFiles(){
      const files = await Promise.all(
        this.attachies.map((a, i)=>a.toSendObject(i))
      )
      this.clear()
      return files
    },
    clear(){
      this.attachies = []
    },

  }
}
function sumBy(array, name){
  return array.reduce((b,a)=>{
    return b + a[name]
  },0)
}
</script>


