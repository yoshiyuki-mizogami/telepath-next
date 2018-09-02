<style lang="stylus">
#team-detail
  width 450px
  margin 10% auto
  position relative
  .team-name
    padding-left 10px
    border-left solid 15px
    border-bottom solid 1px
  .users
    padding-left 5px
    min-height 400px
    max-height 560px
    overflow-y scroll
    .user
      cursor pointer
      font-size 14px
      height 25px
      border-bottom solid 1px gray
    .user:nth-child(even)
      background-color var(--p-even-bg)
  .username,.account
    display inline-block
    width 115px
    height 100%
    vertical-align top
    overflow hidden
  .at
    vertical-align top
    font-size 12px
    color gray
  .icon
    height 24px
    width 24px
    border solid 1px white
    border-radius 2px
    margin 0
  .connection-state
    height 16px
    width 16px
    vertical-align super
    display inline-block
    background-color var(--connect-color)
    border-radius 8px
  .disconnect
    background-color var(--disconnect-color) !important
  .idle
    background-color var(--idle-color)
</style>
<template>
  <transition name="layer">
    <div class="layer-cover" v-if="show">
      <div id="team-detail">
        <div :style="{'border-color':team.color}" class="team-name"><span>{{ team.name }}</span><button class="close" @click="close">X</button></div>
        <div class="users">
          <div class="user" v-for="u in team.users" :key="u._id" @dblclick="showUserDetail(u)">
            <img class="icon" :src="u.iconUrl">
            <span class="account">{{ u.account }}</span>
            <span class="username">{{ config.useNickname ? u.nickname || u.name : u.name }}</span>
            <span class="connection-state"
                  :title="u.connected?'connected':'disconnected'"
                  :class="{disconnect:!u.connected}"/>
            <span v-show="u.idle" class="connection-state idle"/>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {mapState} from 'vuex'
import gev from '../js/g-event.js'
import '../js/vue-filters'
import {remote} from 'electron'
import UserDetail from './user-detail.vue'
const ESC = 27
export default {
  data(){
    return {
      show:false,
      team:{},
      targetUser:null
    }
  },
  watch:{
    show(v){
      if(v){
        return gev.addLayer(this)
      }
      gev.removeLayer()
    }
  },
  components:{
    'user-detail':UserDetail
  },
  created(){
    gev.$on('show-team-detail', this.showMe)
    gev.$on('got-user-info', this.setDetailTargetUser)
    this.$on('keydown', this.keydown)
  },
  computed:mapState(['config']),
  methods:{
    keydown(ev){
      if(ev.which === ESC){
        this.close()
      }
    },
    showMe(team){
      this.team = team
      this.show = true
    },
    setDetailTargetUser(user){
      gev.$emit('show-user-detail', user)
    },
    showUserDetail(u){
      this.$store.dispatch('getUserInfo', u._id)
    },
    close(){
      this.show = false
      this.team = {}
    }
  }
}
</script>
