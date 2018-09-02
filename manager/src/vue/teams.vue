<template>
  <div class="team-content">
    <div class="teams-wrap">
      <div class="team-filter-wrap">
        <input type="text" class="team-filter form-control" placeholder="Filter(Enter)" @keydown.enter="applyFilter">
        <div class="form-inline">
          <input type="text" class="form-control " placeholder="New team name" v-model="addTeamName">
          New team color:<input type="color" style="height:30px;width:80px" class="form-control" v-model="addTeamColor">
          <input type="button" class="btn btn-outline-primary" value="Add" @click="addTeam">
        </div>
      </div>
      <div class="teams">
        <team-model v-for="t in filteredTeams" :team="t" :key="t._id"></team-model>
      </div>
    </div>
    <team-detail></team-detail>
  </div>
</template>
<script>
import {mapState} from 'vuex'
import TeamModel from './team.vue'
import TeamDetail from './team-detail.vue'
const WHITE = '#FFFFFF'
export default {
  data(){
    return {
      addTeamName:'',
      addTeamColor:WHITE,
      teamFilter:''
    }
  },
  components:{
    'team-model':TeamModel,
    'team-detail':TeamDetail
  },
  computed:mapState({
    teams:'teams',
    filteredTeams(){
      let fn = this.teamFilter
      if(!fn){
        return this.teams
      }
      return this.teams.filter((t)=>{
        return t.name.includes(fn)
      })
    }
  }),
  methods:{
    applyFilter(ev){
      let f = ev.target.value
      this.teamFilter = f
    },
    addTeam(){
      if(!this.addTeamName || !this.addTeamColor){
        return
      }
      this.$store.dispatch('addTeam', {
        name:this.addTeamName,
        color:this.addTeamColor
      })
      this.addTeamName = ''
      this.addTeamColor = WHITE
    }
  }
}
</script>
<style lang="stylus">
  .team-content
    width 100%
    height 100%
    .teams-wrap
      float left
      width calc( 100% - 450px )
      height 100%
      .team-filter-wrap
        height 80px
      .teams
        height calc( 100% - 100px )
        overflow-y scroll
    .team-detail
      float left
      width 400px
</style>

