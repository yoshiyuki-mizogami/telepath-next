<template>
  <transition name="layer">
    <div class="layer-cover" v-if="show">
      <div class="login-form">
        <div>Change password form</div>
        <div>{{ ui.ACCOUNT }}:{{ account }}</div>
        <span>{{ ui.SET_NEW_PASSWORD }}</span>
        <div><input type="password" :placeholder="ui.CURRENT_PASSWORD" v-model="currentPassword"></div>
        <div><input type="password" :placeholder="ui.NEW_PASSWORD" v-model="newPassword"></div>
        <div><input type="password" :placeholder="ui.CONFIRM_PASSWORD" v-model="confirmPassword" @keydown.enter="setNewPassword"></div>
        <div>
          <input type="button" :value="ui.APPLY" :disabled="fixed" @click="changePassword">
          <input type="button" :value="ui.CLOSE" :disabled="fixed" @click="hideMe">
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import gev from '../js/g-event'
import {mapState} from 'vuex'
const MESSAGE_TIMEOUT = 3000
const LEAST_PASSWORD_LENGTH = 4
export default {
  data(){
    return {
      show:false,
      fixed:false,
      currentPassword:'',
      newPassword:'',
      confirmPassword:''
    }
  },
  computed:mapState({
    ui:'ui',
    ws:'ws',
    account(){
      return this.$store.state.loginedInfo.account
    }
  }),
  created(){
    gev.$on('show-change-password-form', this.showMe)
    gev.$on('password-changed', this.completed)
  },
  watch:{
    show(v){
      if(v){
        gev.addLayer(this)
      }else{
        gev.removeLayer()
      }
    }
  },
  methods:{
    showMe(){
      this.show = true
      this.fixed = false
    },
    hideMe(){
      this.show = false
    },
    completed(){
      this.fixed = true
      gev.$emit('notify-message', this.ui.COMPLETED_CHANGE_PASSWORD)
      this.saveLoginfo()
      setTimeout(this.hideMe, MESSAGE_TIMEOUT)
    },
    changePassword(){
      if(this.newPassword.length < LEAST_PASSWORD_LENGTH){
        return gev.$emit('notify-message', this.ui.TOO_SHORT_PASSWORD)
      }
      if(this.newPassword !== this.confirmPassword){
        return gev.$emit('notify-message', this.ui.PASS_CONFIRM_NOT_MATCH)
      }
      this.logining = true
      this.ws.send({
        method:'changePassword',
        currentPassword:this.currentPassword,
        newPassword:this.newPassword
      })
    },
    saveLoginfo(){
      const saveInfo = JSON.parse(localStorage.getItem('logInfo') || '{}')
      const saveObj = {
        account:this.account,
        password:'',
        saveInfo:!!saveInfo.saveInfo
      }
      localStorage.setItem('logInfo', JSON.stringify(saveObj))
    }
  }
}
</script>

