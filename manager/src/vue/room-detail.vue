<template>
  <div v-if="detail" class="room-detail">
    <div class="room-name" v-if="!renameMode"><div class="form-control" style="width:230px;float:left">{{detail.name}}</div><input type="button" class="btn btn-outline-warning" style="float:right" value="Rename" @click="enterRenameMode"></div>
    <div v-else><input type="text" class="form-control" v-model="newName" ref="renameInput" @keydown.enter="rename" @keydown.esc="renameMode = false"></div>
    <div style="clear:both"></div>
    <div class="room-in-teams">
      <div class="room-in-team" @dblclick="removeTeam(t)"
        v-for="t in detail.teams" :style="{'border-color':t.color}" :key="t._id">
        {{t.name}}
      </div>
    </div>
    <div class="form-inline">
      <div class="o-head">Other teams <input placeholder="filter" class="form-control" @keydown.enter="applyTeamFilter"></div>
    </div>
    <div class="other-teams">
      <div class="other-team" @dblclick="addTeam(t)"
        v-for="t in otherTeams" :key="t._id" :style="{'border-color':t.color}">
        {{t.name}}
      </div>
    </div>
  </div>
</template>
<script>
import {mapState} from 'vuex'

export default {
  data(){
    return {
      teamFilter:'',
      newName:'',
      renameMode:false
    }
  },
  computed:mapState({
    detail:'roomDetail',
    teams:'teams',
    otherTeams(){
      let t = this.teams
      let myt = this.detail.teams
      let exists = myt.reduce((before, current)=>{
        before[current._id] = true
        return before
      },{})
      let tf = this.teamFilter
      return t.filter(t=>{
        return !exists[t._id] && t.name.includes(tf)
      })
    }
  }),
  methods:{
    applyTeamFilter(ev){
      this.teamFilter = ev.target.value
    },
    addTeam(t){
      this.$store.dispatch('addTeamToRoom',{
        roomId:this.detail._id,
        teamId:t._id
      })
    },
    enterRenameMode(){
      this.newName = this.detail.name
      this.renameMode = true
      this.$nextTick(()=>{
        this.$refs.renameInput.select()
      })
    },
    removeTeam(t){
      this.$store.dispatch('removeTeamFromRoom',{
        roomId:this.detail._id,
        teamId:t._id
      })
    },
    rename(){
      let {newName} = this
      if(!newName){
        return gev.$emit('notify', 'Require name')
      }
      this.$store.state.ws.send({
        method:'updateRoom',
        roomId:this.detail._id,
        data:{
          name:newName
        }
      })
      this.detail.name = newName
      this.renameMode = false
    }
  }
}
</script>
<style lang="stylus">
.room-detail
  height 100%
  width 100%
  .room-in-team,.other-team
    cursor pointer
    display inline-block
    border solid 1px white
    border-left solid 15px white
    margin 1px 2px
    padding 2px 15px
  .room-in-teams
    height 300px
    overflow-y scroll
  .other-teams
    height 300px
    overflow-y scroll
    .o-head
      text-align center
      font-weight bold
      background-color rgb(255, 233,233)
</style>
