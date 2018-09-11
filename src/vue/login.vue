<style lang="stylus">
.login-form
  position fixed
  top 0
  left 0
  right 0
  padding 5px
  border-radius 5px
  width 300px
  min-height 200px
  margin 10% auto
  text-align center
  input[type=text], input[type=password]
    text-align center
  input[type=button]
    padding 1px 8px
  .login-message
    height 25px
  .loading
    width 70%
    margin 15px auto
    position relative
    >div
      position absolute
      height 20px
      width 20px
      border-radius 10px
      background-color var(--p-bg)
      animation-name load-circle
      animation-iteration-count infinite
      animation-duration 2s
      animation-timing-function linear
      top 0
      transform scale(0)
    .f
      animation-delay 0
    .s
      animation-delay .5s
    .t
      animation-delay 1s
@keyframes load-circle
  0%
    left 0
    transform scale(0)
  50%
    transform scale(1)
    left 50%
  100%
    transform scale(0)
    left 100%
.special-canvas
  position absolute
  top 0
  left 0
  width 100%
  height 100%
  background-color rgba(0,0,0,.8)
</style>
<template>
  <transition name="layer">
    <div class="layer-cover" v-if="show">
      <canvas class="special-canvas" ref="snow" v-if="specialEffect"/>
      <div class="login-form">
        <header class="header">Telepath next Version {{ version }}</header>
        <div>{{ ui.ACCOUNT }}</div>
        <div class="account"><input :disabled="logining || setPasswordMode" type="text" v-model="account"></div>
        <div>{{ ui.PASSWORD }}</div>
        <div class="password"><input :disabled="logining || setPasswordMode" type="password" v-model="password" @keydown.enter="login"></div>
        <span v-if="setPasswordMode">
          <span>{{ ui.SET_NEW_PASSWORD }}</span>
          <div><input type="password" :placeholder="ui.PASSWORD" v-model="newPassword"></div>
          <div><input type="password" :placeholder="ui.CONFIRM_PASSWORD" v-model="confirmPassword" @keydown.enter="setNewPassword"></div>
        </span>
        <div>
          <input type="button" :value="ui.LOGIN" :disabled="logining" @click="login">
          <input type="button" :value="ui.CLOSE" @click="close">
          <input type="checkbox" v-model="saveInfo">{{ ui.SAVE_LOGIN }}
          <div v-if="!logining" class="login-message">{{ message }}</div>
          <div class="loading" v-else>
            <div class="f"/>
            <div class="s"/>
            <div class="t"/>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import gev from '../js/g-event'
import globals from '../js/globals'
import {mapState} from 'vuex'
import Snow from '../js/util/snow.js'
const MESSAGE_TIMEOUT = 10000
export default {
  data(){
    return {
      show:false,
      setPasswordMode:false,
      account:process.env.USERNAME,
      password:'',
      newPassword:'',
      confirmPassword:'',
      message:'',
      saveInfo:false,
      hasBeenLogin:false,
      logining:false,
      specialEffect:false
    }
  },
  computed:mapState(['ui','ws', 'version']),
  created(){
    this.loadLoginfo()
    gev.$on('show-login-form', this.showMe)
    gev.$on('set-new-password', this.setPassword)
    gev.$on('result-login', this.resultLogin)
  },
  mounted(){
    this.startEffect()
  },
  watch:{
    show(v){
      if(v){
        gev.addLayer(this)
      }else{
        gev.removeLayer()
        this.stopEffect()
      }
    }
  },
  methods:{
    startEffect(){
      if(globals.specialEffect){
        this.specialEffect = true
        const checkSnowRefs = ()=>{
          if(this.$refs.snow){
            return Snow.start(this.$refs.snow)
          }
          setTimeout(checkSnowRefs,1000)
        }
        checkSnowRefs()
      }
    },
    stopEffect(){
      this.specialEffect = false
      Snow.stop()
    },
    async login(){
      if(!this.account || !this.password){
        return this.notifyMessage(this.ui.INPUT_NOT_ENOUGTH)
      }
      this.logining = true
      const response = await this.$store.dispatch('login', {
        account:this.account,
        password:this.password,
        newPassword:this.newPassword || void 0,
        version:globals.version
      })
      if(!response.logined){
        if(response.requireNewPassword){
          this.logining = false
          return this.setPasswordMode = true
        }
        return this.$store.dispatch('loginFailed')
      }
      this.logining = false
    },
    resultLogin({ok, message}){
      this.logining = false
      if(ok){
        this.hasBeenLogin = true
        if(this.setPasswordMode){
          this.password = this.newPassword
        }
        this.saveLoginfo()
        this.show = false
        return
      }
      this.show = true
      this.notifyMessage(message)
    },
    notifyMessage(m){
      this.message = m
      this.showMe()
      setTimeout(()=>{
        this.message = ''
      }, MESSAGE_TIMEOUT)
    },
    showMe(){
      if(this.hasBeenLogin){
        this.loadLoginfo()
        return this.login()
      }
      this.show = true
    },
    close(){
      window.close()
    },
    loadLoginfo(){
      const logInfo = localStorage.getItem('logInfo')
      if(!logInfo){
        return
      }
      const logInfoObj = JSON.parse(logInfo)
      Object.assign(this, logInfoObj)
    },
    setPassword(){
      this.logining = false
      this.setPasswordMode = true
    },
    setNewPassword(){
      if(!this.confirmPassword){
        return this.notifyMessage(this.ui.INPUT_NOT_ENOUGTH)
      }
      if(this.newPassword !== this.confirmPassword){
        return this.notifyMessage(this.ui.PASSWORD_UNMATCH)
      }
    },
    saveLoginfo(){
      const save = this.saveInfo
      const saveObj = {
        account:this.account,
        password:this.password,
        saveInfo:save
      }
      if(!save){
        saveObj.password = ''
      }
      localStorage.setItem('logInfo', JSON.stringify(saveObj))
    }
  }
}
</script>

