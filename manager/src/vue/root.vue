<style lang="stylus">
.content
  width 100%
  height 100%
  .header
    height 20px
    width 100%
    text-indent 50px
    background-color rgb(200,255,233)
  .menu
    .menu-item
      width 100%
      cursor pointer
      &:hover
        background-color rgb(200,200,255)
      h3
        text-align center
        width 100%
  .content-body
    height calc(100% - 20px)
    display flex
    flex-direction row
    .left-menu
      width 200px
      .menu
        width 200px
    .right-content
      flex-grow 1
      overflow-x hidden
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
</style>
<template>
  <div class="content">
    <nav
      :class="connected?'bg-success':'bg-warning'"
      class="pl-3">Telepath-next manager {{ version }} client-latest-version {{ etc.version }}
      <button
        type="button"
        class="close"
        @click="close"><span aria-hidden="true">&times;</span></button>
    </nav>
    <div class="content-body">
      <div class="left-menu">
        <ul class="menu list-group">
          <li
            v-for="v in views"
            :key="v"
            :class="{active:v === activeView}"
            class="menu-item list-group-item p-1"
            @click="setActiveView(v)"><h3>{{ v | toCapitalFirstChar }}</h3></li>
        </ul>
      </div>
      <div class="right-content">
        <component :is="activeView + '-view'"/>
      </div>
    </div>
    <login-form/>
    <team-selector/>
    <user-selector/>
    <dialog-box/>
    <span class="notifies">
      <transition-group name="notify" tag="div">
        <notify-message v-for="n in notifies" :key="n.id" :notify="n"/>
      </transition-group>
    </span>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import gev from '../js/global-event'
import store from '../js/store'
import LoginForm from './login-form.vue'
import Rooms from './rooms.vue'
import Teams from './teams.vue'
import Users from './users.vue'
import Messages from './messages.vue'
import Notify from './notify.vue'
import TeamSelector from './team-selector.vue'
import UserSelector from './user-selector.vue'
import Dialog from './dialog.vue'
import SendAll from './send-all.vue'
import Apps from './apps.vue'
import Script from './script.vue'
import {remote} from 'electron'
const mainWindow = remote.getCurrentWindow()
const NOTIFY_TIMEOUT = 4000

let notifyId = 0
export default {
  components:{
    'login-form':LoginForm,
    'teams-view':Teams,
    'rooms-view':Rooms,
    'users-view':Users,
    'messages-view':Messages,
    'apps-view':Apps,
    'send-all-view':SendAll,
    'script-view':Script,
    'notify-message':Notify,
    'dialog-box':Dialog,
    'team-selector':TeamSelector,
    'user-selector':UserSelector
  },
  data(){
    return {
      activeView:'teams',
      notifies:[]
    }
  },
  store,
  computed:mapState(['ws', 'version', 'etc', 'debug', 'connected', 'views']),
  mounted(){
    const c = document.querySelector('#cloak')
    c.addEventListener('transitionend', ()=>{
      document.body.removeChild(c)
      this.init()
    })
    c.style.opacity = 0
    mainWindow.maximize()
  },
  created(){
    gev.$on('notify-message',(message, level = 'warn')=>{
      this.notifies.push({
        id:notifyId++,
        message,
        level
      })
      setTimeout(()=>{
        this.notifies.shift()
      }, NOTIFY_TIMEOUT)
    })
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
    close(){
      window.close()
    }
  }
}
</script>


