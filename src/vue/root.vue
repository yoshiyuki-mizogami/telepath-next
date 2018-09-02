<style lang="stylus">
#app
  height 100%
  width 100%
.booting
  margin 20% auto
  width 120px
  text-align center
  height 200px
  font-size 0
.booting>.boal
  animation booting 1.6s infinite ease-in
  height 30px
  width 30px
  border-radius 15px
  display inline-block
.booting
  .boal:nth-child(1)
    animation-delay -0.45s
  .boal:nth-child(2)
    animation-delay -0.3s
  .boal:nth-child(3)
    animation-delay -0.15s
@keyframes booting
  0%,100%
    background-color #888
    transform scale(0)
  50%
    background-color #FFF
    transform scaleX(1)
.header
  width 100%
  text-align center
  font-size 12px
.bar
  background-color var(--f-bg)
  .message-searcher
    -webkit-app-region no-drag
    text-align center
    width 130px
    margin-left 15px
    height 100%
    font-size 13px
    vertical-align top
    border none
  .unread-message-wrap
    width 130px
    display inline-block
  .unread-message
    font-size 12px
    color gray
    font-weight bold
  .unread-icon
    vertical-align top
    display inline-block
    text-align center
    font-size 20px
    width 20px
    height 20px
    border-radius 10px
    color red
    background-color white
  .filter-marks
    float right
    width 50px
    margin-right 10px
    height 100%
    text-align center
    border-radius 3px
    text-shadow 2px 2px 2px rgb(100,100,100)
    overflow hidden
    [class^="icon-"]
      display inline-block
      width 12px
      height 100%
      cursor pointer
      -webkit-app-region no-drag
    .icon-filter
      color rgb(255,50,50)
    .icon-search
      color rgb(155,255,200)
    .icon-warning
      color rgb(255, 255, 100)
  .power-off, .always-on-top,.minimize
    -webkit-app-region no-drag
    cursor pointer
    text-align center
    float right
    width 20px
    background-color rgb(255, 50,70)
    box-shadow 1px 1px 3px 1px white inset
    border-radius 10px
    height 100%
    font-size 20px
    margin-right 0px
    margin-left 4px
  .always-on-top
    transition background-color .4s ease
    background-color gray
    &.enable
      background-color rgb(255,255,100)
  .minimize
    background-color lightblue
  .menu-btn
    cursor pointer
    -webkit-app-region no-drag
    text-align center
    border-radius 0px 4px 4px 0px
    width 100px
    height 100%
    float left
.middle
  height calc(100% - 145px)
  width 100%
.left-pane
  height 100%
  float left
  width 25%
  font-size 13px
  .team-filter
    height 20px
    width 100%
    text-align center
  .teams
    height calc(100% - 170px)
    overflow-y scroll
  .favorites
    height 150px
    overflow-y scroll
    .icon-star
      color hsl(72, 70%, 52%)
    .favorite
      cursor pointer
      padding 2px 4px
      margin-bottom 1px
.messages
  height 100%
  float left
  width 75%
  overflow-y scroll

.input
  width 100%
  font-size 0
  .funcs
    height 68px
    width 100%
    input
      width 100%
  .sh-apps
    white-space nowrap
    background-color var(--s-bg)
    height 32px
    .sh-app
      cursor pointer
      width 31px
      height 31px
  .input-form
    float left
    width 100%
    height 100px
    padding 5px
    border-radius 5px
    overflow-y auto
  .input-left
    float left
    width 25%
    height 100%
    font-size 15px
    line-height 17px
  .open-download-dir
    position relative
    padding 4px 0px
    text-align center
    font-size 14px
    height 25px
    cursor pointer
    background-color hsl(200, 90%, 80%)
    &:hover
      background-color hsl(200, 70%, 60%)
    .download-effect
      pointer-events none
      top -70px
      left 27px
      position absolute
      border 50px solid transparent
      border-top 50px solid rgb(150, 150, 255)
      margin auto
      transition all .8s ease
    .download-leave-to
      opacity 0
      top -50px
  .input-right
    float left
    width 75%
    .file-at-wrap
      position fixed
      right 0
      bottom 125px
  .buttons
    clear both
  .send-btn
    height 25px
    border none
    border-top solid 1px gray
    width 100%
    cursor pointer
.idle-cover
  pointer-events none
  position fixed
  padding 20% 0
  height calc( 100% - 20px )
  width 100%
  top 20px
  left 0
  background-color var(--s-bg)
  color var(--s-color)
  font-size 40px
  text-align center
  z-index 10000
</style>
<template>
  <div id="app" @drop.prevent.stop="dropFile" @dragstart.prevent.stop @dragover.prevent.stop>
    <div v-if="idle" class="idle-cover">
      {{ ui.IDLE }}...<div class="trip"/>
    </div>
    <transition name="layer">
      <div v-show="sending || bootingOther" class="layer-cover">
        <div class="booting">
          <div class="boal"/>
          <div class="boal"/>
          <div class="boal"/>
          <div class="boal"/>
        </div>
      </div>
    </transition>
    <div class="bar" style="-webkit-app-region:drag;height:20px">
      <div class="menu-btn" @click="showMenu">{{ ui.MENU }}</div>
      <input ref="messageSearch" class="message-searcher" type="text"
             @keydown.enter="filterMessage" v-model="searchTxt" :placeholder="ui.FILTER_MESSAGE">
      <div v-show="unreadCount" class="unread-message-wrap">
        <span class="unread-icon icon-exclamation"/>
        <span class="unread-message">{{ unreadMessage }}</span>
      </div>
      <div class="power-off" @click="close"/>
      <div class="minimize" @click="$store.dispatch('minimize')"/>
      <div class="always-on-top" :class="{enable:alwaysOnTop}" @click="toggleAlwaysOnTop"/>
      <div class="filter-marks">
        <div class="icon-filter" v-show="filterUnread" @click="$store.commit('switchFilterUnread')"/>
        <div class="icon-warning" v-show="filterImportant" @click="$store.commit('switchFilterImportant')"/>
        <div class="icon-search" v-show="searchText" @click="$store.commit('setSearchText', searchTxt='')"/>
      </div>
    </div>
    <div class="middle">
      <div class="left-pane">
        <input class="team-filter" type="text" :placeholder="ui.TEAM_FILTER" v-model="teamFilter">
        <div class="teams">
          <team-box ref="teams" v-for="t in teams" :team="t" :key="t._id"/>
        </div>
        <div class="favorites">
          <my-favorite v-for="fav in favorites" :fav="fav" :key="fav.name"/>
        </div>
      </div>
      <div class="messages" @scroll="reDrawCursor">
        <message-box v-for="m in messages" :m="m" :key="m._id"/>
      </div>
    </div>
    <div class="input">
      <div class="input-left">
        <div class="funcs">
          <input type="button" :value="ui.MOVE_TO_UNREAD" @click="moveToUnread">
          <input type="button" :value="ui.UNSELECT_ALL" @click="$store.dispatch('unselectAll')">
          <input type="button" :value="ui.SET_FAVORITE_GROUP" @click="addGroup">
        </div>
        <div class="sh-apps">
          <img class="sh-app" :src="getAppUrl(a)" v-for="a in shApps" :title="a.caption" @dblclick="bootApp(a)" :key="a.name">
        </div>
        <div class="open-download-dir" @click="openDownloadDir">
          <span class="icon-folder-open" style="color:yellow"/>
          {{ ui.OPEN_DOWNLOAD_DIR }}
          <download-effect/>
        </div>
      </div>
      <div class="input-right">
        <div class="file-at-wrap">
          <selected-teams/>
          <file-attacher ref="fileAttacher"/>
        </div>
        <textarea maxlength="2500" ref="messageContent" v-model="messageContent" class="input-form"
                  @wheel.prevent="scrollHandle"
                  @contextmenu.stop="popupMessageMenu"
                  @keydown.ctrl.86="checkClipboardImg"
                  @keydown.shift.enter.prevent="sendMessage"/>
        <div class="buttons">
          <button class="send-btn" @click="sendMessage">{{ ui.SEND }}(Shift+Enter)</button>
        </div>
      </div>
    </div>
    <pointer-canvas/>
    <replay-form/>
    <login-form/>
    <left-menu/>
    <setting-view/>
    <personal-info-view/>
    <dialog-box/>
    <prompt-box/>
    <notify-message/>
    <team-detail/>
    <message-detail/>
    <user-detail/>
    <my-keeps/>
    <team-order/>
    <change-pwd/>
    <app-store/>
    <direct-opener/>
  </div>
</template>
<script>
import gev from '../js/g-event'
import globals from '../js/globals'
import ReplyForm from './reply.vue'
import LoginForm from './login.vue'
import NotifyMessage from './notify.vue'
import Dialog from './dialog.vue'
import Prompt from './prompt.vue'
import Team from './team.vue'
import AppMenu from './app-menu.vue'
import Setting from './setting.vue'
import PersonalInfo from './personal-info.vue'
import MyFavorite from './favorite.vue'
import SelectedTeams from './selected-teams.vue'
import TeamDetail from './team-detail.vue'
import MessageDetail from './message-detail.vue'
import UserDetail from './user-detail.vue'
import Keeps from './keeps.vue'
import TeamOrder from './team-order.vue'
import ChangePassword from './change-password.vue'
import AppStore from './app-store/app-store.vue'
import DownloadEffect from './download-effect.vue'
import DirectOpener from './direct-opener.vue'
import path from 'path'
import {format} from 'util'
import db from '../js/db'
import el from 'electron'
import PointerCanvas from './pointer-canvas.vue'
import {mapState,mapActions} from 'vuex'
import messageParser from '../js/util/message-parser'
import clipboardToFile from '../js/util/clipboard-to-file'
import createKeySignature from '../js/util/create-key-signature'
import shallwin from '../js/util/shallwin'
import ra from '../js/util/ra'
import escapeHTML from '../js/util/escape-html'
import setSnippet from '../js/util/set-snippet'
const {remote} = el
const {Menu} = remote
const thisWindow = remote.getCurrentWindow()
const noop = ()=>{}
/*for performance */
const TELEPATH_PORT = globals.WS_PORT
const actions = {
  methods:mapActions([
    'checkUnread',
    'openDownloadDir',
    'moveToUnread'
  ])
}
export default {
  name:'RootModel',
  data(){
    return {
      searchTxt:'',
      teamFilter:'',
      userInfo:{},
      messageContent:''
    }
  },
  mixins:[actions],
  computed:mapState({
    ui:'ui',
    connected:'connected',
    loginedInfo:'loginedInfo',
    ws:'ws',
    teams:'teams',
    config:'config',
    messages:'messages',
    alwaysOnTop:'alwaysOnTop',
    favorites:'favorites',
    bootingOther:'bootingOther',
    sending:'sending',
    unreadCount:'unreadCount',
    searchText:'searchText',
    filterUnread:'filterUnread',
    filterImportant:'filterImportant',
    idle:'idle',
    unreadMessage(){
      return format(this.ui.UNREAD_MESSAGE,this.unreadCount)
    },
    shApps(){
      return this.$store.getters.shortcutApps
    }
  }),
  async created(){
    shallwin.register(param=>{
      param.yourName = this.loginedInfo.name
      param.iconUrl = this.loginedInfo.iconUrl
      this.$store.commit('bootOther', true)
      shallwin.bootClient(param)
      setTimeout(()=>{
        this.$store.commit('bootOther', false)
      },5000)
    })
    ra.regist()
    this.shortCuts = {
      'ctrl+f':()=> this.$refs.messageSearch.focus(),
      'alt+c':()=>{
        this.$store.commit('clearFilter')
        this.searchTxt = ''
      },
      'ctrl+alt+r':()=> this.$store.dispatch('readAllUnreadMessage'),
      'alt+m':this.moveToUnread,
      'alt+u':()=> gev.$emit('restore-favorite',[]),
      'alt+t':()=> this.showMenu(),
      'ctrl+t':()=> this.$store.commit('toggleAlwaysOnTop'),
      'alt+d':()=> this.openDownloadDir(),
      'alt+a':()=> this.$store.commit('switchFilterUnread'),
      'alt+i':()=>this.$store.commit('switchFilterImportant'),
      'alt+k':()=> this.$store.dispatch('getKeeps'),
      f10:()=>this.$store.dispatch('testLocalApp')
    }
    this.$on('keydown', this.keydown)
    this.$on('drop-file', this.receiveFile)
    
    db.getFavorites()
      .then(favorites=>{
        this.$store.state.favorites = favorites
      })
    gev.$on('check-unread', this.checkUnread)
    const ws = this.ws
    await this.$store.dispatch('initConfig')
    gev.$on('get-selected-teams', this.getSelectedTeams)
    ws.setConfig({
      url:'wss://' + globals.WS_SERVER,
      port:TELEPATH_PORT
    })
    ws.setMethods(obj=>{
      this.$store.dispatch(obj.method, obj)
    })
    gev.$on('set-search-enter', tag=>{
      this.$store.commit('setSearchText', tag)
      this.searchTxt = tag
    })
    gev.addLayer(this)
    ws.on('close', ()=>{
      gev.$emit('show-dialog', this.ui.LOST_CONNECTION,{
        okCaption:this.ui.EXIT,
        ok:this.close
      })
      this.$store.commit('setConnect', false)
      this.$store.dispatch('setApps')
    })
    ws.on('open', ()=>{
      this.$store.commit('setConnect', true)
      gev.$emit('hide-dialog')
      gev.$emit('show-login-form')
    })
    await ws.connect()
  },
  mounted(){
    thisWindow.show()
  },
  watch:{
    unreadCount(v){
      const overlay = globals.getOverlay(v)
      thisWindow.setOverlayIcon(overlay, `${v} unread(s)`)
      if(thisWindow.isFocused()){
        return
      }
      if(v){
        this.notifyUnread()
      }
    },
    teamFilter(v){
      gev.$emit('filter-team', v.toLowerCase())
    }
  },
  methods:{
    keydown(ev){
      const key = createKeySignature(ev)
      const shortCuts = this.shortCuts
      const doFunc = shortCuts[key]
      if(!doFunc){
        return
      }
      doFunc()
    },
    notifyUnread(){
      this.$store.dispatch('notify', format(this.ui.NOTIFY_UNREAD, this.unreadCount))
    },
    getSelectedTeams(clbk = noop){
      const _teams = this.$refs.teams || []
      const teams = _teams.filter(t=>t.selected)
        .map(t=>t.team)
      clbk(teams)
      return teams
    },
    addGroup(){
      const teams = this.getSelectedTeams().map(t=>t._id)
      if(!teams.length){
        return gev.$emit('notify-message', this.ui.SELECT_TEAM)
      }
      gev.$emit('show-prompt', this.ui.ADD_GROUP_MESSAGE,{
        ok:_name=>{
          const name = _name.trim()
          if(!name){
            gev.$emit('notify-message', this.ui.REQUIRE_NAME)
            return false
          }
          db.addFavorites({
            name,
            teams
          }).then(team=> this.favorites.push(team))
          return true
        }
      })
    },
    reDrawCursor(){
      gev.$emit('redraw-cursor')
    },
    dropFile(ev){
      ev.preventDefault()
      ev.stopPropagation()
      gev.$emit('event', 'drop-file', ev)
    },
    receiveFile(ev){
      const files = ev.dataTransfer.files
      if(!files.length){
        return
      }
      this.$refs.fileAttacher.$emit('receive-files', files)
    },
    revokedMessage(obj){
      this.$store.dispatch('revokedMessage', obj)
    },
    async checkClipboardImg(){
      const ret = await clipboardToFile()
      if(!ret){
        return
      }
      this.$refs.fileAttacher.$emit('receive-files', [{path:ret}])
    },
    sendMessage({messageFormat:overwriteType}){
      const destTeams = this.getSelectedTeams()
      if(!destTeams.length){
        gev.$emit('notify-message', this.ui.SELECT_TEAM)
        return
      }
      const destTeamIds =destTeams.map(d=>d._id)
      const destTeamNames = destTeams.map(d=>d.name)
      const content = this.messageContent.trim()
      if(!content){
        gev.$emit('notify-message', this.ui.REQUIRE_MESSAGE)
        return
      }
      if(this.config.unselectAfterSend){
        this.$store.dispatch('unselectAll')
      }
      this.$store.commit('setSending')
      const messageContent = messageParser(content)
      this.messageContent = ''
      return this.$refs.fileAttacher.getFiles()
        .then(files=>{
          const message = {
            method:'sendMessage',
            message:{
              type:overwriteType || messageContent.type,
              destTeams:destTeamIds,
              destTeamNames,
              content:messageContent.content,
              sender:this.loginedInfo._id,
              senderName:this.loginedInfo.name,
              files
            },
          }
          this.ws.send(message)
        })
    },
    filterMessage(){
      this.$store.commit('setSearchText', this.searchTxt)
    },
    toggleAlwaysOnTop(){
      this.$store.commit('toggleAlwaysOnTop')
    },
    showMenu(){
      gev.$emit('toggle-menu')
    },
    setBootShallWin(){
      const selects = this.getSelectedTeams()
      if(!selects.length){
        return gev.$emit('notify-message', this.ui.SELECT_TEAM)
      }
      this.$store.commit('bootOther', true)
      shallwin.advertise(this.loginedInfo)
        .then(ret=>{
          this.messageContent = 
            escapeHTML(this.messageContent) + '\n' + ret
          return this.sendMessage({messageFormat:'html'})
        }).catch((er)=>{
          console.error(er)
        }).then(()=>{
          this.$store.commit('bootOther', false)
        })
    },
    sendRemoteAssistance(){
      const selects = this.getSelectedTeams()
      if(!selects.length){
        return gev.$emit('notify-message', this.ui.SELECT_TEAM)
      }
      this.$store.commit('bootOther', true)
      ra.advertise()
        .then(ret=>{
          this.messageContent = 
            escapeHTML(this.messageContent) + '\n' + ret
          return this.sendMessage({messageFormat:'html'})
        }).catch((er)=>{
          console.error(er)
        }).then(()=>{
          this.$store.commit('bootOther', false)
        })
    },
    addSnippet(snippet){
      const el = this.$refs.messageContent
      this.messageContent = setSnippet(el, snippet)
    },
    popupMessageMenu(){
      Menu.buildFromTemplate([
        {
          label:this.ui.START_SHALLWIN,
          icon:path.join(globals.imgDir, 'shallwin._png'),
          click:this.setBootShallWin
        },
        {
          label:this.ui.REQUEST_ASSIST,
          icon:path.join(globals.imgDir, 'ra._png'),
          click:this.sendRemoteAssistance
        },
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
        }
      ]).popup({})
    },
    scrollHandle(ev){
      const {deltaY} = ev
      const upDown = 0<deltaY ? 15 : -15
      ev.target.scrollTop = ev.target.scrollTop += upDown
    },
    getAppUrl(a){
      return this.$store.getters.createAppUrl(a.name)
    },
    bootApp(a){
      this.$store.dispatch('bootApp', a)
    },
    close(){
      window.close()
    }
  },
  components:{
    'left-menu':AppMenu,
    'team-box':Team,
    'setting-view':Setting,
    'personal-info-view':PersonalInfo,
    'dialog-box':Dialog,
    'prompt-box':Prompt,
    'login-form':LoginForm,
    'replay-form':ReplyForm,
    'notify-message':NotifyMessage,
    'pointer-canvas':PointerCanvas,
    'my-favorite':MyFavorite,
    'selected-teams':SelectedTeams,
    'team-detail':TeamDetail,
    'message-detail':MessageDetail,
    'user-detail':UserDetail,
    'my-keeps':Keeps,
    'team-order':TeamOrder,
    'change-pwd':ChangePassword,
    'app-store':AppStore,
    'download-effect':DownloadEffect,
    'direct-opener':DirectOpener
  }
}

</script>
