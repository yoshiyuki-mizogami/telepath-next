
<template>
  <div class="a-user card p-2 align-top" :class="{connected:user.connected}">
    <div v-if="debug" v-once>{{ user._id }}</div>
    <button type="button" class="close" @click="removeUser"><span aria-hidden="true">&times;</span></button>
    <div v-once class="user-icon"><img :src="iconUrl"></div>
    <span :class="{idle:user.idle}">
      <span v-once class="user-account" v-text="user.account"/>
      <span v-once class="user-name" v-text="user.name"/>
      <span v-once class="last-login">{{ user.lastLogin | formatDateTime }}</span>
      <span v-once class="last-login">ver {{ user.version }}</span>
      <input type="button" value="IniPw" style="padding:2px" class="btn btn-danger" @click.stop="initUserPassword">
    </span>
    <table v-once class="user-extra-info">
      <colgroup>
        <col width="1">
        <col width="3">
      </colgroup>
      <tbody>
        <tr><th>Nickname</th><td>{{ user.nickname }}</td></tr>
        <tr><th>Tel</th><td>{{ user.tel }}</td></tr>
        <tr><th>Mail</th><td>{{ user.mail }}</td></tr>
        <tr><th>Message</th><td><div style="white-space:pre-wrap;word-wrap:break-word">{{ user.message }}</div></td></tr>
      </tbody>
    </table>
    <input type="button" class="btn btn-warning" value="GetBelongs" @click="getBelongs">
    <transition name="layer">
      <ul class="list-group" v-if="belongs.length">
        <li class="list-group-item" v-for="b in belongs" :key="b._id">{{ b.name }}</li>
      </ul>
    </transition>
  </div>
</template>
<script>
import gev from '../js/global-event.js'
import globals from '../js/globals.js'
const {IMAGE_SERVER} = globals
export default {
  props:{
    user:Object
  },
  data(){
    return {
      belongs:[]
    }
  },
  computed:{
    iconUrl(){
      return `http://${IMAGE_SERVER}:8080/icons/${this.user._id}.png`
    },
    debug(){
      return this.$store.state.debug
    }
  },
  methods:{
    removeUser(){
      gev.$emit('show-dialog', `Remove User ${this.user.name} OK?`,{
        ok:()=>{
          this.$store.dispatch('removeUser', this.user._id)
        },
        cancelable:true
      })
    },
    getBelongs(){
      this.$store.dispatch('getBelongs', this)
    },
    initUserPassword(){
      gev.$emit('show-dialog', `Init user password for ${this.user.name} OK?`,{
        ok:()=>{
          this.$store.dispatch('initUserPassword', this.user._id)
        },
        cancelable:true
      })
    }
  }
}
</script>
<style lang="stylus">
  .a-user
    width 300px
    font-size 15px
    background-color rgb(205,200,200)
    margin 2px
    display inline-block
    position relative
    .close
      position absolute
      right 10px
      top 0
    .btn
      font-size 12px
    .idle
      border-radius 5px
      background-color rgb(255, 157, 11)
    .user-icon
      float left
      height 64px
      width 64px
      img
        height 100%
        width 100%
    &.connected
      background-color rgb(205,255,225)
    span
      display inline-block
      width calc(100% - 64px)
    .user-name
      width 120px
    .user-account
      width 80px
    .last-login
      font-size 10px
      color gray
      width 120px
    .user-extra-info
      width 100%
      table-layout fixed
      border-collapse separate
      border-spacing 1px
      font-size 12px
      th
        color gray
        text-align center
      tr
        background-color rgba(255,255,255,.5)
      .list-group-item
        font-size 12px
</style>


