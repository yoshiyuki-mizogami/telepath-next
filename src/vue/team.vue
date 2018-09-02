<style lang="stylus">
.teams
  .team
    cursor pointer
    transition background .3s ease
    margin-bottom 1px
    text-align center
    padding 2px
    border-left solid 5px white
    .icon-user
      color gray
</style>
<template>
  <div v-show="show || selected" @click="toggleSelect" class="team" :class="{selected}"
       @contextmenu.stop="popupTeamMenu"
       :style="{'border-left-color':team.color}">
    <span class="icon-user" v-if="team.ours"/>
    {{ team.name }}
  </div>
</template>
<script>
import el from 'electron'
import gev from '../js/g-event'
import globals from '../js/globals'
import path from 'path'
const {remote:{Menu}} = el
export default {
  name:'TeamModel',
  props:{
    team:{
      type:Object,
      required:true
    }
  },
  data(){
    return {
      selected:false,
      show:true
    }
  },
  watch:{
    selected(v){
      if(v){
        return gev.$emit('add-selected', this.team)
      }
      return gev.$emit('remove-selected', this.team)
    }
  },
  created(){
    gev.$on('filter-team', this.setFilter)
    gev.$on('restore-favorite', this.restoreFavorite)
  },
  methods:{
    restoreFavorite(teams){
      this.selected = teams.includes(this.team._id)
    },
    setFilter(ft){
      if(!ft){
        return this.show = true
      }
      this.show = this.team.name.toLowerCase().includes(ft)
    },
    toggleSelect(){
      this.selected = !this.selected
    },
    popupTeamMenu(){
      Menu.buildFromTemplate([
        {
          label:this.$store.state.ui.SHOW_TEAM_DETAIL,
          icon:path.join(globals.imgDir,'detail._png'),
          click:()=>{
            this.$store.dispatch('requestTeamDetail', this.team._id)
          }
        },
        {
          label:this.$store.state.ui.FILTER_TEAM_NAME,
          icon:path.join(globals.imgDir, 'filter._png'),
          click:()=>{
            gev.$emit('set-search-enter',  this.team.name)
          }
        }
      ]).popup({})
    }
  }
}
</script>
