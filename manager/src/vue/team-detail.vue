<template>
  <div class="team-detail" v-if="team">
    <div class="team-detail-name" v-if="!renameMode">
      <div class="form-control" style="width:250px;float:left">{{ team.name }}</div>
      <input type="button" class="btn btn-outline-warning float-sm-right" @click="enterRenameMode" value="Rename">
    </div>
    <input type="text" class="form-control" v-else v-model="newName" @keydown.enter="rename" @keydown.esc="renameMode = false">
    <div style="clear:both;height:10px" :style="{'background-color':team.color}"/>
    <div class="form-inline">
      <div>
        <input type="button" class="btn btn-outline-info" value="Set Relay" @click="showSetRelay">
        <span>Relay to:</span><span v-if="team.relay" class="d-inline-block p-2 rounded bg-info" >{{ team.relay.name }}</span>
      </div>
      <div>
        <div style="float:left;width:80%"><textarea
          class="form-control new-users"
          type="text"
          spellcheck="false"
          @keydown.ctrl.enter="addUser"
          placeholder="Add User Account(ignore space)" v-model="addUserAccount"/>
        </div>
        <div style="float:left;width:20%">
          <input type="button" class="btn btn-outline-primary" value="Add" @click="addUser">
          <input type="button" class="btn btn-outline-warning" value="Select" @click="selectUser">
        </div>
        <button class="btn btn-outline-info" @click="reverseHide" v-if="debug">{{ team.hide ? 'Show' : 'Hide' }}</button>
      </div>
    </div>
    <hr>
    <ul class="users list-group">
      <li class="user list-group-item p-1" v-for="u in team.users" :key="u._id">
        <span class="user-icon"><img :src="getIconUrl(u)"></span>
        <span class="user-account" v-text="u.account"/>
        <span class="user-name" v-text="u.name"/>
        <span class="last-login">{{ u.lastLogin | formatDateTime }}</span>
        <button type="button" class="close" @click="removeUser(u)"><span aria-hidden="true">&times;</span></button>
      </li>
    </ul>
  </div>
</template>
<script>
import {mapState} from 'vuex'
import globals from '../js/globals.js'
import gev from '../js/global-event'
export default {
  data(){
    return {
      addUserAccount:'',
      renameMode:false,
      newName:''
    }
  },
  computed:mapState({
    debug:'debug',
    team:'teamDetail'
  }),
  methods:{
    getIconUrl(u){
      return 'http://' + globals.IMAGE_SERVER + ':80/icons/' + u._id + '.png'
    },
    addUser(){
      const lines = this.addUserAccount.split(/\r?\n/).map(l=>{
        return l.trim()
      }).filter(Boolean)
      if(!lines.length){
        return gev.$emit('notify-message', 'ユーザアカウントを入力してください')
      }
      const tmp =this.addUserAccount
      this.addUserAccount = ''
      lines.forEach((acc)=>{
        this.$store.dispatch('addUserToTeam',{
          account:acc,
          teamId:this.team._id,
          notFoundMessage:`${tmp}はユーザが登録がありません\n開発に登録依頼をしてください`
        })
      })
    },
    selectUser(){
      gev.$emit('show-user-selector',{
        message:'Select target user',
        multiple:true,
        clbk:u=>{
          this.addUserAccount += ('\n' + u.account)
          this.addUserAccount = this.addUserAccount.trim()
        }
      })
    },
    enterRenameMode(){
      this.newName = this.team.name
      this.renameMode = true
    },
    rename(){
      const {newName} = this
      if(!newName){
        return gev.$emit('notify-message', 'Require name')
      }
      this.$store.state.ws.send({
        method:'updateTeam',
        teamId:this.team._id,
        data:{
          name:newName
        }
      })
      this.team.name = newName
      this.renameMode = false
    },
    removeUser(u){
      gev.$emit('show-dialog', `Remove User ${u.name}\nFrom ${this.team.name} OK?`,{
        ok:()=>{
          this.$store.dispatch('removeUserFromTeam', {
            userId:u._id,
            teamId:this.team._id
          })
        },
        cancelable:true
      })
    },
    showSetRelay(){
      gev.$emit('show-team-selector', 'Select team. If relay and relay target are equal then release that relay setting.', relayTeam=>{
        if(!relayTeam){
          return
        }
        if(this.team.relay && ( relayTeam._id === this.team.relay._id) ){
          return gev.$emit('notify-message', 'No change.')
        }
        if(this.team._id === relayTeam._id){
          gev.$emit('notify-message', 'That is the same team and relase relay')
          this.$store.dispatch('setRelayTo',{
            teamId:this.team._id,
            relayId:null
          })
          return this.team.relay = null
        }
        this.$store.dispatch('setRelayTo', {
          teamId:this.team._id,
          relayId:relayTeam._id
        })
        this.$set(this.team, 'relay', relayTeam)
      })
    },
    reverseHide(){
      const rev = !this.team.hide
      this.$store.state.ws.send({
        method:'updateTeam',
        teamId:this.team._id,
        data:{
          hide:rev
        }
      })
      this.team.hide = rev
    }
  }
}
</script>
<style lang="stylus">
  .team-detail
    font-size 13px
    .team-detail-name
      border-bottom solid 2px gray
      border-left solid 5px gray
    .new-users
      vertical-align top
    .user-icon
      display inline-block
      height 32px
      width 32px
      border-radius 2px
      overflow hidden
    .users
      height 500px
      overflow-y scroll
    .user
      border-bottom solid 1px gray
      .user-icon
        background-color rgb(200,200,200)
      span
        vertical-align middle
        display inline-block
      .user-name
        width 80px
      .user-account
        width 80px
      .last-login
        width 145px
</style>

