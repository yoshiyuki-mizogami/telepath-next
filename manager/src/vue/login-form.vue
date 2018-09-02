<template>
  <transition name="layer">
    <div class="layer-cover" v-if="!$store.state.connected || show">
      <div class="login-form p-3" v-if="show">
        <div>Login</div>
        <input spellcheck="false" type="text" class="form-control" v-model="state.account" placeholder="Account" ref="account" @keydown.enter="login">
        <input type="password" class="form-control" v-model="state.pwd" placeholder="Password" @keydown.enter="login">
        <div class="form-inline">
          <input type="button" class="btn btn-outline-success" value="Login" @click="login">
          <label class="custom-control custom-checkbox ml-2">
            <input type="checkbox" class="custom-control-input" v-model="state.saveLoginfo">
            <span class="custom-control-indicator" :class="{enable:state.saveLoginfo}"></span>
            <span class="custom-contorl-description">Save account</span>
          </label><br>
          <input type="button" class="btn btn-outline-success" value="Exit" @click="exit">
        </div>
        <div class="notify-message">{{m}}</div>
      </div>
    </div>
  </transition>
</template>

<script>
import gev from '../js/global-event'
const LOGIN_STATE = 'tl-manager.loginState'
const STATE_BASE = {
  account:'',
  pwd:'',
  saveLoginfo:false,
}
export default {
  data(){
    return {
      state:Object.assign({}, STATE_BASE),
      m:'', 
      show:false
    }
  },
  created(){
    gev.$on('show-login-form',()=>{
      this.showMe()
    })
    gev.$on('managerLoginFailed', this.failed)
    gev.$on('managerLogined', this.close)
  },
  methods:{
    showMe(){
      this.loadState()
      this.show = true
      this.$nextTick(()=>{
        this.$refs.account.focus()
      })
    },
    login(){
      if(!this.state.account || !this.state.pwd){
        return this.notify('Input account and password')
      }
      this.$store.dispatch('send',{
        method:this.$store.state.loginMethod,
        account:this.state.account,
        pwd:this.state.pwd,
        debug:this.$store.state.debug
      })
      if(!this.state.saveLoginfo){
        Object.assign(this.state, STATE_BASE)
      }
      this.saveState()
    },
    notify(m){
      this.m = m
      setTimeout(()=>{
        this.m = ''
      }, 5000)
    },
    failed(){
      this.notify('Login failed')
    },
    close(){
      this.show = false
    },
    loadState(){
      let stateString = localStorage.getItem(LOGIN_STATE)
      if(!stateString){
        this.saveState()
        return this.loadState()
      }
      let stateJson = JSON.parse(stateString)
      Object.assign(this.state, stateJson)
    },
    saveState(){
      let stateString = JSON.stringify(this.state)
      localStorage.setItem(LOGIN_STATE, stateString)
    },
    exit(){
      window.close()
    }
  }
}
</script>
<style lang="stylus">
  .login-form
    width 300px
    margin 10% auto
    background-color white
    border-radius 5px
    text-align center
    .notify-message
      height 25px
      text-align center
      font-weight bold
      color rgb(255,100,150)
    .custom-control-indicator
      display inline-block
      margin-right 5px
      height 20px
      width 20px
      background-color rgb(233,233,233)
      border-radius 2px
      font-size 12px
      color blue
      font-weight bold
      &.enable:before
        content '✔'
        
</style>
