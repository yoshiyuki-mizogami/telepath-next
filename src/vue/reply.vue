<style lang="stylus">
formHeight = 143px
.reply-form
  box-shadow 2px 2px 2px 2px rgba(0,0,0,0.5)
  border-radius 5px
  background-color var(--s-bg);
  position fixed
  top 0
  left 0
  width 400px
  overflow hidden
  min-height formHeight
  .grab
    height 15px
    cursor move
  .reply-content
    padding 0px 4px
    height 100px
    width 100%
  .reply-mess
    width 100%
    height 100%
    border-radius 5px
    padding 5px
    margin 0
  .reply-btns
    text-align center
  .file-att-wrap>div
    margin auto

.reply-enter-active, .reply-leave-active
  transition all .3s ease
  opacity 1
.reply-enter, .reply-leave-to
  opacity 0

</style>
<template>
  <transition name="reply">
    <div ref="form" class="reply-form" v-show="showReplyForm" :style="{top:y + 'px',left:x + 'px'}">
      <div class="grab bar" @selectstart.prevent
           @mousedown="getHandle"/>
      <div class="reply-content">
        <textarea maxlength="2500" class="reply-mess" ref="input"
                  @wheel.prevent="$parent.scrollHandle"
                  @contextmenu.stop="popupReplyMenu"
                  @keydown.ctrl.86="checkClipboardImg"
                  @keydown.enter.shift.prevent="sendReplyMessage" v-model="m.messageContent"/>
      </div>
      <div class="reply-btns">
        <input type="button" :value="ui.SEND + '(Shift+Enter)'" @click="sendReplyMessage">
        <input type="button" :value="ui.CANCEL" @click="cancel">
      </div>
      <file-attacher ref="fileAttacher"/>
    </div>
  </transition>
</template>

<script>
import gev from '../js/g-event'
import {mapState} from 'vuex'
import messageParser from '../js/util/message-parser'
import clipboardToFile from '../js/util/clipboard-to-file'
import setSnippet from '../js/util/set-snippet'
import shallwin from '../js/util/shallwin.js'
import ra from '../js/util/ra.js'
import escapeHTML from '../js/util/escape-html'
import globals from '../js/globals'
import path from 'path'
import {remote} from 'electron'

const FORM_HEIGHT = 150, APP_TOP = 20
const APP_HEIGHT = document.documentElement.clientHeight
const BOTTOM_LIMIT = APP_HEIGHT - FORM_HEIGHT
const {Menu} = remote
const messageBase = {
  parent:'',
  messageContent:'',
  type:'text'
}
class Point{
  constructor(x, y){
    this.x = x
    this.y = y
  }
}
let parentEl
export default {
  data(){
    return {
      x:0,
      y:0,
      m:Object.assign({},messageBase),
      handle:false
    }
  },
  created(){
    gev.$on('show-reply-form', this.showMe)
    gev.$on('redraw-cursor', this.drawCursor)
    this.$on('drop-file', this.receiveFile)
  },
  computed:mapState({
    ui:'ui',
    loginedInfo:'loginedInfo',
    ws:'ws',
    showReplyForm:'showReplyForm'
  }),
  watch:{
    showReplyForm(v){
      if(v){
        return gev.addLayer(this)
      }
      gev.removeLayer()
    }
  },
  methods:{
    clearReply(){
      this.$store.commit('setShowReplyForm' ,false)
      parentEl = null
      this.$refs.fileAttacher.clear()
      gev.$emit('clear-cursor')
    },
    async checkClipboardImg(){
      const ret = await clipboardToFile()
      if(!ret){
        return
      }
      this.$refs.fileAttacher.$emit('receive-files', [{path:ret}])
    },
    showMe({x,y, parent, parentEl:_parentEl}){
      this.reset()
      this.x = x
      this.y = Math.min(Math.max(y, APP_TOP), BOTTOM_LIMIT)
      this.m.parent = parent
      this.$store.commit('setShowReplyForm' ,true)
      this.$nextTick(()=>{
        this.$refs.input.focus()
      })
      parentEl = _parentEl
      this.drawCursor()
    },
    drawCursor(){
      if(!parentEl){
        return
      }
      const parentRect = parentEl.getBoundingClientRect()
      /*child message folded*/
      if(parentRect.left === 0){
        return this.clearReply()
      }
      gev.$emit('draw-cursor',[
        (parentRect.left + parentRect.right) / 2,
        parentRect.bottom,
        this.x,
        this.y
      ])
    },
    setMove(){
      document.documentElement.addEventListener('mousemove', this.move)
      document.documentElement.addEventListener('mouseup', this.releaseHandle)
      
    },
    receiveFile(ev){
      const files = ev.dataTransfer.files
      if(!files.length){
        return
      }
      this.$refs.fileAttacher.$emit('receive-files', files)
    },
    reset(){
      Object.assign(this.m, messageBase)
    },
    sendReplyMessage({messageFormat}){
      const overwriteMessageType = messageFormat
      const content = this.m.messageContent.trim()
      if(!content){
        gev.$emit('notify-message', this.ui.REQUIRE_MESSAGE)
        return
      }
      const messageContent = messageParser(content)
      this.m.messageContent = ''
      this.$store.commit('setSending')
      this.$refs.fileAttacher.getFiles()
        .then(files=>{
          const message = {
            method:'sendMessage',
            message:{
              type:overwriteMessageType || messageContent.type,
              parent:this.m.parent,
              content:messageContent.content,
              sender:this.loginedInfo._id,
              senderName:this.loginedInfo.name,
              files
            }
          }
          this.ws.send(message)
        })
      this.clearReply()
    },
    cancel(){
      this.clearReply()
    },
    getHandle(ev){
      this.handle = new Point(ev.clientX, ev.clientY)
      this.setMove()
    },
    releaseHandle(){
      document.documentElement.removeEventListener('mouseup', this.releaseHandle)
      this.handle = null
    },
    move(ev){
      if(!this.handle){
        return
      }
      const x = this.x - (this.handle.x - ev.clientX)
      const y = this.y - (this.handle.y - ev.clientY)
      const rect = this.$refs.form.getBoundingClientRect()
      const de =  document.documentElement
      const dw = de.clientWidth
      const dh = de.clientHeight
      const xOffset = ev.clientX - this.handle.x
      const yOffset = ev.clientY - this.handle.y
      if(0 < xOffset && rect.right + xOffset < dw){//move right
        this.x = x
      }else if(xOffset < 0 && 0 < (rect.left + xOffset)){//move left
        this.x = x
      }
      if(yOffset < 0 && APP_TOP < rect.top + yOffset){
        this.y = y
      }else if(0 < yOffset && rect.bottom + yOffset < dh){
        this.y = y
      }
      this.handle.x = ev.clientX
      this.handle.y = ev.clientY
      this.drawCursor()
    },
    addSnippet(snippet){
      const el = this.$refs.input
      this.m.messageContent = setSnippet(el, snippet)
    },
    setBootShallWin(){
      this.$store.commit('bootOther', true)
      shallwin.advertise(this.loginedInfo)
        .then(ret=>{
          this.m.messageContent = 
            escapeHTML(this.m.messageContent) + '\n' + ret
          return this.sendReplyMessage({messageFormat:'html'})
        }).catch((er)=>{
          console.error(er)
        }).then(()=>{
          this.$store.commit('bootOther', false)
        })
    },
    sendRemoteAssistance(){
      this.$store.commit('bootOther', true)
      ra.advertise()
        .then(ret=>{
          this.m.messageContent = 
            escapeHTML(this.m.messageContent) + '\n' + ret
          return this.sendReplyMessage({messageFormat:'html'})
        }).catch((er)=>{
          console.error(er)
        }).then(()=>{
          this.$store.commit('bootOther', false)
        })
    },
    popupReplyMenu(){
      Menu.buildFromTemplate([
        {
          label:this.ui.INSERT_CODE,
          icon:path.join(globals.imgDir, 'insert-code._png'),
          submenu:[
            {
              label:'Javascript',
              click:()=>this.addSnippet('```js\n\n```')
            },
            {
              label:'VBA',
              click:()=>this.addSnippet('```vba\n\n```')
            },
            {
              label:'HTML',
              click:()=>this.addSnippet('```html\n\n```')
            },
            {
              label:'CSS',
              click:()=>this.addSnippet('```css\n\n```')
            }
          ]
        },
        {
          label:this.ui.START_SHALLWIN,
          icon:path.join(globals.imgDir, 'shallwin._png'),
          click:this.setBootShallWin
        },
        {
          label:this.ui.REQUEST_ASSIST,
          icon:path.join(globals.imgDir, 'ra._png'),
          click:this.sendRemoteAssistance
        }
      ]).popup({})
    }
  }
}
</script>

