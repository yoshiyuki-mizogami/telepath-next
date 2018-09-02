<style lang="stylus">
.selected-teams
  position absolute
  bottom 0
  right 0
  font-size 13px
  width 170px
  padding 5px
  pointer-events none
  max-height 400px
  background-color var(--s-bg)
  border-radius 5px 0px 0px 5px
  box-shadow 0 0 3px gray
  .steam
    border-bottom solid 1px gray
    color var(--s-color)
</style>
<template>
  <div style="position:relative">
    <div class="selected-teams" v-show="selects.length">
      <div class="steam" v-for="s in selects" :key="s._id">{{ s.name }}</div>
    </div>
  </div>
</template>

<script>
import gev from '../js/g-event'
export default {
  data(){
    return {
      selects:[]
    }
  },
  created(){
    gev.$on('add-selected', this.setSelected)
    gev.$on('remove-selected', this.removeSelected)
  },
  methods:{
    setSelected(team){
      this.selects.push(team)
    },
    removeSelected(team){
      const i = this.selects.indexOf(team)
      this.selects.splice(i,1)
    }
  }
}
</script>


