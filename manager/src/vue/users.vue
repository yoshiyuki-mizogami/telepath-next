<template>
  <div class="users-wrap">
    <div class="user-console">
      <div class="form-inline">
        <input type="text" class="form-control" style="width:550px;" 
               placeholder="Filter(Enter) No input No appear. Split by | for OR search " @keydown.enter="fitSearch">
        <select v-model="connectedFilter" style="width:300px;" class="form-control">
          <option :value="null">Connecting condition</option>
          <option :value="true" style="background-color:rgb(205,255,225)">Connected</option>
          <option :value="false" style="background-color:rgb(205,200,200)">Unconnected</option>
        </select>
      </div>
      <div class="form-inline">
        <input type="text" class="form-control" placeholder="New user account" v-model="addUserAccount">
        <input type="text" class="form-control" placeholder="New username" v-model="addUserName">
        <input type="button" class="btn btn-outline-primary" value="Add" @click="addUser">
        <input type="button" class="btn btn-outline-warning" value="Reload" @click="reload">
        <input v-if="debug" type="button" class="btn btn-outline-danger" value="SetId" @click="setIdsToScriptTarget">
      </div>
      <div class="users-info">
        <span>All:{{ users.length }} </span>
        <span>Connected:{{ users.filter(u=>u.connected).length }}</span>
        <span>Filterd:{{ filterdUsers.length }}</span>
      </div>
    </div>
    <div class="users">
      <a-user v-for="u in filterdUsers" :key="u._id" :user="u"/>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import gev from '../js/global-event'
import User from './user.vue'
export default {
  data(){
    return {
      addUserAccount:'',
      addUserName:'',
      userFilter:'',
      connectedFilter:true
    }
  },
  components:{
    'a-user':User
  },
  computed:{
    filterdUsers(){
      const uf = this.userFilter
      if(!uf){
        return []
      }
      const ss = uf.split('|')
      const connected = this.connectedFilter
      return this.users.filter(u=>{
        const connectCondition = connected===null ? true : connected === u.connected
        return connectCondition && 
          ss.some(uf=>(u.name.includes(uf) || u.account.includes(uf) || (u.version || '').includes(uf)))
      })
    },
    ...mapState({
      debug:'debug',
      users:'users'
    })
  },
  created(){
    this.reload()
  },
  methods:{
    fitSearch(ev){
      const value = ev.target.value
      this.userFilter = value
    },
    addUser(){
      this.addUserAccount = this.addUserAccount.trim()
      this.addUserName = this.addUserName.trim().replace(/\s/g, ' ')
      if(!this.addUserAccount || !this.addUserName){
        return gev.$emit('notify-message', 'Require account and useranme')
      }
      const {addUserName} = this
      if(!/^[^\s]+ [^\s]+$/.test(addUserName)){
        return gev.$emit('notify-message', 'Username require one space for sepalete 姓名.')
      }
      this.$store.dispatch('addUser', {
        name:this.addUserName,
        account:this.addUserAccount,
        pwd:this.addUserAccount
      })
      this.addUserName = 
      this.addUserAccount = ''
    },
    reload(){
      this.$store.dispatch('getAllUsers')
    },
    setIdsToScriptTarget(){
      const ids = this.filterdUsers.map(u=>u._id).join('\n')
      this.$store.commit('setScriptTargets', ids)
    }
  }
}
</script>

<style lang="stylus">
.users-wrap
  height 100%
  width calc( 100% - 200px)
  .user-console
    height 100px
    border-bottom solid 1px gray
  .users
    height calc( 100% - 120px )
    overflow-y scroll
</style>


