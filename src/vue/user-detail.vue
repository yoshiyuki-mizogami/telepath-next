<style lang="stylus">
.user-detail
  padding 15px
  border-radius 5px
  margin 10% auto
  width 520px
  background-color rgb(233,233,233)
  color black
  .states
    height 25px
    span
      display inline-block
      border-radius 3px
      padding 3px 10px
      background-color var(--disconnect-color)
    .connect
      background-color var(--connect-color)
    .idle
      background-color var(--idle-color)
  .user-icon
    position relative
    width 64px
    height 64px
    border-radius 3px
    display inline-block
    vertical-align bottom
    background-size cover
    background-repeat no-repeat
  .user-info
    border-bottom solid 1px gray
    div
      vertical-align top
      display inline-block
      padding 4px 2px
    .user-info-key
      text-align center
      font-weight bold
      color rgb(50, 50,50)
      width 33%
    .user-info-value
      width 65%
  .belongs
    overflow-y scroll
    height 100px
    .belong
      display inline-block
      margin 2px
      padding 3px
      border-radius 3px
      background-color white
</style>

<template>
  <transition name="layer">
    <div class="layer-cover" v-if="user">
      <div class="user-detail" >
        <div><div class="user-icon" :style="{'background-image':'url(' + iconUrl + ')'}"/>
          {{ user.account }} {{ user.name }} <button class="close" @click="unset">X</button></div>
        <div class="states">
          <span :class="{connect:user.connected}">{{ user.connected?ui.CONNECTED:ui.DISCONNECTED }}</span>
          <span v-show="user.connected && user.idle" class="idle">{{ ui.IDLE }}</span>
        </div>
        <div class="user-info">
          <div class="user-info-key">{{ ui.NICKNAME }}</div>
          <div class="user-info-value">{{ user.nickname }}</div>
        </div>
        <div class="user-info">
          <div class="user-info-key">{{ ui.TEL_NO }}</div>
          <div class="user-info-value">{{ user.tel }}</div>
        </div>
        <div class="user-info">
          <div class="user-info-key">{{ ui.MAIL }}</div>
          <div class="user-info-value">{{ user.mail }}</div>
        </div>
        <div class="user-info">
          <div class="user-info-key">{{ ui.DEPART }}</div>
          <div class="user-info-value">{{ user.depart }}</div>
        </div>
        <div class="user-info">
          <div class="user-info-key">{{ ui.MESSAGE }}</div>
          <div class="user-info-value" style="white-space:pre-wrap">{{ user.message }}</div>
        </div>
        <div class="belongs">
          <div class="belong" v-for="t in user.teams" :key="t._id">{{ t.name }}</div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import gev from '../js/g-event'
import globals from '../js/globals'
const ESC = 27
export default {
  data(){
    return {
      user:null
    }
  },
  created(){
    this.$on('keydown', this.keydown)
    gev.$on('show-user-detail', this.set)
  },
  watch:{
    user(u){
      if(u){
        return gev.addLayer(this)
      }
      gev.removeLayer()
    }
  },
  computed:{
    iconUrl(){
      return `http://${globals.IMAGE_SERVER}:${globals.IMAGE_SERVER_PORT}/icons/${this.user._id}.png?${Date.now()}`
    },
    ui(){
      return this.$store.state.ui
    }
  },
  methods:{
    keydown(ev){
      if(ev.keyCode === ESC){
        this.unset()
      }
    },
    set(user){
      this.user = user
    },
    unset(){
      this.user = null
    }
  }
}
</script>

