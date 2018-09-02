<template>
  <transition name="layer">
    <div class="layer-cover"  v-if="show">
      <div class="team-selector p-3 rounded bg-white">
        <div>{{message}}<button type="button" class="close" @click="close"><span aria-hidden="true">&times;</span></button></div>
        <div class="form-inline"><input type="text" placeholder="Filter" class="form-control-feedback" @keydown.enter="filterTeam"></div>
        <div class="select-teams">
          <div class="select-team d-inline-block rounded p-1 bg-warning m-1" v-for="t in filteredTeams" @dblclick="selectIt(t)">{{t.name}}</div>
        </div>
      </div>
    </div>
  </transition>
</template>
<style lang="stylus">

.team-selector
  margin 5% auto
  width 800px
  background-color white
  .select-teams
    height 500px
    overflow-y scroll
  .select-team:hover
    transition background-color .3s ease
    cursor pointer
    background-color lightgreen !important
</style>

<script>
import {mapState} from 'vuex'
import gev from '../js/global-event'
export default {
  data(){
    return {
      message:'',
      teamFilter:'',
      show:false,
      clbk:null
    }
  },
  computed:mapState({
    teams:'teams',
    filteredTeams(){
      let tf = this.teamFilter
      if(!tf){
        return this.teams
      }
      return this.teams.filter(t=>{
        return t.name.includes(tf)
      })
    }
  }),
  created(){
    gev.$on('show-team-selector', this.showMe)
  },
  methods:{
    showMe(message, clbk){
      if(!clbk){
        throw new Error('Set relay call must need clbk argument')
      }
      this.message = message
      this.show = true
      this.clbk = clbk
    },
    filterTeam(ev){
      this.teamFilter = ev.target.value
    },
    selectIt(st){
      this.clbk(st)
      this.close()
    },
    close(){
      this.clbk = null
      this.show = false
    }
  }
}
</script>
