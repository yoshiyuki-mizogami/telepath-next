<template>
  <div class="card" style="width: 230px;float:left;margin:3px" @dblclick="showTeamDetail">
    <div class="card-block p-1">
      <div class="card-title team-title" :style="{'border-color':team.color}">
        {{ team.name }}
        <button v-show="team.users.length === 0" type="button" class="close" @click="remove"><span aria-hidden="true">&times;</span></button>
      </div>
      <div class="card-text">{{ team.users.length }} User(s)</div>
    </div>
  </div>
</template>
<script>
import gev from '../js/global-event'
export default {
  props:{
    team:Object
  },
  methods:{
    showTeamDetail(){
      this.$store.dispatch('getTeamDetail', this.team)
    },
    remove(){
      gev.$emit('show-dialog', `Remove Team ${this.team.name} OK?`,{
        ok:()=>{
          this.$store.dispatch('removeTeam', this.team._id)
        },
        cancelable:true
      })
    }
  }
}
</script>
<style lang="stylus">
  .team-title
    border-left solid 10px white
    border-bottom solid 2px white
    text-indent 5px

</style>
