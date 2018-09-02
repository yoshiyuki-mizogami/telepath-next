<style lang="stylus">
.content
  width 100%
  height 100%
  font-size 20px
  .pl-3
    text-align center
.notifies
  pointer-events none
  position fixed
  right 0
  top 5%
.notify-enter-active,.notify-leave-active
  transition all .3s ease
  opacity 1
.notify-enter, .notify-leave-to
  opacity 0
  margin-top -50px
.notify-move-to
  transform transform 1s
.your-info
  height 30px
  text-align center
  >div
    min-width 300px
.send-all-view
  width 100%
  text-align center
  .send-all-message
    height 300px
    width 100%
    resize none
  .message-pane
    margin auto
    width 1000px !important
    textarea
      font-size 20px
  .files 
    height 100px
    overflow-y scroll
    .file
      border-bottom solid 1px gray
</style>
<template>
  <div class="content">
    <nav :class="connected?'bg-success':'bg-warning'" class="pl-3">Telepath-next SendMessageAll App {{sendAllVer}}</nav>
      <div class="your-info">
        <div class="d-inline-block bg-info text-white px-3">{{logInfo.name}}:{{logInfo.account}}</div>
      </div>
      <div class="send-all-view" @drop.prevent="setFile" @dragenter.prevent @dragover.prevent>
      <div class="message-pane"><p>ファイルも添付出来ます。メッセージ入力後、「全員に送る」で全体宛メッセージを送れます。<br>
        最低でも20文字以上の内容が必要です</p>
        <textarea spellcheck="false" class="send-all-message form-control" v-model="sendAllMessage"></textarea>
        <div class="files">
          <div class="file" v-for="f in files">{{f.name}}</div>
        </div>
        <div class="form-linline">
          <input class="btn btn-outline-warning" type="button" value="添付ファイルをクリア" @click="clearFiles">
          <input class="btn btn-outline-success" :disabled="sendAllMessage.length < 20" type="button" value="全員におくる" @click="sendAll">
        </div>
      </div>
    </div>
    <login-form/>
    <dialog-box/>
    <span class="notifies">
      <transition-group name="notify" tag="div">
        <notify-message v-for="n in notifies" :key="n.id" :notify="n"></notify-message>
      </transition-group>
    </span>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import gev from '../js/global-event'
import store from '../js/store'
import LoginForm from './login-form.vue'
import Notify from './notify.vue'
import Dialog from './dialog.vue'
import SendAll from './send-all.vue'
const NOTIFY_TIMEOUT = 4000

let notifyId = 0
export default {
  data(){
    return {
      sendAllVer:'1.0.0',
      notifies:[],
      sendAllMessage:'',
      files:[]
    }
  },
  components:{
    'login-form':LoginForm,
    'send-all-view':SendAll,
    'notify-message':Notify,
    'dialog-box':Dialog
  },
  store,
  computed:mapState(['logInfo', 'ws', 'version', 'etc', 'connected']),
  created(){
    this.$store.commit('setLoginMethod', 'loginSendAll')
    gev.$on('notify-message',(message, level="warn")=>{
      let offset = this.notifies.length
      this.notifies.push({
        id:notifyId++,
        message,
        level
      })
      setTimeout(()=>{
        this.notifies.shift()
      }, NOTIFY_TIMEOUT)
    })
    this.init()
  },
  methods:{
    init(){
      this.$store.state.ws.on('open', ()=>{
        console.info('connect')
        this.showLoginForm()
      })
      this.$store.dispatch('initStore')
    },
    setActiveView(v){
      this.activeView = v
    },
    showLoginForm(){
      gev.$emit('show-login-form')
    },
    setFile(ev){
      this.clearFiles()
      this.files.push(...Array.from(ev.dataTransfer.files))
    },
    clearFiles(){
      this.files = []
    },
    sendAll(){
      let m = this.sendAllMessage.trim()
      if(!m || m.length <= 20){
        return gev.$emit('notify-message', 'Message too short')
      }
      this.$store.dispatch('sendAll', {message:this.sendAllMessage, files:this.files})
      this.clearFiles()
      this.sendAllMessage = ''
    }
  }
}
</script>


